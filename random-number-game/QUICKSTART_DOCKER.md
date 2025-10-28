# 🚀 Démarrage Rapide avec Docker

Guide ultra-rapide pour démarrer GuessCraft avec Docker en 5 minutes !

## ⚡ Installation Express

### 1. Installer Docker

**Windows :**
- Téléchargez [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Installez et redémarrez
- Lancez Docker Desktop

**Linux (Ubuntu) :**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

**Mac :**
- Téléchargez [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Installez et lancez

### 2. Vérifier l'installation

```bash
docker --version
docker-compose --version
```

## 🎮 Lancer le Jeu

### Méthode 1 : Script automatique (Windows)

Double-cliquez sur `docker-start.bat` !

### Méthode 2 : Ligne de commande

```bash
# À la racine du projet
docker-compose up -d
```

C'est tout ! Le serveur démarre automatiquement.

## ✅ Vérifier que ça fonctionne

1. **Ouvrez votre navigateur** : http://localhost:8000
   
   Vous devriez voir :
   ```json
   {
     "message": "🎮 GuessCraft API - Serveur Multijoueur",
     "version": "1.0.1",
     "status": "online"
   }
   ```

2. **Testez les stats** : http://localhost:8000/api/stats

3. **Voir les logs** :
   ```bash
   docker-compose logs -f
   ```

## 🎯 Lancer le Client

```bash
cd client
npm install
npm run dev
```

Ouvrez http://localhost:5173 et jouez !

## 🛑 Arrêter le Serveur

```bash
# Arrêter
docker-compose stop

# Ou supprimer complètement
docker-compose down
```

## 🌐 Jouer en Réseau

1. **Trouvez votre IP** :
   ```bash
   # Windows
   ipconfig
   
   # Linux/Mac
   ip addr show
   ```

2. **Configurez le client** (`client/src/main.js`) :
   ```javascript
   SERVER_URL: 'ws://[VOTRE_IP]:8000'
   ```

3. **Autorisez le port 8000** dans le pare-feu

4. **Les autres joueurs** accèdent via votre IP !

## 🐛 Problèmes ?

### Le conteneur ne démarre pas
```bash
# Voir les erreurs
docker-compose logs

# Reconstruire
docker-compose build --no-cache
docker-compose up -d
```

### Port déjà utilisé
Modifiez le port dans `docker-compose.yml` :
```yaml
ports:
  - "9000:8000"  # Utilisez 9000 au lieu de 8000
```

### Docker Desktop n'est pas lancé
- Lancez Docker Desktop
- Attendez qu'il soit complètement démarré (icône verte)

## 📚 Besoin de plus d'infos ?

- **Guide complet Docker** : [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)
- **Guide réseau** : [NETWORK_ACCESS.md](NETWORK_ACCESS.md)
- **README principal** : [README.md](README.md)

## 🎉 C'est parti !

Vous êtes prêt à jouer ! Le serveur tourne dans Docker, le client dans votre navigateur.

**Commandes essentielles :**
```bash
docker-compose up -d      # Démarrer
docker-compose logs -f    # Voir les logs
docker-compose stop       # Arrêter
docker-compose restart    # Redémarrer
docker-compose down       # Supprimer
```

Bon jeu ! 🎮
