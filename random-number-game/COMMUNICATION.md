# 📡 Communication Client-Serveur - GuessCraft

## ✅ Corrections Appliquées

### Problèmes Identifiés
1. **Incompatibilité de protocole** : Client utilisait Socket.IO, serveur utilisait WebSocket natif FastAPI
2. **Ports différents** : Client configuré pour port 5000, serveur sur port 8000
3. **Format de messages** : Incompatibilité entre Socket.IO et WebSocket natif

### Solutions Implémentées

#### 1. Port Client Corrigé
**Fichier:** `client/src/main.js`
```javascript
const CONFIG = {
    SERVER_URL: 'http://localhost:8000',  // Changé de 5000 à 8000
    RECONNECT_ATTEMPTS: 5,
    RECONNECT_DELAY: 2000
};
```

#### 2. Nouveau Serveur Socket.IO
**Fichier:** `server/main_socketio.py`
- Utilise `python-socketio` pour compatibilité avec le client Socket.IO
- Conserve FastAPI pour les routes REST
- Port 8000 maintenu

#### 3. Dépendances Installées
```bash
pip install python-socketio python-engineio fastapi uvicorn
```

---

## 🔌 Architecture de Communication

```
┌─────────────────────────────────────────┐
│         CLIENT (Browser)                │
│  ┌──────────────────────────────────┐  │
│  │  Socket.IO Client Library        │  │
│  │  - Connexion WebSocket           │  │
│  │  - Fallback polling              │  │
│  │  - Reconnexion automatique       │  │
│  └──────────────────────────────────┘  │
└────────────────┬────────────────────────┘
                 │
                 │ Socket.IO Protocol
                 │ (WebSocket + Polling)
                 │
                 ▼
┌─────────────────────────────────────────┐
│      SERVEUR (Python)                   │
│  ┌──────────────────────────────────┐  │
│  │  python-socketio                 │  │
│  │  + FastAPI                       │  │
│  │  ┌────────────────────────────┐  │  │
│  │  │  Socket.IO Events          │  │  │
│  │  │  - connect/disconnect      │  │  │
│  │  │  - register_player         │  │  │
│  │  │  - create_room             │  │  │
│  │  │  - join_room               │  │  │
│  │  │  - start_game              │  │  │
│  │  │  - make_guess              │  │  │
│  │  └────────────────────────────┘  │  │
│  │  ┌────────────────────────────┐  │  │
│  │  │  REST API                  │  │  │
│  │  │  - /api/health             │  │  │
│  │  │  - /api/stats              │  │  │
│  │  │  - /api/rooms              │  │  │
│  │  └────────────────────────────┘  │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 📨 Protocole Socket.IO

### Événements Client → Serveur

| Événement | Payload | Description |
|-----------|---------|-------------|
| `register_player` | `{ username: string }` | Enregistrer un joueur |
| `create_room` | `{ mode: string, max_players: int }` | Créer une salle |
| `join_room` | `{ room_id: string }` | Rejoindre une salle |
| `start_game` | - | Démarrer la partie |
| `make_guess` | `{ guess: int }` | Proposer un nombre |
| `leave_room` | - | Quitter la salle |
| `get_rooms` | - | Lister les salles |

### Événements Serveur → Client

| Événement | Données | Description |
|-----------|---------|-------------|
| `connected` | `{ socket_id, message, server_time }` | Connexion établie |
| `player_registered` | `{ success, player, message }` | Joueur enregistré |
| `room_created` | `{ success, room, message }` | Salle créée |
| `room_joined` | `{ success, room }` | Salle rejointe |
| `player_joined` | `{ username, room_state }` | Nouveau joueur |
| `player_left` | `{ username, room_state }` | Joueur parti |
| `game_started` | `{ message, room_state }` | Partie commencée |
| `guess_result` | `{ success, result, message, attempts, player_data }` | Résultat tentative |
| `room_update` | `{ room_state, last_action }` | Mise à jour salle |
| `game_finished` | `{ message, leaderboard, target_number }` | Partie terminée |
| `rooms_list` | `{ rooms, total }` | Liste des salles |
| `error` | `{ message }` | Erreur |

---

## 🔄 Flux de Communication Complet

### Scénario: Créer et Jouer une Partie

```
1. CLIENT: Connexion au serveur
   socket.connect()
   
2. SERVEUR: Confirmation de connexion
   ← connected { socket_id: "abc123" }

3. CLIENT: Enregistrement du joueur
   → register_player { username: "Steve" }
   
4. SERVEUR: Confirmation
   ← player_registered { success: true, player: {...} }

5. CLIENT: Création de salle
   → create_room { mode: "versus", max_players: 4 }
   
6. SERVEUR: Salle créée
   ← room_created { success: true, room: {...} }

7. CLIENT: Démarrage de la partie
   → start_game
   
8. SERVEUR: Broadcast à tous les joueurs de la salle
   ← game_started { message: "La partie commence !", room_state: {...} }

9. CLIENT: Proposition d'un nombre
   → make_guess { guess: 50 }
   
10. SERVEUR: Résultat personnel
    ← guess_result { result: "grand", message: "Trop grand !", attempts: 1 }
    
11. SERVEUR: Broadcast à tous (mise à jour)
    ← room_update { room_state: {...}, last_action: {...} }

12. CLIENT: Proposition correcte
    → make_guess { guess: 42 }
    
13. SERVEUR: Victoire
    ← guess_result { result: "bravo", message: "Trouvé !", ... }
    
14. SERVEUR: Fin de partie (si tous ont trouvé)
    ← game_finished { leaderboard: [...], target_number: 42 }
```

---

## 🌐 API REST (Endpoints HTTP)

### Routes Disponibles

#### `GET /`
Informations sur le serveur
```json
{
    "message": "GuessCraft API - Serveur Multijoueur",
    "version": "1.0.0",
    "status": "online"
}
```

#### `GET /api/health`
État du serveur
```json
{
    "status": "ok",
    "message": "Serveur opérationnel",
    "active_connections": 5,
    "active_rooms": 2
}
```

#### `GET /api/stats`
Statistiques globales
```json
{
    "total_players": 10,
    "active_rooms": 3,
    "total_games_played": 25
}
```

#### `GET /api/rooms`
Liste des salles disponibles
```json
{
    "rooms": [
        {
            "room_id": "ABC123",
            "mode": "versus",
            "status": "waiting",
            "player_count": 2,
            "max_players": 4
        }
    ],
    "total": 1
}
```

---

## 🚀 Démarrage

### Serveur
```bash
cd server
python main_socketio.py
```
**URL:** http://localhost:8000

### Client
```bash
cd client
python -m http.server 5173
```
**URL:** http://localhost:5173

---

## 🔧 Configuration

### Client (`client/src/main.js`)
```javascript
const CONFIG = {
    SERVER_URL: 'http://localhost:8000',
    RECONNECT_ATTEMPTS: 5,
    RECONNECT_DELAY: 2000
};
```

### Serveur (`server/main_socketio.py`)
```python
# Socket.IO Configuration
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=False
)

# Uvicorn Configuration
uvicorn.run("main_socketio:socket_app", 
            host="0.0.0.0", 
            port=8000, 
            reload=True)
```

---

## 🔍 Débogage

### Logs Serveur
Le serveur affiche:
- `[+]` Connexion client
- `[-]` Déconnexion client
- `[OK]` Joueur enregistré
- `[ROOM]` Salle créée
- `[JOIN]` Joueur rejoint une salle
- `[START]` Partie démarrée

### Console Client (F12)
```javascript
// Vérifier la connexion
GameState.connected  // true si connecté

// Voir l'ID du socket
GameState.socketId   // "abc123..."

// État de la salle actuelle
GameState.currentRoom
```

---

## ⚠️ Points d'Attention

### CORS
Le serveur autorise toutes les origines (`cors_allowed_origins='*'`). En production, restreindre aux domaines autorisés.

### Reconnexion
Socket.IO gère automatiquement la reconnexion en cas de perte de connexion.

### Rooms
Les salles Socket.IO permettent le broadcast ciblé uniquement aux joueurs d'une même partie.

### Nettoyage
À la déconnexion, le serveur:
1. Retire le joueur de sa salle
2. Notifie les autres joueurs
3. Supprime la salle si vide

---

## 📚 Ressources

- **Socket.IO Documentation:** https://socket.io/docs/v4/
- **python-socketio:** https://python-socketio.readthedocs.io/
- **FastAPI:** https://fastapi.tiangolo.com/

---

**Auteur:** TP PRAD 2025-2026  
**Date:** Octobre 2025
