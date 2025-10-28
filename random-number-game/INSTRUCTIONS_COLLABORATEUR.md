# 🎮 GuessCraft - Instructions d'installation

## Prérequis

1. **Docker Desktop** installé
   - Windows : https://www.docker.com/products/docker-desktop/
   - Redémarrez après l'installation

## Installation

### 1. Décompresser le ZIP

Extrayez `guesscraft-game.zip` dans un dossier de votre choix.

### 2. Démarrer le serveur avec Docker

Ouvrez PowerShell/Terminal dans le dossier extrait et exécutez :

```bash
docker-compose up -d --build
```

**Temps de build :** ~2-3 minutes la première fois

### 3. Vérifier que ça fonctionne

```bash
# Voir si le conteneur tourne
docker-compose ps

# Devrait afficher "healthy"
```

Testez l'API : http://localhost:8000

### 4. Démarrer le client (optionnel)

Si vous voulez tester le client localement :

```bash
cd client
npm install
npm run dev -- --host
```

Le client sera sur http://localhost:5173

---

## 🛠️ Commandes utiles

```bash
# Voir les logs du serveur
docker-compose logs -f

# Arrêter le serveur
docker-compose stop

# Redémarrer le serveur
docker-compose start

# Arrêter et supprimer
docker-compose down
```

---

## 🌐 Accès réseau local

Pour que d'autres machines se connectent :

1. **Trouvez votre IP** :
   ```bash
   ipconfig  # Windows
   ```

2. **Configurez le pare-feu** (Windows PowerShell en admin) :
   ```powershell
   New-NetFirewallRule -DisplayName "GuessCraft" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow
   ```

3. **Les joueurs accèdent à** : `http://[VOTRE_IP]:8000`

---

## 🐛 Problèmes courants

### "Port 8000 already in use"

Un autre service utilise le port. Changez le port dans `docker-compose.yml` :

```yaml
ports:
  - "9000:8000"  # Utilisez 9000 au lieu de 8000
```

### Le conteneur ne démarre pas

```bash
# Voir les erreurs
docker-compose logs

# Reconstruire complètement
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 📚 Documentation complète

- `DOCKER_DEPLOYMENT.md` : Guide Docker complet
- `NETWORK_SETUP.md` : Configuration réseau
- `README.md` : Documentation du projet

**Besoin d'aide ?** Contactez-moi !
