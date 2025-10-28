# 🚨 Solution Rapide - Connexion Serveur Échouée

## Votre Problème

Les joueurs accèdent au client sur `http://192.168.1.39:5173/` mais ne se connectent pas au serveur.

## 🎯 Cause

Le client essaie de se connecter au serveur sur `ws://192.168.1.39:8000`, mais le serveur est probablement sur une **autre machine** (ou n'est pas démarré).

## ✅ Solution en 3 étapes

### Étape 1 : Trouver l'IP du serveur

Sur la machine où tourne le serveur :

**Windows :**
```bash
ipconfig
# Cherchez "Adresse IPv4"
```

**Linux/Mac :**
```bash
ip addr show
# ou
ifconfig
```

Notez l'IP (ex: `192.168.1.100`)

### Étape 2 : Configurer le client

Sur la machine où tourne le client (`192.168.1.39`), deux options :

#### Option A : Script automatique (recommandé)

```bash
cd client
configure-server.bat  # Windows
# ou
./configure-server.sh  # Linux/Mac
```

Entrez l'IP du serveur quand demandé.

#### Option B : Manuel

Créez le fichier `client/.env` :

```env
VITE_SERVER_URL=ws://192.168.1.100:8000
```

(Remplacez `192.168.1.100` par l'IP de votre serveur)

### Étape 3 : Redémarrer le client

```bash
# Arrêtez Vite (Ctrl+C)
# Relancez
npm run dev -- --host
```

## 🔍 Vérification

1. **Ouvrez la console du navigateur** (F12)
2. **Rafraîchissez la page** (Ctrl+Shift+R)
3. **Cherchez le message** :
   ```
   📡 Utilisation de VITE_SERVER_URL: ws://192.168.1.100:8000
   ```

Si vous voyez ce message avec la bonne IP, c'est bon ! ✅

## 🐛 Ça ne marche toujours pas ?

### Vérifiez que le serveur est accessible

```bash
curl http://[IP_DU_SERVEUR]:8000
# Exemple : curl http://192.168.1.100:8000
```

Devrait retourner :
```json
{
  "message": "🎮 GuessCraft API - Serveur Multijoueur",
  ...
}
```

### Si curl échoue :

1. **Vérifiez que le serveur est démarré**
   ```bash
   # Sur la machine serveur
   python main.py
   # ou
   docker-compose ps
   ```

2. **Vérifiez le pare-feu**
   ```powershell
   # Windows (PowerShell en admin)
   New-NetFirewallRule -DisplayName "GuessCraft" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow
   ```

3. **Vérifiez que vous êtes sur le même réseau**
   - Les deux machines doivent être sur le même WiFi/réseau local

## 📋 Checklist Rapide

- [ ] Serveur démarré et IP notée
- [ ] Fichier `.env` créé dans `client/`
- [ ] `VITE_SERVER_URL` configuré
- [ ] Client Vite redémarré
- [ ] Console du navigateur vérifiée
- [ ] Message `📡 Utilisation de VITE_SERVER_URL` visible
- [ ] Test curl réussi

## 💡 Alternative : Tout sur la même machine

Si c'est trop compliqué, hébergez le client ET le serveur sur la même machine :

```bash
# Machine 192.168.1.100
# Terminal 1
cd server
python main.py

# Terminal 2
cd client
npm run dev -- --host
```

Les joueurs accèdent à `http://192.168.1.100:5173` et tout fonctionne automatiquement ! ✨

---

**Besoin d'aide ?** Consultez [NETWORK_SETUP.md](NETWORK_SETUP.md) pour plus de détails.
