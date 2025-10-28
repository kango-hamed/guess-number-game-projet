# 🐳 Déploiement Docker - GuessCraft Server

Ce guide explique comment déployer le serveur GuessCraft dans un conteneur Docker.

## 📋 Prérequis

### Installation de Docker

#### Windows
1. Téléchargez [Docker Desktop pour Windows](https://www.docker.com/products/docker-desktop/)
2. Installez Docker Desktop
3. Redémarrez votre ordinateur
4. Vérifiez l'installation :
```bash
docker --version
docker-compose --version
```

#### Linux (Ubuntu/Debian)
```bash
# Mettre à jour les paquets
sudo apt-get update

# Installer les dépendances
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common

# Ajouter la clé GPG officielle de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Ajouter le dépôt Docker
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installer Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER

# Redémarrer la session ou exécuter
newgrp docker

# Vérifier l'installation
docker --version
docker compose version
```

#### macOS
1. Téléchargez [Docker Desktop pour Mac](https://www.docker.com/products/docker-desktop/)
2. Installez Docker Desktop
3. Lancez Docker Desktop
4. Vérifiez l'installation :
```bash
docker --version
docker-compose --version
```

## 🚀 Déploiement Rapide

### Méthode 1 : Docker Compose (Recommandé)

C'est la méthode la plus simple !

```bash
# Se placer à la racine du projet
cd random-number-game

# Construire et démarrer le conteneur
docker-compose up -d

# Vérifier que le conteneur fonctionne
docker-compose ps

# Voir les logs
docker-compose logs -f guesscraft-server
```

Le serveur est maintenant accessible sur `http://localhost:8000` !

### Méthode 2 : Docker CLI

Si vous préférez utiliser Docker directement :

```bash
# Se placer dans le dossier server
cd server

# Construire l'image
docker build -t guesscraft-server:latest .

# Lancer le conteneur
docker run -d \
  --name guesscraft-server \
  -p 8000:8000 \
  --restart unless-stopped \
  guesscraft-server:latest

# Vérifier que le conteneur fonctionne
docker ps

# Voir les logs
docker logs -f guesscraft-server
```

## 🔧 Commandes Utiles

### Gestion du conteneur

```bash
# Démarrer le conteneur
docker-compose start

# Arrêter le conteneur
docker-compose stop

# Redémarrer le conteneur
docker-compose restart

# Arrêter et supprimer le conteneur
docker-compose down

# Arrêter et supprimer le conteneur + volumes
docker-compose down -v

# Reconstruire l'image
docker-compose build

# Reconstruire et redémarrer
docker-compose up -d --build
```

### Logs et débogage

```bash
# Voir les logs en temps réel
docker-compose logs -f

# Voir les 100 dernières lignes
docker-compose logs --tail=100

# Voir les logs d'un service spécifique
docker-compose logs -f guesscraft-server

# Accéder au shell du conteneur
docker-compose exec guesscraft-server /bin/bash

# Ou avec sh si bash n'est pas disponible
docker-compose exec guesscraft-server /bin/sh
```

### Informations sur le conteneur

```bash
# Voir les conteneurs en cours d'exécution
docker-compose ps

# Voir les statistiques (CPU, RAM, etc.)
docker stats guesscraft-server

# Inspecter le conteneur
docker inspect guesscraft-server

# Voir les processus dans le conteneur
docker-compose top
```

## 🌐 Configuration Réseau

### Accès depuis le réseau local

Le conteneur expose le port 8000. Pour permettre l'accès depuis d'autres machines :

1. **Vérifiez que le port est bien mappé** :
```bash
docker port guesscraft-server
# Devrait afficher : 8000/tcp -> 0.0.0.0:8000
```

2. **Trouvez l'IP de votre machine** :

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

3. **Configurez le client** pour utiliser cette IP :
```javascript
// client/src/main.js
SERVER_URL: 'ws://[VOTRE_IP]:8000'
```

4. **Autorisez le port dans le pare-feu** (Windows) :
```powershell
New-NetFirewallRule -DisplayName "GuessCraft Docker" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow
```

### Changer le port

Si le port 8000 est déjà utilisé, modifiez `docker-compose.yml` :

```yaml
services:
  guesscraft-server:
    ports:
      - "9000:8000"  # Port externe:Port interne
```

Puis redémarrez :
```bash
docker-compose down
docker-compose up -d
```

## 📊 Monitoring

### Health Check

Le conteneur inclut un health check automatique :

```bash
# Vérifier l'état de santé
docker inspect --format='{{.State.Health.Status}}' guesscraft-server

# Voir l'historique des health checks
docker inspect --format='{{json .State.Health}}' guesscraft-server | jq
```

### Tester manuellement

```bash
# Test de l'API
curl http://localhost:8000

# Test des stats
curl http://localhost:8000/api/stats

# Test de santé
curl http://localhost:8000/api/health
```

## 🔄 Mise à jour

### Après modification du code

```bash
# Reconstruire l'image
docker-compose build

# Redémarrer avec la nouvelle image
docker-compose up -d

# Ou en une seule commande
docker-compose up -d --build
```

### Mise à jour des dépendances

Si vous modifiez `requirements.txt` :

```bash
# Reconstruire sans cache
docker-compose build --no-cache

# Redémarrer
docker-compose up -d
```

## 🐛 Dépannage

### Le conteneur ne démarre pas

```bash
# Voir les logs d'erreur
docker-compose logs guesscraft-server

# Vérifier si le port est déjà utilisé
netstat -ano | findstr :8000  # Windows
lsof -i :8000                  # Linux/Mac

# Reconstruire complètement
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Erreur "port already allocated"

Un autre service utilise le port 8000. Solutions :

1. **Arrêter l'autre service**
2. **Changer le port** dans `docker-compose.yml`
3. **Trouver et tuer le processus** :
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID [PID] /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Le conteneur redémarre en boucle

```bash
# Voir pourquoi il redémarre
docker-compose logs --tail=50 guesscraft-server

# Désactiver le restart automatique temporairement
docker update --restart=no guesscraft-server

# Démarrer en mode interactif pour déboguer
docker-compose run --rm guesscraft-server /bin/bash
```

### Problèmes de connexion réseau

```bash
# Vérifier les réseaux Docker
docker network ls

# Inspecter le réseau
docker network inspect guesscraft-network

# Recréer le réseau
docker-compose down
docker network prune
docker-compose up -d
```

## 🚀 Déploiement en Production

### Variables d'environnement

Créez un fichier `.env` à la racine :

```env
# .env
PORT=8000
PYTHONUNBUFFERED=1
MAX_LEVELS=5
```

Modifiez `docker-compose.yml` :

```yaml
services:
  guesscraft-server:
    env_file:
      - .env
```

### Volumes pour la persistance

Si vous voulez sauvegarder des données :

```yaml
services:
  guesscraft-server:
    volumes:
      - ./data:/app/data
```

### Limites de ressources

Pour limiter l'utilisation des ressources :

```yaml
services:
  guesscraft-server:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Logs

Pour gérer les logs en production :

```yaml
services:
  guesscraft-server:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 📦 Déploiement sur un serveur distant

### Via Docker Hub

1. **Créer un compte sur [Docker Hub](https://hub.docker.com/)**

2. **Se connecter** :
```bash
docker login
```

3. **Tag l'image** :
```bash
docker tag guesscraft-server:latest votre-username/guesscraft-server:latest
```

4. **Push l'image** :
```bash
docker push votre-username/guesscraft-server:latest
```

5. **Sur le serveur distant** :
```bash
docker pull votre-username/guesscraft-server:latest
docker run -d -p 8000:8000 --name guesscraft votre-username/guesscraft-server:latest
```

### Via fichier tar

1. **Sauvegarder l'image** :
```bash
docker save guesscraft-server:latest > guesscraft-server.tar
```

2. **Transférer le fichier** (scp, ftp, etc.)

3. **Sur le serveur distant** :
```bash
docker load < guesscraft-server.tar
docker run -d -p 8000:8000 --name guesscraft guesscraft-server:latest
```

## 🔒 Sécurité

### Bonnes pratiques

1. **Ne pas exécuter en tant que root** (déjà configuré dans le Dockerfile)
2. **Limiter les ressources** (voir section Production)
3. **Utiliser HTTPS** en production (avec un reverse proxy comme Nginx)
4. **Mettre à jour régulièrement** l'image de base
5. **Scanner les vulnérabilités** :
```bash
docker scan guesscraft-server:latest
```

### Reverse Proxy (Nginx)

Exemple de configuration Nginx pour HTTPS :

```nginx
server {
    listen 443 ssl http2;
    server_name guesscraft.example.com;

    ssl_certificate /etc/ssl/certs/guesscraft.crt;
    ssl_certificate_key /etc/ssl/private/guesscraft.key;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [FastAPI in Docker](https://fastapi.tiangolo.com/deployment/docker/)

## ✅ Checklist de déploiement

- [ ] Docker installé et fonctionnel
- [ ] Image construite avec succès
- [ ] Conteneur démarre sans erreur
- [ ] API accessible sur http://localhost:8000
- [ ] Health check passe (vert)
- [ ] Logs propres sans erreur
- [ ] Client peut se connecter
- [ ] Pare-feu configuré si nécessaire
- [ ] Backup de l'image créé
- [ ] Documentation à jour

---

**Bon déploiement ! 🐳**
