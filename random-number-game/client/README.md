# 🎮 GuessCraft - Jeu de Devinette Multijoueur

> **TP PRAD 2025-2026** - Architecture Client-Serveur avec Style Minecraft

Une application web multijoueur moderne où les joueurs s'affrontent pour deviner un nombre mystère entre 0 et 100.

---

## 📋 Table des Matières

- [Caractéristiques](#-caractéristiques)
- [Architecture](#-architecture)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Structure du Projet](#-structure-du-projet)
- [Protocole de Communication](#-protocole-de-communication)
- [Modes de Jeu](#-modes-de-jeu)
- [Captures d'Écran](#-captures-décran)

---

## ✨ Caractéristiques

### Fonctionnalités Principales
- 🎮 **Multijoueur en temps réel** avec WebSocket
- 🏆 **Système de salles** (créer/rejoindre)
- 👥 **Support jusqu'à 4 joueurs** par partie
- 📊 **Classement en direct** et statistiques
- 🎨 **Interface style Minecraft** moderne et pixelisée
- 🔊 **Effets sonores 8-bit** synthétisés
- 📱 **Responsive design** (mobile friendly)
- ⚡ **Temps réel** avec Socket.IO

### Modes de Jeu
1. **Versus** - Course pour trouver le nombre en premier
2. **Battle Royale** - Élimination progressive (à implémenter)
3. **Coopératif** - Équipes qui collaborent (à implémenter)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│          CLIENT (Vanilla JavaScript)            │
│  ┌──────────────────────────────────────────┐  │
│  │  Interface HTML/CSS/JS                   │  │
│  │  - Menu principal                        │  │
│  │  - Lobby des salles                      │  │
│  │  - Zone de jeu en temps réel             │  │
│  │  - Socket.IO Client                      │  │
│  └──────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────┘
                     │ WebSocket (Socket.IO)
                     │ + API REST
                     ▼
┌─────────────────────────────────────────────────┐
│          SERVEUR (Python Flask)                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Flask + Flask-SocketIO                  │  │
│  │  ┌────────────────────────────────────┐  │  │
│  │  │  Room Manager                      │  │  │
│  │  │  - Gestion des salles              │  │  │
│  │  │  - État des parties                │  │  │
│  │  └────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────┐  │  │
│  │  │  Player Manager                    │  │  │
│  │  │  - Sessions joueurs                │  │  │
│  │  │  - Connexions WebSocket            │  │  │
│  │  └────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────┐  │  │
│  │  │  Game Logic                        │  │  │
│  │  │  - Logique de devinette            │  │  │
│  │  │  - Calcul des scores               │  │  │
│  │  └────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ Technologies

### Backend
- **Python 3.8+**
- **Flask** - Framework web
- **Flask-SocketIO** - Communication WebSocket
- **Flask-CORS** - Gestion CORS
- **python-socketio** - Socket.IO pour Python
- **eventlet** - Serveur WSGI asynchrone

### Frontend
- **HTML5/CSS3** - Structure et style
- **Vanilla JavaScript** - Logique client (pas de framework)
- **Socket.IO Client** - Communication temps réel
- **Web Audio API** - Sons 8-bit
- **Google Fonts** - Police "Press Start 2P"

---

## 📦 Installation

### Prérequis
```bash
# Python 3.8 ou supérieur
python --version

# pip (gestionnaire de paquets Python)
pip --version
```

### 1. Cloner le projet
```bash
git clone https://github.com/votre-repo/guesscraft.git
cd guesscraft
```

### 2. Installer les dépendances Backend

```bash
cd backend
pip install -r requirements.txt
```

**Contenu de `requirements.txt` :**
```
Flask==3.0.0
flask-cors==4.0.0
flask-socketio==5.3.5
python-socketio==5.10.0
python-engineio==4.8.0
eventlet==0.33.3
python-dotenv==1.0.0
```

### 3. Configuration

Créer un fichier `.env` dans `backend/` :
```env
FLASK_ENV=development
SECRET_KEY=votre_cle_secrete_super_longue_et_aleatoire
PORT=5000
HOST=0.0.0.0
```

---

## 🚀 Utilisation

### Démarrer le Serveur

```bash
cd backend
python app.py
```

Le serveur démarre sur `http://localhost:5000`

Console :
```
🎮 ========================================
🎮  SERVEUR MULTIJOUEUR - JEU DE DEVINETTE
🎮 ========================================
🌐 Serveur démarré sur http://localhost:5000
🔌 WebSocket actif
👥 Prêt pour les connexions multijoueurs
🎮 ========================================
```

### Ouvrir le Client

1. **Méthode 1 - Serveur HTTP simple :**
```bash
cd frontend
python -m http.server 8080
```
Ouvrir : `http://localhost:8080`

2. **Méthode 2 - Ouvrir directement :**
Double-cliquer sur `index.html` dans votre navigateur

3. **Méthode 3 - VS Code Live Server :**
Clic droit sur `index.html` → "Open with Live Server"

### Tester en Multijoueur

1. Ouvrir **plusieurs onglets** du navigateur
2. Entrer un nom d'utilisateur différent dans chaque onglet
3. Créer une salle dans un onglet
4. Rejoindre la salle depuis les autres onglets
5. Commencer à deviner !

---

## 📁 Structure du Projet

```
guesscraft/
│
├── backend/                        # Serveur Python
│   ├── app.py                     # Point d'entrée + WebSocket
│   ├── game_logic.py              # Logique métier (optionnel)
│   ├── requirements.txt           # Dépendances Python
│   ├── config.py                  # Configuration (optionnel)
│   └── .env                       # Variables d'environnement
│
├── frontend/                       # Client Web
│   ├── index.html                 # Interface principale
│   ├── game.js                    # Logique client
│   ├── assets/                    # Ressources (optionnel)
│   │   ├── sounds/
│   │   └── images/
│   └── README.md
│
├── docs/                          # Documentation
│   ├── PROTOCOL.md               # Spécification protocole
│   ├── API.md                    # Documentation API
│   └── ARCHITECTURE.md           # Schémas d'architecture
│
├── docker-compose.yml            # Orchestration Docker
├── .gitignore
└── README.md                     # Ce fichier
```

---

## 📡 Protocole de Communication

### WebSocket Events

#### **Client → Serveur**

| Événement | Payload | Description |
|-----------|---------|-------------|
| `register_player` | `{ username: string }` | Enregistrer un joueur |
| `create_room` | `{ mode: string, max_players: int }` | Créer une salle |
| `join_room` | `{ room_id: string }` | Rejoindre une salle |
| `start_game` | - | Démarrer la partie |
| `make_guess` | `{ guess: int }` | Proposer un nombre |
| `get_rooms` | - | Lister les salles disponibles |
| `leave_room` | - | Quitter la salle actuelle |

#### **Serveur → Client**

| Événement | Payload | Description |
|-----------|---------|-------------|
| `connected` | `{ socket_id, message }` | Connexion établie |
| `player_registered` | `{ success, player }` | Joueur enregistré |
| `room_created` | `{ success, room }` | Salle créée |
| `room_joined` | `{ success, room }` | Salle rejointe |
| `player_joined` | `{ username, room_state }` | Nouveau joueur |
| `player_left` | `{ username, room_state }` | Joueur parti |
| `game_started` | `{ message, room_state }` | Partie commencée |
| `guess_result` | `{ success, result, message, attempts }` | Résultat tentative |
| `room_update` | `{ room_state, last_action }` | Mise à jour salle |
| `game_finished` | `{ message, leaderboard, target_number }` | Partie terminée |
| `rooms_list` | `{ rooms: [], total }` | Liste des salles |
| `error` | `{ message }` | Erreur |

### API REST Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/health` | Vérifier l'état du serveur |
| `GET` | `/api/stats` | Statistiques globales |
| `POST` | `/api/game/start` | Démarrer une partie (mode solo) |
| `POST` | `/api/game/:id/guess` | Faire une tentative |
| `GET` | `/api/game/:id` | État d'une partie |
| `DELETE` | `/api/game/:id` | Supprimer une session |

### Exemple de Flux

```javascript
// 1. Connexion
socket.connect()
// ← connected

// 2. Enregistrement
socket.emit('register_player', { username: 'Steve' })
// ← player_registered

// 3. Créer une salle
socket.emit('create_room', { mode: 'versus', max_players: 4 })
// ← room_created

// 4. Démarrer la partie
socket.emit('start_game')
// ← game_started

// 5. Faire une tentative
socket.emit('make_guess', { guess: 50 })
// ← guess_result
// ← room_update (broadcast à tous)

// 6. Victoire
// ← game_finished (avec leaderboard)
```

---

## 🎮 Modes de Jeu

### 1. Versus (Implémenté)
**Description :** Tous les joueurs devinent le même nombre. Le premier à trouver gagne.

**Règles :**
- Nombre mystère identique pour tous
- Tentatives illimitées
- Score basé sur : vitesse + nombre de tentatives
- Classement en temps réel

**Calcul du Score :**
```python
score = 1000 + time_bonus - (attempts * 5)
time_bonus = max(0, 300 - seconds_elapsed)
```

### 2. Battle Royale (À implémenter)
**Description :** Élimination progressive des joueurs les plus lents.

**Règles :**
- Rounds de 2 minutes
- Dernier à trouver = éliminé
- Nouveau nombre à chaque round
- Dernier survivant gagne

### 3. Coopératif (À implémenter)
**Description :** Équipes qui collaborent pour trouver le nombre.

**Règles :**
- Chat d'équipe
- Tentatives partagées
- Score d'équipe
- Victoire collective

---

## 🎨 Personnalisation

### Modifier les Couleurs

Dans `index.html`, section `<style>` :

```css
:root {
    --grass-green: #5EBD3E;   /* Vert principal */
    --diamond-blue: #47A8BD;  /* Bleu secondaire */
    --gold: #FFD83D;          /* Or/récompenses */
    --redstone: #E74C3C;      /* Rouge/danger */
    /* ... */
}
```

### Ajouter des Sons Personnalisés

Dans `game.js`, modifier `SoundFX` :

```javascript
SoundFX = {
    victory() {
        // Votre mélodie de victoire
        this.playTone(523, 0.1);
        setTimeout(() => this.playTone(659, 0.1), 100);
        setTimeout(() => this.playTone(784, 0.2), 200);
    }
}
```

### Changer la Police

Remplacer dans `<head>` :

```html
<link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet">
```

Puis dans CSS :
```css
font-family: 'VT323', monospace;
```

---

## 🐛 Débogage

### Activer les Logs Détaillés

**Backend :**
```python
# app.py
socketio.run(app, debug=True, log_output=True)
```

**Frontend :**
```javascript
// game.js
const CONFIG = {
    DEBUG: true,  // Ajouter cette ligne
    // ...
};
```

### Problèmes Courants

#### 1. **Serveur ne démarre pas**
```bash
# Vérifier le port
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux

# Changer le port
export PORT=5001
python app.py
```

#### 2. **WebSocket ne se connecte pas**
- Vérifier CORS dans `app.py`
- Vérifier l'URL dans `game.js` (CONFIG.SERVER_URL)
- Ouvrir la console navigateur (F12) pour voir les erreurs

#### 3. **Erreur "Module not found"**
```bash
pip install -r requirements.txt --upgrade
```

#### 4. **Sons ne fonctionnent pas**
- Les sons nécessitent une interaction utilisateur d'abord
- Vérifier que le navigateur autorise l'audio
- Tester avec `SoundFX.click()` dans la console

---

## 🔒 Sécurité

### Recommandations Production

1. **Variables d'environnement**
```python
import os
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv('SECRET_KEY')
```

2. **Rate Limiting**
```python
from flask_limiter import Limiter

limiter = Limiter(app, default_limits=["100 per minute"])

@app.route('/api/game/start')
@limiter.limit("5 per minute")
def start_game():
    # ...
```

3. **Validation des entrées**
```python
def validate_guess(guess):
    try:
        num = int(guess)
        if num < 0 or num > 100:
            raise ValueError
        return num
    except ValueError:
        return None
```

4. **HTTPS en production**
```python
# Utiliser un reverse proxy (Nginx)
# Ou activer SSL dans Flask
socketio.run(app, ssl_context='adhoc')
```

---

## 🚀 Déploiement

### Option 1 : Docker

**Dockerfile Backend :**
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["python", "app.py"]
```

**docker-compose.yml :**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - SECRET_KEY=${SECRET_KEY}
    restart: always

  frontend:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./frontend:/usr/share/nginx/html
    depends_on:
      - backend
```

**Lancer :**
```bash
docker-compose up -d
```

### Option 2 : Heroku

```bash
# Créer un Procfile
echo "web: python app.py" > Procfile

# Déployer
heroku create guesscraft
git push heroku main
```

### Option 3 : VPS (Ubuntu)

```bash
# Installer Python
sudo apt update
sudo apt install python3-pip

# Installer dépendances
pip3 install -r requirements.txt

# Utiliser Gunicorn + Nginx
pip3 install gunicorn
gunicorn --worker-class eventlet -w 1 app:app --bind 0.0.0.0:5000
```

---

## 📊 Métriques et Monitoring

### Ajouter des Statistiques

```python
# app.py
from collections import Counter

metrics = {
    'total_connections': 0,
    'total_games': 0,
    'average_attempts': 0,
    'fastest_win': None
}

@app.route('/api/metrics')
def get_metrics():
    return jsonify(metrics)
```

### Logger les Événements

```python
import logging

logging.basicConfig(
    filename='guesscraft.log',
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

@socketio.on('make_guess')
def handle_guess(data):
    logging.info(f"Player {socket_id} guessed {data['guess']}")
    # ...
```

---

## 🧪 Tests

### Tests Backend

```python
# test_app.py
import pytest
from app import app, GameSession

def test_game_session():
    session = GameSession('test-123')
    result = session.make_guess(50)
    assert result['success'] == True

def test_api_health():
    client = app.test_client()
    response = client.get('/api/health')
    assert response.status_code == 200
```

**Lancer les tests :**
```bash
pip install pytest
pytest test_app.py
```

### Tests Frontend

```javascript
// test_game.js (avec Jest ou Mocha)
describe('GameManager', () => {
    test('Should update player stats', () => {
        GameState.myStats = { attempts: 0, found: false };
        GameManager.handleGuessResult({
            result: 'petit',
            attempts: 1
        });
        expect(GameState.myStats.attempts).toBe(1);
    });
});
```

---

## 🤝 Contribution

### Guidelines

1. **Fork** le projet
2. Créer une **branche feature** (`git checkout -b feature/AmazingFeature`)
3. **Commit** les changements (`git commit -m 'Add AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une **Pull Request**

### Standards de Code

**Python :**
- PEP 8
- Docstrings pour les fonctions
- Type hints quand possible

**JavaScript :**
- ES6+
- Commentaires clairs
- Noms de variables descriptifs

---

## 📝 TODO

### Fonctionnalités à Implémenter

- [ ] Mode Battle Royale
- [ ] Mode Coopératif avec chat
- [ ] Système de classement persistant
- [ ] Profils utilisateurs
- [ ] Achievements/Badges
- [ ] Replay des parties
- [ ] Modes de difficulté (intervalle plus grand)
- [ ] Thèmes alternatifs (Dark, Nether, End)
- [ ] Support multilingue
- [ ] Mobile app (React Native)

### Améliorations Techniques

- [ ] Base de données (PostgreSQL/MongoDB)
- [ ] Redis pour sessions
- [ ] Tests unitaires complets
- [ ] CI/CD (GitHub Actions)
- [ ] Documentation API (Swagger)
- [ ] Monitoring (Prometheus/Grafana)

---

## 📄 Licence

Ce projet est sous licence MIT. Voir `LICENSE` pour plus de détails.

---

## 👥 Auteurs

- **Votre Nom** - *Développement initial* - [GitHub](https://github.com/votre-username)

### Remerciements

- Inspiration : Minecraft (Mojang Studios)
- Police : "Press Start 2P" (Google Fonts)
- Framework : Flask & Socket.IO
- Communauté TP PRAD 2025-2026

---

## 📞 Support

**Email:** votre.email@example.com  
**Discord:** VotreServeur#1234  
**Issues:** [GitHub Issues](https://github.com/votre-repo/guesscraft/issues)

---

## 🎓 Contexte Académique

Ce projet a été développé dans le cadre du **TP PRAD 2025-2026** sur les architectures client-serveur distribuées.

### Objectifs Pédagogiques

✅ Comprendre l'architecture client-serveur  
✅ Maîtriser les WebSockets (temps réel)  
✅ Gérer les états distribués  
✅ Implémenter un protocole de communication  
✅ Créer une interface utilisateur moderne  
✅ Gérer le multijoueur/concurrence  

---

**Made with ❤️ for TP PRAD** 🎮