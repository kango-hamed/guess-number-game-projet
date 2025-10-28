# 🌐 Accès Réseau Local - GuessCraft

## 📍 Configuration actuelle

- **IP de votre machine :** `192.168.1.39`
- **Port du serveur :** `8000`
- **Serveur Docker :** ✅ Actif et accessible

---

## 🔧 Configuration requise (une seule fois)

### 1. Autoriser le port dans le pare-feu Windows

**Ouvrez PowerShell en tant qu'administrateur** et exécutez :

```powershell
New-NetFirewallRule -DisplayName "GuessCraft Docker Server" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow -Profile Private,Domain
```

✅ Cette commande autorise les connexions entrantes sur le port 8000.

---

## 🎮 Jouer depuis un autre appareil

### Option 1 : Accès direct au serveur (API uniquement)

Les autres appareils peuvent accéder à l'API du serveur :

```
http://192.168.1.39:8000
```

**Test depuis un autre appareil :**
- Ouvrez un navigateur
- Allez sur `http://192.168.1.39:8000`
- Vous devriez voir le message JSON du serveur

### Option 2 : Client web complet

#### Sur votre machine (192.168.1.39)

1. **Le serveur Docker tourne déjà** ✅

2. **Démarrez le client Vite** :
   ```bash
   cd client
   npm install  # Si pas encore fait
   npm run dev -- --host
   ```

3. **Le client sera accessible sur :**
   ```
   http://192.168.1.39:5173
   ```

#### Configuration automatique

Le fichier `client/.env` est déjà configuré :
```env
VITE_SERVER_URL=ws://192.168.1.39:8000
```

Le client se connectera automatiquement au serveur Docker !

#### Sur les autres appareils

1. **Connectez-vous au même WiFi** que la machine serveur
2. **Ouvrez un navigateur**
3. **Allez sur :** `http://192.168.1.39:5173`
4. **Jouez !** 🎮

---

## ✅ Checklist de vérification

### Sur la machine serveur (192.168.1.39)

- [ ] Docker Desktop est lancé
- [ ] Serveur Docker actif : `docker-compose ps`
- [ ] Pare-feu configuré (commande PowerShell admin)
- [ ] Client Vite démarré : `npm run dev -- --host`

### Test de connectivité

Depuis un autre appareil sur le même réseau :

```bash
# Test 1 : Ping
ping 192.168.1.39

# Test 2 : API serveur (dans un navigateur)
http://192.168.1.39:8000

# Test 3 : Client web (dans un navigateur)
http://192.168.1.39:5173
```

---

## 🐛 Dépannage

### Le serveur ne répond pas depuis un autre appareil

1. **Vérifiez que vous êtes sur le même réseau WiFi**
   ```bash
   # Sur l'autre appareil
   ping 192.168.1.39
   ```

2. **Vérifiez le pare-feu Windows**
   ```powershell
   Get-NetFirewallRule -DisplayName "*GuessCraft*"
   ```

3. **Vérifiez que Docker écoute bien**
   ```bash
   docker port guesscraft-server
   # Devrait afficher : 8000/tcp -> 0.0.0.0:8000
   ```

4. **Désactivez temporairement le pare-feu pour tester**
   - Panneau de configuration → Pare-feu Windows
   - Désactiver (réseau privé uniquement)
   - Testez la connexion
   - Réactivez et configurez la règle correctement

### Le client ne se connecte pas au serveur

1. **Vérifiez le fichier `.env`**
   ```bash
   cat client/.env
   # Devrait contenir : VITE_SERVER_URL=ws://192.168.1.39:8000
   ```

2. **Redémarrez le client Vite**
   ```bash
   # Ctrl+C pour arrêter
   npm run dev -- --host
   ```

3. **Vérifiez la console du navigateur (F12)**
   - Cherchez les erreurs de connexion WebSocket
   - Vérifiez l'URL de connexion utilisée

### L'IP a changé

Si votre IP change (après redémarrage, changement de réseau) :

1. **Trouvez la nouvelle IP**
   ```bash
   ipconfig
   ```

2. **Mettez à jour le fichier `.env`**
   ```bash
   echo "VITE_SERVER_URL=ws://[NOUVELLE_IP]:8000" > client/.env
   ```

3. **Redémarrez le client**

---

## 🚀 Commandes rapides

### Démarrer tout

```bash
# Terminal 1 : Serveur Docker
docker-compose up -d

# Terminal 2 : Client Vite
cd client
npm run dev -- --host
```

### Arrêter tout

```bash
# Arrêter le client : Ctrl+C dans le terminal

# Arrêter le serveur Docker
docker-compose stop
```

### Voir les logs

```bash
# Logs du serveur Docker
docker-compose logs -f

# Logs du client Vite
# Visibles dans le terminal où il tourne
```

---

## 📱 Accès depuis mobile

Même principe ! Sur votre téléphone/tablette :

1. **Connectez-vous au même WiFi**
2. **Ouvrez le navigateur**
3. **Allez sur :** `http://192.168.1.39:5173`
4. **Jouez !** 🎮

---

## 🔒 Sécurité

⚠️ **Important :**
- Cette configuration est pour un **réseau local privé** uniquement
- Ne pas exposer sur Internet sans sécurité supplémentaire
- Le pare-feu autorise uniquement les réseaux privés/domaine

---

**Bon jeu ! 🎮**
