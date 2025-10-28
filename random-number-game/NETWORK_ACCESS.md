# 🌐 Accès Réseau - GuessCraft

Ce guide explique comment permettre à d'autres machines de votre réseau local de se connecter au serveur GuessCraft.

## ✅ Configuration du Serveur

Le serveur est déjà configuré pour accepter les connexions réseau ! Il écoute sur `0.0.0.0:8000`, ce qui signifie qu'il accepte les connexions de toutes les interfaces réseau.

### Démarrer le serveur

```bash
cd server
python main.py
```

Le serveur affichera automatiquement :
- L'adresse locale (127.0.0.1)
- **L'adresse IP réseau** (ex: 192.168.1.100)

Notez l'adresse IP réseau affichée !

## 🔧 Configuration du Client

Pour qu'un client sur une autre machine se connecte au serveur, vous devez modifier la configuration dans le fichier client.

### Option 1 : Modifier directement main.js (recommandé)

1. Ouvrez `client/src/main.js`
2. Trouvez la section `CONFIG` au début du fichier (ligne 2-8)
3. Remplacez `localhost` par l'adresse IP du serveur :

```javascript
const CONFIG = {
    // Remplacez localhost par l'IP du serveur (ex: 192.168.1.100)
    SERVER_URL: 'ws://192.168.1.100:8000',
    RECONNECT_ATTEMPTS: 5,
    RECONNECT_DELAY: 2000
};
```

### Option 2 : Créer un fichier config.js (avancé)

1. Créez `client/src/config.js` :

```javascript
export const CONFIG = {
    SERVER_URL: 'ws://192.168.1.100:8000',  // Remplacez par l'IP du serveur
    RECONNECT_ATTEMPTS: 5,
    RECONNECT_DELAY: 2000
};
```

2. Modifiez `main.js` pour importer la config :

```javascript
import { CONFIG } from './config.js';
```

## 🔥 Pare-feu Windows

Si les clients ne peuvent pas se connecter, vous devez autoriser le port 8000 dans le pare-feu Windows :

### Méthode 1 : Interface graphique

1. Ouvrez **Panneau de configuration** → **Système et sécurité** → **Pare-feu Windows Defender**
2. Cliquez sur **Paramètres avancés**
3. Cliquez sur **Règles de trafic entrant** → **Nouvelle règle**
4. Sélectionnez **Port** → **Suivant**
5. Sélectionnez **TCP** et entrez **8000** → **Suivant**
6. Sélectionnez **Autoriser la connexion** → **Suivant**
7. Cochez toutes les cases (Domaine, Privé, Public) → **Suivant**
8. Nommez la règle "GuessCraft Server" → **Terminer**

### Méthode 2 : Ligne de commande (PowerShell en admin)

```powershell
New-NetFirewallRule -DisplayName "GuessCraft Server" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow
```

## 📱 Accès depuis un téléphone/tablette

1. Assurez-vous que votre appareil mobile est sur le **même réseau WiFi**
2. Ouvrez le navigateur sur l'appareil
3. Accédez à `http://[IP_DU_SERVEUR]:5173` (pour le client Vite)
4. Le client se connectera automatiquement au serveur si la configuration est correcte

## 🧪 Test de connexion

### Vérifier que le serveur est accessible

Depuis une autre machine du réseau, ouvrez un navigateur et accédez à :
```
http://[IP_DU_SERVEUR]:8000
```

Vous devriez voir :
```json
{
  "message": "🎮 GuessCraft API - Serveur Multijoueur",
  "version": "1.0.1",
  "status": "online"
}
```

### Vérifier les statistiques

```
http://[IP_DU_SERVEUR]:8000/api/stats
```

Devrait retourner :
```json
{
  "total_players": 0,
  "active_rooms": 0,
  "total_games_played": 0
}
```

## 🚀 Déployer le client pour l'accès réseau

### Option 1 : Utiliser Vite en mode réseau

```bash
cd client
npm run dev -- --host
```

Vite affichera :
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
```

Les autres machines peuvent accéder au client via l'URL Network !

### Option 2 : Build et servir avec un serveur HTTP

```bash
cd client
npm run build
npx serve -s dist -l 5173
```

## 📋 Checklist de déploiement réseau

- [ ] Serveur démarré et affiche l'IP réseau
- [ ] Pare-feu configuré pour autoriser le port 8000
- [ ] Client configuré avec la bonne IP serveur
- [ ] Client accessible via Vite en mode `--host`
- [ ] Test de connexion réussi depuis une autre machine
- [ ] Toutes les machines sur le même réseau local

## ⚠️ Problèmes courants

### "NetworkError when attempting to fetch resource"
- Vérifiez que le pare-feu autorise le port 8000
- Vérifiez que l'IP dans CONFIG est correcte
- Vérifiez que le serveur est bien démarré

### "WebSocket connection failed"
- Vérifiez que vous utilisez `ws://` et non `wss://`
- Vérifiez que le port 8000 est accessible
- Essayez de désactiver temporairement le pare-feu pour tester

### Le client se connecte mais ne reçoit pas de données
- Vérifiez la configuration CORS du serveur
- Vérifiez que toutes les machines sont sur le même réseau
- Redémarrez le serveur et le client

## 🎮 Exemple de configuration complète

**Machine serveur (192.168.1.100):**
```bash
cd server
python main.py
```

**Machine cliente 1 (192.168.1.101):**
```javascript
// client/src/main.js
const CONFIG = {
    SERVER_URL: 'ws://192.168.1.100:8000',
    // ...
};
```

**Machine cliente 2 (192.168.1.102):**
```javascript
// client/src/main.js
const CONFIG = {
    SERVER_URL: 'ws://192.168.1.100:8000',
    // ...
};
```

Les deux clients peuvent maintenant jouer ensemble ! 🎉
