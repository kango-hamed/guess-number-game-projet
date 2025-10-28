# 🎮 GuessCraft - Jeu Multijoueur de Devinettes

Un jeu multijoueur en temps réel où les joueurs doivent deviner un nombre entre 0 et 100 à travers plusieurs niveaux.

## 🌟 Fonctionnalités

- ✅ **Multijoueur en temps réel** via WebSocket (Socket.IO)
- ✅ **Système de niveaux** (5 niveaux par défaut)
- ✅ **Système de score** avec bonus de temps
- ✅ **Salles de jeu** avec jusqu'à 4 joueurs
- ✅ **Interface rétro** style Minecraft
- ✅ **Statistiques en temps réel**
- ✅ **Classement final** avec récapitulatif personnel
- ✅ **Support réseau local** pour jouer avec des amis

## 🏗️ Architecture

### Backend (Python)
- **FastAPI** : API REST et serveur HTTP
- **Socket.IO** : Communication temps réel
- **Uvicorn** : Serveur ASGI

### Frontend (JavaScript)
- **Vanilla JS** : Pas de framework, code pur
- **Vite** : Build tool et dev server
- **Socket.IO Client** : Communication avec le serveur
- **CSS personnalisé** : Style Minecraft/rétro

## 📦 Installation

### Prérequis
- Python 3.8+
- Node.js 16+
- npm ou yarn

### 1. Installer le serveur

```bash
cd server
pip install -r requirements.txt
```

**Contenu de `requirements.txt` :**
```
fastapi
python-socketio
uvicorn[standard]
```

### 2. Installer le client

```bash
cd client
npm install
```

## 🚀 Démarrage

### Option 1 : Avec Docker (Recommandé) 🐳

**Le moyen le plus simple de démarrer le serveur !**

```bash
# Démarrer avec Docker Compose
docker-compose up -d

# Ou utiliser le script
./docker-start.bat  # Windows
./docker-start.sh   # Linux/Mac
```

Le serveur sera accessible sur `http://localhost:8000`

**Commandes utiles :**
```bash
# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose stop

# Redémarrer
docker-compose restart

# Supprimer
docker-compose down
```

📖 **Guide complet** : [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)

### Option 2 : Installation manuelle

#### Démarrer le serveur

```bash
cd server
python main.py
```

Le serveur affichera :
```
==================================================
  SERVEUR GUESSCRAFT - SOCKET.IO v1.0.1
==================================================
📍 ACCÈS LOCAL:
   http://127.0.0.1:8000
   http://localhost:8000

🌐 ACCÈS RÉSEAU (autres machines):
   http://192.168.1.100:8000

💡 Les clients doivent configurer:
   SERVER_URL: 'ws://192.168.1.100:8000'
==================================================
```

### Démarrer le client

**Mode local :**
```bash
cd client
npm run dev
```

**Mode réseau (accessible depuis d'autres machines) :**
```bash
cd client
npm run dev -- --host
```

Ou utilisez le script :
```bash
cd client
start-network.bat
```

## 🌐 Jouer en Réseau Local

Consultez le guide détaillé : [NETWORK_ACCESS.md](NETWORK_ACCESS.md)

### Configuration rapide

1. **Démarrez le serveur** et notez l'IP affichée (ex: 192.168.1.100)

2. **Configurez le client** dans `client/src/main.js` :
```javascript
const CONFIG = {
    SERVER_URL: 'ws://192.168.1.100:8000',  // Remplacez par l'IP du serveur
    // ...
};
```

3. **Autorisez le port 8000** dans le pare-feu Windows

4. **Démarrez le client en mode réseau** :
```bash
npm run dev -- --host
```

5. Les autres joueurs peuvent accéder au client via `http://[IP_CLIENT]:5173`

## 🎯 Comment Jouer

1. **Entrez votre nom d'utilisateur**
2. **Créez ou rejoignez une salle**
3. **L'hôte démarre la partie** (bouton "DÉMARRER")
4. **Devinez le nombre** entre 0 et 100
5. **Passez au niveau suivant** après avoir trouvé
6. **Complétez les 5 niveaux** pour terminer la partie
7. **Consultez vos statistiques** à la fin

## 📊 Système de Score

- **Base** : 1000 points par niveau trouvé
- **Bonus temps** : Jusqu'à 300 points (5 minutes max)
- **Pénalité tentatives** : -5 points par tentative
- **Score minimum** : 0 points

**Formule :**
```
Score = max(0, 1000 + bonus_temps - (tentatives × 5))
```

## 🎮 Modes de Jeu

### Versus (actuel)
- Jusqu'à 4 joueurs
- Chacun devine le même nombre
- Le plus rapide gagne des points bonus
- 5 niveaux à compléter

### Futurs modes (à implémenter)
- **Battle Royale** : Élimination progressive
- **Coopératif** : Objectif commun
- **Time Attack** : Contre la montre

## 📁 Structure du Projet

```
random-number-game/
├── server/
│   ├── main.py              # Serveur FastAPI + Socket.IO
│   └── requirements.txt     # Dépendances Python
├── client/
│   ├── src/
│   │   ├── main.js         # Logique du jeu
│   │   └── style.css       # Styles
│   ├── index.html          # Page principale
│   ├── package.json        # Dépendances Node
│   └── start-network.bat   # Script de démarrage réseau
├── NETWORK_ACCESS.md       # Guide d'accès réseau
└── README.md              # Ce fichier
```

## 🔧 Configuration

### Serveur (`server/main.py`)

```python
# Changer le nombre de niveaux
self.max_levels = 5  # Ligne 60

# Changer le port
uvicorn.run("main:socket_app", host="0.0.0.0", port=8000)  # Ligne 728
```

### Client (`client/src/main.js`)

```javascript
const CONFIG = {
    SERVER_URL: 'ws://localhost:8000',  // URL du serveur
    RECONNECT_ATTEMPTS: 5,              // Tentatives de reconnexion
    RECONNECT_DELAY: 2000               // Délai entre tentatives (ms)
};
```

## 🐛 Débogage

### Le client ne se connecte pas
- Vérifiez que le serveur est démarré
- Vérifiez l'URL dans `CONFIG.SERVER_URL`
- Vérifiez le pare-feu (port 8000)
- Consultez la console du navigateur (F12)

### Erreur CORS
- Le serveur est configuré pour accepter toutes les origines en développement
- Vérifiez que vous utilisez `ws://` et non `wss://`

### Le bouton "DÉMARRER" ne s'affiche pas
- Rafraîchissez la page (Ctrl+Shift+R)
- Vérifiez que vous êtes l'hôte (premier joueur)
- Vérifiez la console pour les erreurs

## 📝 API REST

### Endpoints disponibles

- `GET /` : Informations sur le serveur
- `GET /api/health` : État du serveur
- `GET /api/stats` : Statistiques globales
- `GET /api/rooms` : Liste des salles disponibles

### Exemple

```bash
curl http://localhost:8000/api/stats
```

Réponse :
```json
{
  "total_players": 2,
  "active_rooms": 1,
  "total_games_played": 5
}
```

## 🎨 Personnalisation

### Changer les couleurs

Éditez `client/src/style.css` :

```css
:root {
    --gold: #FFD700;
    --grass-green: #5EBD3E;
    --diamond-blue: #47A8BD;
    /* ... */
}
```

### Changer les sons

Les sons sont générés par synthèse audio dans `SoundFX` (`main.js`).
Modifiez les fréquences et durées pour personnaliser.

## 🚧 Améliorations Futures

- [ ] Système de compte utilisateur
- [ ] Sauvegarde des scores
- [ ] Modes de jeu supplémentaires
- [ ] Chat en jeu
- [ ] Animations améliorées
- [ ] Mode spectateur
- [ ] Replay des parties
- [ ] Achievements/Trophées

## 📄 Licence

Projet éducatif - TP PRAD 2025-2026

## 👥 Auteurs

Développé dans le cadre du cours de Programmation Répartie.

## 🙏 Remerciements

- Socket.IO pour la communication temps réel
- FastAPI pour le backend moderne
- Vite pour le développement rapide
- La communauté open-source !

---

**Bon jeu ! 🎮**
