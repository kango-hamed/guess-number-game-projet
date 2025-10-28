// ========== CONFIGURATION ==========
const CONFIG = {
    SERVER_URL: 'http://localhost:8000',
    RECONNECT_ATTEMPTS: 5,
    RECONNECT_DELAY: 2000
};

// ========== ÉTAT GLOBAL ==========
const GameState = {
    socket: null,
    username: '',
    socketId: null,
    currentRoom: null,
    players: [],
    history: [],
    myStats: { attempts: 0, found: false },
    connected: false
};

// ========== ÉLÉMENTS DOM ==========
const DOM = {
    // Statut de connexion
    connectionStatus: document.getElementById('connectionStatus'),
    
    // Écrans
    menuScreen: document.getElementById('menuScreen'),
    lobbyScreen: document.getElementById('lobbyScreen'),
    gameScreen: document.getElementById('gameScreen'),
    
    // Menu
    usernameInput: document.getElementById('usernameInput'),
    quickMatchBtn: document.getElementById('quickMatchBtn'),
    joinLobbyBtn: document.getElementById('joinLobbyBtn'),
    leaderboardBtn: document.getElementById('leaderboardBtn'),
    onlineCount: document.getElementById('onlineCount'),
    roomsCount: document.getElementById('roomsCount'),
    gamesCount: document.getElementById('gamesCount'),
    
    // Lobby
    roomsList: document.getElementById('roomsList'),
    createRoomBtn: document.getElementById('createRoomBtn'),
    backToMenuBtn: document.getElementById('backToMenuBtn'),
    
    // Jeu
    currentRoomId: document.getElementById('currentRoomId'),
    gameMessage: document.getElementById('gameMessage'),
    attemptCount: document.getElementById('attemptCount'),
    guessInput: document.getElementById('guessInput'),
    submitGuessBtn: document.getElementById('submitGuessBtn'),
    historyList: document.getElementById('historyList'),
    playersList: document.getElementById('playersList'),
    leaveGameBtn: document.getElementById('leaveGameBtn'),
    victoryMessage: document.getElementById('victoryMessage')
};

// ========== SONS 8-BIT (Synthèse Audio) ==========
const SoundFX = {
    audioContext: null,
    
    init() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    },
    
    playTone(frequency, duration, type = 'square') {
        if (!this.audioContext) this.init();
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    },
    
    click() {
        this.playTone(800, 0.05);
    },
    
    success() {
        this.playTone(523, 0.1);
        setTimeout(() => this.playTone(659, 0.1), 100);
        setTimeout(() => this.playTone(784, 0.2), 200);
    },
    
    error() {
        this.playTone(200, 0.1);
        setTimeout(() => this.playTone(150, 0.2), 100);
    },
    
    hint() {
        this.playTone(440, 0.1);
    },
    
    playerJoin() {
        this.playTone(600, 0.08);
        setTimeout(() => this.playTone(700, 0.08), 80);
    }
};

// ========== GESTION DES ÉCRANS ==========
const ScreenManager = {
    show(screenName) {
        DOM.menuScreen.classList.remove('active');
        DOM.lobbyScreen.classList.remove('active');
        DOM.gameScreen.classList.remove('active');
        
        switch(screenName) {
            case 'menu':
                DOM.menuScreen.classList.add('active');
                break;
            case 'lobby':
                DOM.lobbyScreen.classList.add('active');
                this.loadRooms();
                break;
            case 'game':
                DOM.gameScreen.classList.add('active');
                break;
        }
        
        SoundFX.click();
    }
};

// ========== WEBSOCKET ==========
const SocketManager = {
    connect() {
        console.log('🔌 Connexion au serveur...');
        
        GameState.socket = io(CONFIG.SERVER_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: CONFIG.RECONNECT_ATTEMPTS,
            reconnectionDelay: CONFIG.RECONNECT_DELAY
        });
        
        this.setupListeners();
    },
    
    setupListeners() {
        const socket = GameState.socket;
        
        // Connexion établie
        socket.on('connect', () => {
            console.log('✅ Connecté au serveur');
            GameState.connected = true;
            GameState.socketId = socket.id;
            this.updateConnectionStatus(true);
            this.fetchServerStats();
        });
        
        // Déconnexion
        socket.on('disconnect', () => {
            console.log('❌ Déconnecté du serveur');
            GameState.connected = false;
            this.updateConnectionStatus(false);
        });
        
        // Erreur de connexion
        socket.on('connect_error', (error) => {
            console.error('Erreur de connexion:', error);
            this.updateConnectionStatus(false);
        });
        
        // Message de bienvenue
        socket.on('connected', (data) => {
            console.log('📡 Message serveur:', data.message);
        });
        
        // Joueur enregistré
        socket.on('player_registered', (data) => {
            if (data.success) {
                console.log('✅ Joueur enregistré:', data.player.username);
                UIManager.showNotification(`Bienvenue ${data.player.username} !`, 'success');
            }
        });
        
        // Salle créée
        socket.on('room_created', (data) => {
            if (data.success) {
                GameState.currentRoom = data.room;
                console.log('🎮 Salle créée:', data.room.room_id);
                ScreenManager.show('game');
                GameManager.initGame(data.room);
            }
        });
        
        // Salle rejointe
        socket.on('room_joined', (data) => {
            if (data.success) {
                GameState.currentRoom = data.room;
                console.log('👥 Salle rejointe:', data.room.room_id);
                ScreenManager.show('game');
                GameManager.initGame(data.room);
            }
        });
        
        // Nouveau joueur dans la salle
        socket.on('player_joined', (data) => {
            console.log('👤 Nouveau joueur:', data.username);
            GameState.currentRoom = data.room_state;
            GameManager.updatePlayers();
            UIManager.showNotification(`${data.username} a rejoint la partie`, 'info');
            SoundFX.playerJoin();
        });
        
        // Joueur quitté
        socket.on('player_left', (data) => {
            console.log('👋 Joueur parti:', data.username);
            GameState.currentRoom = data.room_state;
            GameManager.updatePlayers();
            UIManager.showNotification(`${data.username} a quitté la partie`, 'warning');
        });
        
        // Partie démarrée
        socket.on('game_started', (data) => {
            console.log('🎮 Partie démarrée !');
            GameState.currentRoom = data.room_state;
            GameManager.startGame();
            UIManager.showNotification(data.message, 'success');
            SoundFX.success();
        });
        
        // Résultat de tentative
        socket.on('guess_result', (data) => {
            if (data.success) {
                GameManager.handleGuessResult(data);
            } else {
                UIManager.showNotification(data.error || 'Erreur', 'error');
                SoundFX.error();
            }
        });
        
        // Mise à jour de la salle
        socket.on('room_update', (data) => {
            GameState.currentRoom = data.room_state;
            GameManager.updatePlayers();
            
            if (data.last_action) {
                const action = data.last_action;
                console.log(`📢 ${action.player} a proposé ${action.guess} -> ${action.result}`);
            }
        });
        
        // Partie terminée
        socket.on('game_finished', (data) => {
            console.log('🏆 Partie terminée !');
            GameManager.endGame(data);
            SoundFX.success();
        });
        
        // Liste des salles
        socket.on('rooms_list', (data) => {
            console.log(`📋 ${data.total} salles disponibles`);
            LobbyManager.displayRooms(data.rooms);
        });
        
        // Salle quittée
        socket.on('room_left', (data) => {
            if (data.success) {
                GameState.currentRoom = null;
                ScreenManager.show('lobby');
            }
        });
        
        // Erreur
        socket.on('error', (data) => {
            console.error('❌ Erreur:', data.message);
            UIManager.showNotification(data.message, 'error');
            SoundFX.error();
        });
    },
    
    updateConnectionStatus(connected) {
        if (connected) {
            DOM.connectionStatus.textContent = '⚡ CONNECTED';
            DOM.connectionStatus.className = 'connection-status connected';
        } else {
            DOM.connectionStatus.textContent = '❌ DISCONNECTED';
            DOM.connectionStatus.className = 'connection-status disconnected';
        }
    },
    
    // Envoyer des événements
    registerPlayer(username) {
        GameState.socket.emit('register_player', { username });
    },
    
    createRoom(mode = 'versus', maxPlayers = 4) {
        GameState.socket.emit('create_room', { mode, max_players: maxPlayers });
    },
    
    joinRoom(roomId) {
        GameState.socket.emit('join_room', { room_id: roomId });
    },
    
    startGame() {
        GameState.socket.emit('start_game');
    },
    
    makeGuess(guess) {
        GameState.socket.emit('make_guess', { guess: parseInt(guess) });
    },
    
    getRooms() {
        GameState.socket.emit('get_rooms');
    },
    
    leaveRoom() {
        GameState.socket.emit('leave_room');
    },
    
    // Récupérer stats via API REST
    async fetchServerStats() {
        try {
            const response = await fetch(`${CONFIG.SERVER_URL}/api/stats`);
            const data = await response.json();
            
            DOM.onlineCount.textContent = data.total_players || 0;
            DOM.roomsCount.textContent = data.active_rooms || 0;
            DOM.gamesCount.textContent = data.total_games_played || 0;
        } catch (error) {
            console.error('Erreur stats:', error);
        }
    }
};

// ========== GESTIONNAIRE DE JEU ==========
const GameManager = {
    initGame(room) {
        GameState.currentRoom = room;
        GameState.history = [];
        GameState.myStats = { attempts: 0, found: false };
        
        DOM.currentRoomId.textContent = room.room_id;
        DOM.attemptCount.textContent = '0';
        DOM.guessInput.value = '';
        DOM.historyList.innerHTML = '<div style="text-align: center; padding: 40px; color: #555; font-size: 10px;">No attempts yet</div>';
        DOM.victoryMessage.style.display = 'none';
        
        this.updatePlayers();
        
        // Si la partie est déjà commencée
        if (room.status === 'playing') {
            this.startGame();
        } else {
            DOM.gameMessage.textContent = 'En attente du début de la partie...';
            DOM.guessInput.disabled = true;
            DOM.submitGuessBtn.disabled = true;
        }
    },
    
    startGame() {
        DOM.gameMessage.textContent = '🎮 Devine le nombre entre 0 et 100 !';
        DOM.guessInput.disabled = false;
        DOM.submitGuessBtn.disabled = false;
        DOM.guessInput.focus();
    },
    
    updatePlayers() {
        if (!GameState.currentRoom) return;
        
        const players = GameState.currentRoom.players || [];
        DOM.playersList.innerHTML = '';
        
        players.forEach((player, index) => {
            const isMe = player.socket_id === GameState.socketId;
            const isWinner = GameState.currentRoom.winner === player.socket_id;
            
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-item';
            if (isMe) playerDiv.classList.add('me');
            if (isWinner) playerDiv.classList.add('winner');
            
            playerDiv.innerHTML = `
                ${isWinner ? '<div class="player-crown">👑</div>' : ''}
                <div class="player-name">${player.username}${isMe ? ' (YOU)' : ''}</div>
                <div class="player-stats">
                    <span>Attempts: ${player.attempts}</span>
                    <span>Score: ${player.score || 0}</span>
                </div>
                <div class="player-status ${player.found ? 'found' : 'playing'}">
                    ${player.found ? '✓ FOUND' : '⚡ PLAYING'}
                </div>
            `;
            
            DOM.playersList.appendChild(playerDiv);
        });
    },
    
    handleGuessResult(data) {
        const { result, message, attempts, player_data } = data;
        
        // Mettre à jour les stats
        GameState.myStats.attempts = attempts;
        DOM.attemptCount.textContent = attempts;
        DOM.gameMessage.textContent = message;
        
        // Ajouter à l'historique
        this.addToHistory({
            guess: data.result === 'bravo' ? player_data.history[player_data.history.length - 1].guess : null,
            result,
            message,
            attempt: attempts
        });
        
        // Son et feedback
        if (result === 'bravo') {
            GameState.myStats.found = true;
            DOM.guessInput.disabled = true;
            DOM.submitGuessBtn.disabled = true;
            this.showVictory(player_data);
            SoundFX.success();
        } else {
            SoundFX.hint();
        }
        
        // Vider l'input
        DOM.guessInput.value = '';
        DOM.guessInput.focus();
    },
    
    addToHistory(item) {
        if (DOM.historyList.children[0]?.textContent === 'No attempts yet') {
            DOM.historyList.innerHTML = '';
        }
        
        const historyDiv = document.createElement('div');
        historyDiv.className = `history-item ${item.result}`;
        
        const guess = item.guess || 'X';
        const resultText = item.result === 'grand' ? '📉 TOO HIGH' : 
                          item.result === 'petit' ? '📈 TOO LOW' : 
                          '🎉 CORRECT!';
        
        historyDiv.innerHTML = `
            <div class="history-guess">${guess}</div>
            <div class="history-info">
                <div class="history-result">${resultText}</div>
                <div class="history-attempt">Attempt #${item.attempt}</div>
            </div>
        `;
        
        DOM.historyList.insertBefore(historyDiv, DOM.historyList.firstChild);
    },
    
    showVictory(playerData) {
        const targetNumber = GameState.currentRoom.target_number;
        
        DOM.victoryMessage.innerHTML = `
            <div class="victory-message">
                <div class="victory-title">🎉 VICTOIRE ! 🎉</div>
                <div>Tu as trouvé le nombre en ${playerData.attempts} tentative(s)</div>
                <div class="victory-number">${targetNumber}</div>
                <div style="font-size: 10px; color: #888;">Score: ${playerData.score || 0} points</div>
            </div>
        `;
        DOM.victoryMessage.style.display = 'block';
    },
    
    endGame(data) {
        DOM.gameMessage.textContent = '🏆 Partie terminée !';
        DOM.guessInput.disabled = true;
        DOM.submitGuessBtn.disabled = true;
        
        // Afficher le classement final
        UIManager.showLeaderboard(data.leaderboard, data.target_number);
    }
};

// ========== GESTIONNAIRE DE LOBBY ==========
const LobbyManager = {
    displayRooms(rooms) {
        if (rooms.length === 0) {
            DOM.roomsList.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #555;">
                    <div style="font-size: 48px; margin-bottom: 20px;">🎮</div>
                    <div style="font-size: 14px; margin-bottom: 10px;">Aucune salle disponible</div>
                    <div style="font-size: 10px;">Crée ta propre salle pour commencer !</div>
                </div>
            `;
            return;
        }
        
        DOM.roomsList.innerHTML = '';
        
        rooms.forEach(room => {
            const roomCard = document.createElement('div');
            roomCard.className = 'room-card';
            roomCard.onclick = () => {
                SocketManager.joinRoom(room.room_id);
                SoundFX.click();
            };
            
            const modeText = room.mode === 'versus' ? '⚔️ VERSUS' :
                           room.mode === 'battle_royale' ? '🏆 BATTLE ROYALE' :
                           '🤝 COOP';
            
            roomCard.innerHTML = `
                <div class="room-header">
                    <div class="room-id">${room.room_id}</div>
                    <div class="room-mode">${modeText}</div>
                </div>
                <div class="room-players">
                    <span>👥 ${room.player_count}/${room.max_players}</span>
                    <span style="color: ${room.status === 'waiting' ? '#5EBD3E' : '#E74C3C'};">
                        ${room.status === 'waiting' ? '● WAITING' : '● PLAYING'}
                    </span>
                </div>
            `;
            
            DOM.roomsList.appendChild(roomCard);
        });
    }
};

// ========== GESTIONNAIRE UI ==========
const UIManager = {
    showNotification(message, type = 'info') {
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#5EBD3E' : type === 'error' ? '#E74C3C' : '#47A8BD'};
            border: 3px solid ${type === 'success' ? '#3a8a2a' : type === 'error' ? '#c0392b' : '#2e7a8a'};
            color: white;
            font-size: 10px;
            z-index: 9999;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.5);
        `;
        notif.textContent = message;
        
        document.body.appendChild(notif);
        
        setTimeout(() => {
            notif.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    },
    
    showLeaderboard(leaderboard, targetNumber) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const content = document.createElement('div');
        content.className = 'panel';
        content.style.cssText = 'max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;';
        
        let html = `
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="font-size: 24px; color: var(--gold); margin-bottom: 10px;">🏆 FINAL LEADERBOARD</h2>
                <p style="font-size: 12px; color: #888;">Le nombre était: <span style="color: var(--grass-green); font-size: 32px;">${targetNumber}</span></p>
            </div>
            <div style="display: flex; flex-direction: column; gap: 15px;">
        `;
        
        leaderboard.forEach((player, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
            html += `
                <div style="background: var(--bg-darker); border: 3px solid ${index === 0 ? 'var(--gold)' : '#3a3a3a'}; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 20px; margin-bottom: 5px;">${medal} ${player.username}</div>
                        <div style="font-size: 8px; color: #888;">
                            ${player.attempts} attempts • ${player.score || 0} points
                        </div>
                    </div>
                    <div style="font-size: 24px;">${player.found ? '✓' : '✗'}</div>
                </div>
            `;
        });
        
        html += `
            </div>
            <button class="btn" onclick="this.closest('[style*=fixed]').remove();" style="margin-top: 30px;">
                CLOSE
            </button>
        `;
        
        content.innerHTML = html;
        modal.appendChild(content);
        document.body.appendChild(modal);
    }
};

// ========== ÉVÉNEMENTS DOM ==========
function setupEventListeners() {
    // Menu
    DOM.usernameInput.addEventListener('input', () => {
      console.log("Input entré")
        const hasUsername = DOM.usernameInput.value.trim().length > 0;
        DOM.quickMatchBtn.disabled = !hasUsername;
        DOM.joinLobbyBtn.disabled = !hasUsername;
    });
    
    DOM.usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            handleQuickMatch();
        }
    });
    
    DOM.quickMatchBtn.addEventListener('click', handleQuickMatch);
    DOM.joinLobbyBtn.addEventListener('click', handleJoinLobby);
    
    // Lobby
    DOM.createRoomBtn.addEventListener('click', () => {
        SocketManager.createRoom('versus', 4);
        SoundFX.click();
    });
    
    DOM.backToMenuBtn.addEventListener('click', () => {
        ScreenManager.show('menu');
    });
    
    // Jeu
    DOM.guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !DOM.submitGuessBtn.disabled) {
            handleSubmitGuess();
        }
    });
    
    DOM.submitGuessBtn.addEventListener('click', handleSubmitGuess);
    
    DOM.leaveGameBtn.addEventListener('click', () => {
        if (confirm('Quitter la partie ?')) {
            SocketManager.leaveRoom();
            SoundFX.click();
        }
    });
}

// ========== HANDLERS ==========
function handleQuickMatch() {
    const username = DOM.usernameInput.value.trim();
    if (!username) return;
    
    GameState.username = username;
    SocketManager.registerPlayer(username);
    
    // Créer une salle automatiquement
    setTimeout(() => {
        SocketManager.createRoom('versus', 4);
    }, 500);
    
    SoundFX.click();
}

function handleJoinLobby() {
    const username = DOM.usernameInput.value.trim();
    if (!username) return;
    
    GameState.username = username;
    SocketManager.registerPlayer(username);
    ScreenManager.show('lobby');
}

function handleSubmitGuess() {
    const guess = DOM.guessInput.value.trim();
    
    if (!guess) {
        UIManager.showNotification('Entre un nombre !', 'warning');
        SoundFX.error();
        return;
    }
    
    const num = parseInt(guess);
    if (isNaN(num) || num < 0 || num > 100) {
        UIManager.showNotification('Le nombre doit être entre 0 et 100', 'error');
        SoundFX.error();
        return;
    }
    
    SocketManager.makeGuess(num);
    SoundFX.click();
}

// ========== INITIALISATION ==========
function init() {
    console.log('🎮 GuessCraft - Initialisation...');
    
    // Connexion au serveur
    SocketManager.connect();
    
    // Événements DOM
    setupEventListeners();
    
    // Initialiser le contexte audio sur interaction utilisateur
    document.addEventListener('click', () => {
        if (!SoundFX.audioContext) {
            SoundFX.init();
        }
    }, { once: true });
    
    console.log('✅ Jeu initialisé !');
}

// Démarrer quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Ajouter les animations CSS manquantes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);