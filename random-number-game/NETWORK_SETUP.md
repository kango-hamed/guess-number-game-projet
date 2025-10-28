# 🌐 Configuration Réseau - Client et Serveur sur Machines Différentes

Ce guide explique comment configurer GuessCraft quand le **client** et le **serveur** sont sur des machines différentes.

## 📍 Scénario

- **Machine A (192.168.1.100)** : Serveur GuessCraft
- **Machine B (192.168.1.39)** : Client Vite (dev server)
- **Machine C, D, E...** : Autres joueurs qui accèdent au client sur la Machine B

## 🎯 Problème

Quand les joueurs accèdent au client via `http://192.168.1.39:5173`, le client essaie de se connecter au serveur sur `ws://192.168.1.39:8000`, mais le serveur est en réalité sur `192.168.1.100:8000`.

## ✅ Solution 1 : Variable d'environnement (Recommandé)

### Étape 1 : Créer le fichier .env

Sur la **Machine B** (client), créez le fichier `client/.env` :

```bash
cd client
# Copiez le fichier exemple
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac
```

### Étape 2 : Configurer l'URL du serveur

Éditez `client/.env` et ajoutez l'IP de la Machine A (serveur) :

```env
# URL du serveur WebSocket (Machine A)
VITE_SERVER_URL=ws://192.168.1.100:8000
```

### Étape 3 : Redémarrer le client

```bash
# Arrêtez le serveur Vite (Ctrl+C)
# Relancez-le
npm run dev -- --host
```

### Étape 4 : Vérifier

Ouvrez la console du navigateur (F12) et vous devriez voir :
```
📡 Utilisation de VITE_SERVER_URL: ws://192.168.1.100:8000
```

## ✅ Solution 2 : URL manuelle dans le code

Si vous ne voulez pas utiliser de fichier `.env`, modifiez directement `client/src/main.js` :

### Ligne 17-18, décommentez et modifiez :

```javascript
// Avant (commenté)
// const manualUrl = 'ws://192.168.1.100:8000';
const manualUrl = null;

// Après (décommenté et modifié)
const manualUrl = 'ws://192.168.1.100:8000';  // IP du serveur
```

Puis **rafraîchissez le navigateur** (Ctrl+Shift+R).

## ✅ Solution 3 : Client et Serveur sur la même machine

Si vous voulez éviter cette configuration, hébergez le client et le serveur sur la **même machine** :

### Machine A (192.168.1.100) :

```bash
# Terminal 1 : Serveur
cd server
python main.py

# Terminal 2 : Client
cd client
npm run dev -- --host
```

Les joueurs accèdent alors à `http://192.168.1.100:5173` et le client détecte automatiquement que le serveur est sur la même IP.

## 🔍 Diagnostic

### Vérifier l'URL utilisée par le client

1. Ouvrez la console du navigateur (F12)
2. Cherchez les messages commençant par `📡`
3. Vous devriez voir :
   ```
   📡 Hostname détecté: 192.168.1.39
   📡 Détection automatique (même machine): ws://192.168.1.39:8000
   ```

Si le serveur est sur une autre machine, cette détection automatique est **incorrecte**.

### Tester la connexion au serveur

Depuis n'importe quelle machine du réseau :

```bash
# Tester l'API REST
curl http://192.168.1.100:8000

# Devrait retourner :
{
  "message": "🎮 GuessCraft API - Serveur Multijoueur",
  "version": "1.0.1",
  "status": "online"
}
```

Si ça ne fonctionne pas :
- Vérifiez que le serveur est démarré
- Vérifiez le pare-feu (port 8000)
- Vérifiez que vous êtes sur le même réseau

## 📊 Tableau récapitulatif

| Scénario | Configuration |
|----------|---------------|
| **Client et serveur sur même machine** | Aucune config nécessaire (détection auto) |
| **Client et serveur sur machines différentes** | Fichier `.env` avec `VITE_SERVER_URL` |
| **Développement local** | `ws://localhost:8000` (par défaut) |
| **Production** | Variable d'environnement ou build avec l'IP |

## 🚀 Configuration complète - Exemple

### Machine A (192.168.1.100) - Serveur

```bash
# Démarrer le serveur
cd server
python main.py

# Ou avec Docker
docker-compose up -d
```

### Machine B (192.168.1.39) - Client

```bash
# Créer le fichier .env
cd client
echo VITE_SERVER_URL=ws://192.168.1.100:8000 > .env

# Démarrer le client en mode réseau
npm run dev -- --host
```

### Machines C, D, E... - Joueurs

1. Ouvrir le navigateur
2. Aller sur `http://192.168.1.39:5173`
3. Jouer !

Le client se connectera automatiquement au serveur sur `192.168.1.100:8000`.

## 🐛 Problèmes courants

### "WebSocket connection failed"

**Cause** : Le client ne peut pas atteindre le serveur

**Solutions** :
1. Vérifiez que `VITE_SERVER_URL` pointe vers la bonne IP
2. Vérifiez que le serveur est démarré
3. Testez avec `curl http://[IP_SERVEUR]:8000`
4. Vérifiez le pare-feu sur la machine serveur

### Le client se connecte à la mauvaise IP

**Cause** : Détection automatique incorrecte

**Solution** : Utilisez le fichier `.env` ou l'URL manuelle

### "NetworkError when attempting to fetch resource"

**Cause** : Problème CORS ou serveur inaccessible

**Solutions** :
1. Vérifiez que le serveur accepte les connexions (CORS configuré)
2. Vérifiez l'URL dans la console (F12)
3. Testez l'API REST avec curl

## 💡 Conseils

### Pour le développement

Utilisez le fichier `.env` - c'est plus flexible et ne nécessite pas de modifier le code.

### Pour la production

Créez un build du client avec l'URL du serveur :

```bash
# Créer .env.production
echo VITE_SERVER_URL=ws://[IP_PRODUCTION]:8000 > .env.production

# Build
npm run build

# Le build utilisera automatiquement .env.production
```

### Pour tester rapidement

Utilisez l'URL manuelle dans le code (ligne 17 de `main.js`), c'est plus rapide pour tester.

## 📝 Checklist

- [ ] Serveur démarré et accessible
- [ ] IP du serveur notée (ex: 192.168.1.100)
- [ ] Fichier `.env` créé dans `client/`
- [ ] `VITE_SERVER_URL` configuré avec l'IP du serveur
- [ ] Client redémarré après modification du `.env`
- [ ] Console du navigateur vérifiée (F12)
- [ ] Message `📡 Utilisation de VITE_SERVER_URL` visible
- [ ] Connexion réussie au serveur

---

**Bon jeu en réseau ! 🎮**
