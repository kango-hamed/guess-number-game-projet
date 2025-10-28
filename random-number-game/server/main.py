from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import socketio
from typing import Dict, List, Optional
import random
import uuid
from datetime import datetime
from pydantic import BaseModel

# ========== MODÈLES PYDANTIC ==========

class PlayerRegister(BaseModel):
    username: str

class CreateRoom(BaseModel):
    mode: str = "versus"
    max_players: int = 4

class JoinRoom(BaseModel):
    room_id: str

class MakeGuess(BaseModel):
    guess: int

# ========== CLASSES MÉTIER ==========

class Player:
    def __init__(self, socket_id: str, username: str):
        self.socket_id = socket_id
        self.username = username
        self.room_id: Optional[str] = None
        self.score = 0
        self.total_games = 0
        self.total_attempts = 0
        self.connected_at = datetime.now()
    
    def to_dict(self):
        return {
            "socket_id": self.socket_id,
            "username": self.username,
            "score": self.score,
            "total_games": self.total_games,
            "total_attempts": self.total_attempts
        }

class GameRoom:
    def __init__(self, room_id: str, mode: str = "versus", max_players: int = 4):
        self.room_id = room_id
        self.mode = mode
        self.max_players = max_players
        self.players: Dict[str, dict] = {}
        self.target_number = random.randint(0, 100)
        self.status = "waiting"  # waiting, playing, finished
        self.winner: Optional[str] = None
        self.created_at = datetime.now()
        self.started_at: Optional[datetime] = None
        self.guesses_history: List[dict] = []  # Historique global
    
    def add_player(self, socket_id: str, username: str) -> bool:
        if len(self.players) >= self.max_players:
            return False
        
        self.players[socket_id] = {
            "socket_id": socket_id,
            "username": username,
            "attempts": 0,
            "history": [],
            "status": "playing",
            "found": False,
            "position": None,
            "score": 0
        }
        return True
    
    def remove_player(self, socket_id: str):
        if socket_id in self.players:
            del self.players[socket_id]
    
    def start_game(self) -> bool:
        if len(self.players) < 1:
            return False
        self.status = "playing"
        self.started_at = datetime.now()
        self.target_number = random.randint(0, 100)
        self.guesses_history = []
        return True
    
    def process_guess(self, socket_id: str, guess: int) -> dict:
        if socket_id not in self.players:
            return {"success": False, "error": "Joueur non trouvé"}
        
        player = self.players[socket_id]
        
        if player["found"]:
            return {"success": False, "error": "Tu as déjà trouvé le nombre !"}
        
        # ✅ CORRECTION: Vérifier les doublons
        if any(h["guess"] == guess for h in player["history"]):
            return {"success": False, "error": f"Tu as déjà proposé {guess} !"}
        
        player["attempts"] += 1
        
        # Comparaison
        if guess > self.target_number:
            result = "grand"
            message = "Trop grand !"
        elif guess < self.target_number:
            result = "petit"
            message = "Trop petit !"
        else:
            result = "bravo"
            message = "🎉 Trouvé !"
            player["found"] = True
            player["position"] = self._get_next_position()
            
            # Calcul du score
            if self.started_at:
                time_bonus = max(0, 300 - (datetime.now() - self.started_at).seconds)
            else:
                time_bonus = 0
            attempt_penalty = player["attempts"] * 5
            player["score"] = max(0, 1000 + time_bonus - attempt_penalty)
            
            if player["position"] == 1:
                self.winner = socket_id
        
        # Historique personnel
        guess_data = {
            "guess": guess,
            "result": result,
            "message": message,
            "attempt": player["attempts"],
            "timestamp": datetime.now().isoformat()
        }
        player["history"].append(guess_data)
        
        # ✅ CORRECTION: Historique global pour tous les joueurs
        self.guesses_history.append({
            "player": player["username"],
            "socket_id": socket_id,
            "guess": guess,
            "result": result,
            "timestamp": datetime.now().isoformat()
        })
        
        # Vérifier fin de partie
        self._check_game_end()
        
        return {
            "success": True,
            "result": result,
            "message": message,
            "attempts": player["attempts"],
            "player_data": player,
            "room_state": self.get_state()
        }
    
    def _get_next_position(self) -> int:
        found_count = sum(1 for p in self.players.values() if p["found"])
        return found_count
    
    def _check_game_end(self):
        active_players = [p for p in self.players.values() if not p["found"]]
        if len(active_players) == 0:
            self.status = "finished"
    
    def get_state(self, include_target: bool = False) -> dict:
        """
        ✅ CORRECTION CRITIQUE: Ne jamais exposer target_number sauf si demandé
        """
        state = {
            "room_id": self.room_id,
            "mode": self.mode,
            "status": self.status,
            "players": list(self.players.values()),
            "player_count": len(self.players),
            "max_players": self.max_players,
            "winner": self.winner,
            "created_at": self.created_at.isoformat(),
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "guesses_history": self.guesses_history  # ✅ Historique global
        }
        
        # ✅ CORRECTION: target_number uniquement si partie finie ou explicitement demandé
        if include_target or self.status == "finished":
            state["target_number"] = self.target_number
        
        return state
    
    def get_leaderboard(self) -> List[dict]:
        sorted_players = sorted(
            self.players.values(),
            key=lambda p: (not p["found"], p["attempts"], -p["score"])
        )
        return sorted_players

# ========== GESTIONNAIRE DE DONNÉES ==========

class GameManager:
    def __init__(self):
        self.players: Dict[str, Player] = {}
        self.game_rooms: Dict[str, GameRoom] = {}

manager = GameManager()

# ========== SOCKET.IO ==========

sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=False
)

# ========== APPLICATION FASTAPI ==========

app = FastAPI(title="GuessCraft API", version="1.0.1")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Monter Socket.IO sur FastAPI
socket_app = socketio.ASGIApp(sio, app)

# ========== ROUTES API REST ==========

@app.get("/")
async def root():
    return {
        "message": "🎮 GuessCraft API - Serveur Multijoueur",
        "version": "1.0.1",
        "status": "online"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "message": "Serveur opérationnel",
        "active_connections": len(manager.players),
        "active_rooms": len(manager.game_rooms)
    }

@app.get("/api/stats")
async def get_stats():
    return {
        "total_players": len(manager.players),
        "active_rooms": len(manager.game_rooms),
        "total_games_played": sum(p.total_games for p in manager.players.values())
    }

@app.get("/api/rooms")
async def get_rooms():
    available_rooms = [
        room.get_state(include_target=False)  # ✅ Ne jamais exposer le target
        for room in manager.game_rooms.values()
        if room.status == "waiting" and len(room.players) < room.max_players
    ]
    return {
        "rooms": available_rooms,
        "total": len(available_rooms)
    }

# ========== ÉVÉNEMENTS SOCKET.IO ==========

@sio.event
async def connect(sid, environ):
    print(f"[+] Client connecte: {sid}")
    await sio.emit('connected', {
        'socket_id': sid,
        'message': 'Bienvenue sur GuessCraft !',
        'server_time': datetime.now().isoformat()
    }, to=sid)

@sio.event
async def disconnect(sid):
    print(f"[-] Client deconnecte: {sid}")
    
    # Nettoyer le joueur
    if sid in manager.players:
        player = manager.players[sid]
        
        # Retirer de la salle
        if player.room_id and player.room_id in manager.game_rooms:
            room = manager.game_rooms[player.room_id]
            username = player.username
            room.remove_player(sid)
            
            # Notifier les autres joueurs
            await sio.emit('player_left', {
                'username': username,
                'room_state': room.get_state()
            }, room=player.room_id)
            
            # Supprimer la salle si vide
            if len(room.players) == 0:
                del manager.game_rooms[player.room_id]
                print(f"[ROOM] Salle {player.room_id} supprimée (vide)")
        
        del manager.players[sid]

@sio.event
async def register_player(sid, data):
    username = data.get('username', f'Player_{sid[:6]}')
    player = Player(sid, username)
    manager.players[sid] = player
    
    print(f"[OK] Joueur enregistre: {username} ({sid})")
    
    await sio.emit('player_registered', {
        'success': True,
        'player': player.to_dict(),
        'message': f'Bienvenue {username} !'
    }, to=sid)

@sio.event
async def create_room(sid, data):
    if sid not in manager.players:
        await sio.emit('error', {
            'message': 'Tu dois t\'enregistrer d\'abord'
        }, to=sid)
        return
    
    room_id = str(uuid.uuid4())[:8].upper()
    mode = data.get('mode', 'versus')
    max_players = data.get('max_players', 4)
    auto_start = data.get('auto_start', False)  # ✅ NOUVEAU: démarrage auto
    
    room = GameRoom(room_id, mode, max_players)
    manager.game_rooms[room_id] = room
    
    player = manager.players[sid]
    room.add_player(sid, player.username)
    player.room_id = room_id
    
    # Joindre la room Socket.IO
    await sio.enter_room(sid, room_id)
    
    print(f"[ROOM] Salle creee: {room_id} par {player.username}")
    
    await sio.emit('room_created', {
        'success': True,
        'room': room.get_state(),
        'message': f'Salle {room_id} créée !'
    }, to=sid)
    
    # ✅ CORRECTION: Démarrage automatique si demandé
    if auto_start:
        if room.start_game():
            print(f"[START] Partie auto-démarrée dans la salle {room_id}")
            await sio.emit('game_started', {
                'message': '🎮 La partie commence !',
                'room_state': room.get_state()
            }, room=room_id)

@sio.event
async def join_room(sid, data):
    room_id = data.get('room_id')
    
    if sid not in manager.players:
        await sio.emit('error', {
            'message': 'Tu dois t\'enregistrer d\'abord'
        }, to=sid)
        return
    
    if room_id not in manager.game_rooms:
        await sio.emit('error', {
            'message': 'Salle introuvable'
        }, to=sid)
        return
    
    room = manager.game_rooms[room_id]
    player = manager.players[sid]
    
    if not room.add_player(sid, player.username):
        await sio.emit('error', {
            'message': 'Salle pleine'
        }, to=sid)
        return
    
    player.room_id = room_id
    
    # Joindre la room Socket.IO
    await sio.enter_room(sid, room_id)
    
    print(f"[JOIN] {player.username} a rejoint la salle {room_id}")
    
    # Notifier le joueur
    await sio.emit('room_joined', {
        'success': True,
        'room': room.get_state()
    }, to=sid)
    
    # Notifier tous les joueurs de la salle
    await sio.emit('player_joined', {
        'username': player.username,
        'room_state': room.get_state()
    }, room=room_id)

@sio.event
async def start_game(sid):
    if sid not in manager.players:
        return
    
    player = manager.players[sid]
    if not player.room_id or player.room_id not in manager.game_rooms:
        await sio.emit('error', {
            'message': 'Tu n\'es pas dans une salle'
        }, to=sid)
        return
    
    room = manager.game_rooms[player.room_id]
    
    if not room.start_game():
        await sio.emit('error', {
            'message': 'Impossible de démarrer'
        }, to=sid)
        return
    
    print(f"[START] Partie demarree dans la salle {room.room_id}")
    
    await sio.emit('game_started', {
        'message': '🎮 La partie commence !',
        'room_state': room.get_state()
    }, room=player.room_id)

@sio.event
async def make_guess(sid, data):
    guess = data.get('guess')
    
    if sid not in manager.players:
        return
    
    player = manager.players[sid]
    if not player.room_id or player.room_id not in manager.game_rooms:
        return
    
    room = manager.game_rooms[player.room_id]
    
    if room.status != "playing":
        await sio.emit('error', {
            'message': 'La partie n\'a pas encore commencé'
        }, to=sid)
        return
    
    try:
        guess = int(guess)
        if guess < 0 or guess > 100:
            await sio.emit('error', {
                'message': 'Le nombre doit être entre 0 et 100'
            }, to=sid)
            return
    except (ValueError, TypeError):
        await sio.emit('error', {
            'message': 'Nombre invalide'
        }, to=sid)
        return
    
    result = room.process_guess(sid, guess)
    
    if not result["success"]:
        await sio.emit('error', {
            'message': result.get('error', 'Erreur inconnue')
        }, to=sid)
        return
    
    # Envoyer le résultat au joueur
    await sio.emit('guess_result', result, to=sid)
    
    # Notifier tous les joueurs de la mise à jour
    await sio.emit('room_update', {
        'room_state': room.get_state(),
        'last_action': {
            'player': player.username,
            'socket_id': sid,
            'guess': guess,
            'result': result.get('result')
        }
    }, room=player.room_id)
    
    # ✅ CORRECTION: Si la partie est terminée, incrémenter total_games
    if room.status == "finished":
        for p_sid in room.players.keys():
            if p_sid in manager.players:
                manager.players[p_sid].total_games += 1
        
        await sio.emit('game_finished', {
            'message': '🏆 Partie terminée !',
            'leaderboard': room.get_leaderboard(),
            'target_number': room.target_number  # ✅ Exposer SEULEMENT maintenant
        }, room=player.room_id)

@sio.event
async def leave_room(sid):
    if sid not in manager.players:
        return
    
    player = manager.players[sid]
    if player.room_id and player.room_id in manager.game_rooms:
        room = manager.game_rooms[player.room_id]
        room.remove_player(sid)
        
        # Quitter la room Socket.IO
        await sio.leave_room(sid, player.room_id)
        
        # Notifier les autres
        await sio.emit('player_left', {
            'username': player.username,
            'room_state': room.get_state()
        }, room=player.room_id)
        
        # Supprimer la salle si vide
        if len(room.players) == 0:
            del manager.game_rooms[player.room_id]
            print(f"[ROOM] Salle {player.room_id} supprimée (vide)")
        
        player.room_id = None
        
        await sio.emit('room_left', {
            'success': True
        }, to=sid)

@sio.event
async def get_rooms(sid):
    available_rooms = [
        room.get_state(include_target=False)  # ✅ Ne jamais exposer le target
        for room in manager.game_rooms.values()
    ]
    
    await sio.emit('rooms_list', {
        'rooms': available_rooms,
        'total': len(available_rooms)
    }, to=sid)

# ========== POINT D'ENTRÉE ==========

if __name__ == "__main__":
    import uvicorn
    print("=" * 50)
    print("  SERVEUR GUESSCRAFT - SOCKET.IO v1.0.1")
    print("=" * 50)
    print("Serveur sur http://127.0.0.1:8000")
    print("Socket.IO sur http://127.0.0.1:8000/socket.io/")
    print("=" * 50)
    uvicorn.run("main:socket_app", host="0.0.0.0", port=8000, reload=True)