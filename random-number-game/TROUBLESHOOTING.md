# 🔧 Dépannage - La connexion ne fonctionne plus

## 🚨 Diagnostic Rapide

### Étape 1 : Ouvrir la console du navigateur

1. Appuyez sur **F12**
2. Allez dans l'onglet **Console**
3. Rafraîchissez la page (**Ctrl+Shift+R**)

### Étape 2 : Identifier le problème

Cherchez ces messages dans la console :

#### ✅ Connexion réussie
```
📡 Hostname détecté: localhost
🔌 Connexion au serveur...
✅ Connecté au serveur
```

#### ❌ Erreurs courantes

**Erreur 1 : "WebSocket connection to 'ws://...' failed"**
```
WebSocket connection to 'ws://192.168.1.39:8000/' failed
```
➡️ Le serveur n'est pas accessible à cette adresse

**Erreur 2 : "NetworkError when attempting to fetch resource"**
```
NetworkError when attempting to fetch resource
```
➡️ Problème de connexion réseau ou CORS

**Erreur 3 : Socket.IO ne se connecte pas**
```
🔌 Connexion au serveur...
(rien d'autre)
```
➡️ Le serveur ne répond pas

## 🔧 Solutions par problème

### Solution 1 : Vérifier que le serveur est démarré

```bash
# Sur la machine serveur
cd server
python main.py

# Ou avec Docker
docker-compose ps
```

Vous devriez voir :
```
==================================================
  SERVEUR GUESSCRAFT - SOCKET.IO v1.0.1
==================================================
```

### Solution 2 : Tester l'accès au serveur

Depuis n'importe quelle machine, testez :

```bash
curl http://localhost:8000        # Si serveur local
curl http://192.168.1.100:8000    # Si serveur distant
```

**Résultat attendu :**
```json
{
  "message": "🎮 GuessCraft API - Serveur Multijoueur",
  "version": "1.0.1",
  "status": "online"
}
```

**Si ça échoue :**
- Le serveur n'est pas démarré
- Le pare-feu bloque le port 8000
- Mauvaise IP

### Solution 3 : Configurer l'URL manuellement

Si la détection automatique échoue, forcez l'URL dans le code.

**Éditez `client/src/main.js` ligne 21 :**

```javascript
// AVANT
const manualUrl = null;

// APRÈS (remplacez par l'IP de votre serveur)
const manualUrl = 'ws://192.168.1.100:8000';
```

**Puis rafraîchissez** (Ctrl+Shift+R)

### Solution 4 : Vider le cache du navigateur

```
1. Ctrl+Shift+Delete
2. Cochez "Images et fichiers en cache"
3. Cliquez sur "Effacer les données"
4. Rafraîchissez (Ctrl+Shift+R)
```

### Solution 5 : Redémarrer tout

```bash
# 1. Arrêter le serveur
Ctrl+C

# 2. Arrêter le client
Ctrl+C

# 3. Redémarrer le serveur
cd server
python main.py

# 4. Redémarrer le client
cd client
npm run dev -- --host

# 5. Rafraîchir le navigateur
Ctrl+Shift+R
```

### Solution 6 : Vérifier le pare-feu

**Windows :**
```powershell
# PowerShell en administrateur
New-NetFirewallRule -DisplayName "GuessCraft Server" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow
```

**Linux :**
```bash
sudo ufw allow 8000/tcp
```

### Solution 7 : Vérifier la configuration réseau

**Serveur et client doivent être sur le même réseau !**

```bash
# Windows
ipconfig

# Linux/Mac
ip addr show
```

Les deux machines doivent avoir des IP dans la même plage (ex: 192.168.1.x)

## 🔍 Checklist de diagnostic

- [ ] Serveur démarré et affiche "Serveur sur http://..."
- [ ] `curl http://[IP_SERVEUR]:8000` fonctionne
- [ ] Console du navigateur ouverte (F12)
- [ ] Message `📡 Hostname détecté:` visible
- [ ] Pas d'erreur WebSocket dans la console
- [ ] Pare-feu autorise le port 8000
- [ ] Client et serveur sur le même réseau
- [ ] Cache du navigateur vidé
- [ ] Page rafraîchie (Ctrl+Shift+R)

## 🎯 Configuration de secours (tout en local)

Si rien ne fonctionne, testez d'abord en local :

```bash
# Terminal 1 : Serveur
cd server
python main.py

# Terminal 2 : Client
cd client
npm run dev
```

Ouvrez `http://localhost:5173` dans le navigateur.

**Si ça fonctionne en local mais pas en réseau :**
➡️ Problème de configuration réseau ou pare-feu

**Si ça ne fonctionne même pas en local :**
➡️ Problème de code ou de dépendances

## 📊 Messages de la console à surveiller

### Messages normaux (tout va bien)
```
📡 Hostname détecté: localhost
📡 Mode développement local: ws://localhost:8000
🔌 Connexion au serveur...
✅ Connecté au serveur
📊 Fetching stats from: http://localhost:8000/api/stats
```

### Messages d'erreur
```
❌ Erreur stats: NetworkError
WebSocket connection failed
⚠️ import.meta.env non disponible
```

## 🆘 Dernière solution : Réinitialisation complète

```bash
# 1. Supprimer node_modules
cd client
rm -rf node_modules
rm package-lock.json

# 2. Réinstaller
npm install

# 3. Redémarrer
npm run dev

# 4. Vérifier le serveur
cd ../server
python main.py
```

## 💡 Besoin d'aide ?

**Partagez ces informations :**

1. **Message exact de la console** (F12)
2. **Résultat de** `curl http://[IP_SERVEUR]:8000`
3. **Configuration** :
   - IP du serveur : ?
   - IP du client : ?
   - Même machine ou différente ?
4. **Système d'exploitation** : Windows/Linux/Mac ?

---

**La plupart des problèmes sont résolus en redémarrant le serveur et le client, puis en rafraîchissant le navigateur !**
