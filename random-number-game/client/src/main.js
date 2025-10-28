// ========== CONFIGURATION ==========
const CONFIG = {
    // URL du serveur WebSocket (utiliser ws:// pour HTTP ou wss:// pour HTTPS)
    SERVER_URL: 'ws://localhost:8000',
    // Nombre de tentatives de reconnexion
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
    // ✅ CORRECTION (doublons): Historique de MES propositions
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
    
    click() { this.playTone(800, 0.05); },
    success() {
        this.playTone(523, 0.1);
        setTimeout(() => this.playTone(659, 0.1), 100);
        setTimeout(() => this.playTone(784, 0.2), 200);
    },
    error() {
        this.playTone(200, 0.1);
        setTimeout(() => this.playTone(150, 0.2), 100);
    },
    hint() { this.playTone(440, 0.1); },
    playerJoin() {
        this.playTone(600, 0.08);
        setTimeout(() => this.playTone(700, 0.08), 80);
    }
};

// ========== GESTION DES ÉCRANS ==========
const ScreenManager = {
    currentScreen: 'menu',

    show(screenName) {
        // Utilise la transition CSS (opacity)
        const oldScreen = DOM[this.currentScreen + 'Screen'];
        const newScreen = DOM[screenName + 'Screen'];

        if (oldScreen) {
            oldScreen.classList.remove('active');
        }
        
        newScreen.classList.add('active');
        this.currentScreen = screenName;
        
        switch(screenName) {
            case 'menu':
                break;
            case 'lobby':
                // ✅ CORRECTION: Appeler la bonne méthode pour charger les salons
                SocketManager.getRooms();
                break;
            case 'game':
                break;
        }
        
        SoundFX.click();
    }
};

// ========== WEBSOCKET ==========
const SocketManager = {
    // Vérifie si l'utilisateur actuel est l'hôte de la salle
    isRoomHost: function() {
        // L'hôte est le premier joueur de la liste
        if (!GameState.currentRoom || !GameState.currentRoom.players || GameState.currentRoom.players.length === 0) {
            return false;
        }
        return GameState.currentRoom.players[0].socket_id === GameState.socketId;
    },
    connect() {
        console.log('🔌 Connexion au serveur...');

        // Configuration améliorée de la connexion Socket.IO
        GameState.socket = io(CONFIG.SERVER_URL, {
            // Forcer l'utilisation de WebSocket en premier, puis polling en fallback
            transports: ['websocket', 'polling'],
            
            // Options de reconnexion
            reconnection: true,
            reconnectionAttempts: CONFIG.RECONNECT_ATTEMPTS,
            reconnectionDelay: CONFIG.RECONNECT_DELAY,
            reconnectionDelayMax: 10000, // 10 secondes max entre les tentatives
            
            // Timeout de connexion
            timeout: 10000, // 10 secondes avant timeout
            
            // Désactiver le transport par défaut (évite les problèmes de protocole)
            forceNew: true,
            
            // Activer le mode debug
            debug: true,
            
            // Désactiver le cache pour éviter les problèmes de connexion
            rememberUpgrade: true,
            
            // Désactiver le multiplexing pour éviter les problèmes de connexion
            multiplex: false,
            
            // Forcer le transport WebSocket
            upgrade: true,
            
            // Délai avant de considérer la connexion comme perdue
            pingTimeout: 60000, // 60 secondes
            
            // Intervalle entre les pings
            pingInterval: 25000, // 25 secondes
            
            // Délai avant réessai de connexion
            reconnectionDelay: 1000,
            
            // Nombre maximum de tentatives de reconnexion
            reconnectionAttempts: 5
        });
        
        // Configurer les écouteurs d'événements
        this.setupListeners();
        
        // Forcer une reconnexion immédiate en cas de déconnexion
        GameState.socket.io.on('reconnect_attempt', (attempt) => {
            console.log(`🔄 Tentative de reconnexion #${attempt}`);
        });
        
        GameState.socket.io.on('reconnect_error', (error) => {
            console.error('❌ Erreur de reconnexion:', error);
        });
        
        GameState.socket.io.on('reconnect_failed', () => {
            console.error('❌ Échec de la reconnexion après plusieurs tentatives');
        });
    },
    
    setupListeners() {
        const socket = GameState.socket;
        
        socket.on('connect', () => {
            console.log('✅ Connecté au serveur');
            GameState.connected = true;
            GameState.socketId = socket.id;
            this.updateConnectionStatus(true);
            this.fetchServerStats();
        });
        
        socket.on('disconnect', () => {
            console.log('❌ Déconnecté du serveur');
            GameState.connected = false;
            this.updateConnectionStatus(false);
        });
        
        socket.on('connect_error', (error) => {
            console.error('Erreur de connexion:', error);
            this.updateConnectionStatus(false);
        });
        
        socket.on('connected', (data) => {
            console.log('📡 Message serveur:', data.message);
        });
        
        socket.on('player_registered', (data) => {
            if (data.success) {
                console.log('✅ Joueur enregistré:', data.player.username);
                UIManager.showNotification(`Bienvenue ${data.player.username} !`, 'success');
            }
        });
        
        socket.on('room_created', (data) => {
            if (data.success) {
                GameState.currentRoom = data.room;
                console.log('🎮 Salle créée:', data.room.room_id);
                ScreenManager.show('game');
                GameManager.initGame(data.room);
            }
        });
        
        socket.on('room_joined', (data) => {
            if (data.success) {
                GameState.currentRoom = data.room;
                console.log('👥 Salle rejointe:', data.room.room_id);
                ScreenManager.show('game');
                GameManager.initGame(data.room);
            }
        });
        
        socket.on('player_joined', (data) => {
            console.log('👤 Nouveau joueur:', data.username);
            GameState.currentRoom = data.room_state;
            GameManager.updatePlayers();
            UIManager.showNotification(`${data.username} a rejoint la partie`, 'info');
            SoundFX.playerJoin();
        });
        
        socket.on('player_left', (data) => {
            console.log('👋 Joueur parti:', data.username);
            GameState.currentRoom = data.room_state;
            GameManager.updatePlayers();
            UIManager.showNotification(`${data.username} a quitté la partie`, 'warning');
        });
        
        socket.on('game_started', (data) => {
            try {
                // Validation des données reçues
                if (!data || !data.room_state) {
                    throw new Error('Données de partie invalides reçues du serveur');
                }
                
                console.log('🎮 Partie démarrée !', data);
                
                // Mise à jour de l'état de la salle
                GameState.currentRoom = data.room_state;
                
                // Vérification que la partie est bien en cours
                if (data.room_state.status !== 'playing') {
                    throw new Error(`Statut de partie invalide: ${data.room_state.status}`);
                }
                
                // Démarrage du jeu côté client
                GameManager.startGame();
                
                // Affichage du message de confirmation
                if (data.message) {
                    UIManager.showNotification(data.message, 'success');
                }
                
                // Jouer un son de démarrage
                SoundFX.success();
                
            } catch (error) {
                console.error('Erreur lors du démarrage de la partie:', error);
                
                // Afficher un message d'erreur à l'utilisateur
                UIManager.showNotification(
                    'Erreur lors du démarrage de la partie. Retour au lobby...', 
                    'error'
                );
                
                // Jouer un son d'erreur
                SoundFX.error();
                
                // Revenir au lobby en cas d'erreur
                ScreenManager.show('lobby');
                
                // Essayer de rafraîchir l'état du lobby
                setTimeout(() => {
                    SocketManager.getRooms();
                }, 1000);
            }
        });
        
        socket.on('guess_result', (data) => {
            if (data.success) {
                GameManager.handleGuessResult(data);
            } else {
                UIManager.showNotification(data.error || 'Erreur', 'error');
                SoundFX.error();
            }
        });
        
        socket.on('room_update', (data) => {
            GameState.currentRoom = data.room_state;
            GameManager.updatePlayers();
            
            // ✅ CORRECTION (sync history): Gérer l'action du dernier joueur
            if (data.last_action && data.last_action.socket_id !== GameState.socketId) {
                const action = data.last_action;
                console.log(`📢 ${action.player} a proposé ${action.guess} -> ${action.result}`);
                GameManager.handleOtherPlayerAction(action);
            }
        });
        
        socket.on('game_error', (errorData) => {
            console.error('Erreur de partie:', errorData);
            
            // Afficher un message d'erreur convivial
            const errorMessage = errorData?.message || 'Une erreur est survenue avec la partie';
            UIManager.showNotification(`Erreur: ${errorMessage}`, 'error');
            
            // Jouer un son d'erreur
            SoundFX.error();
            
            // Si on a des informations sur la salle, on met à jour l'état
            if (errorData?.room_state) {
                GameState.currentRoom = errorData.room_state;
                GameManager.updatePlayers();
            }
            
            // Si l'erreur est critique, on retourne au lobby
            if (errorData?.critical) {
                ScreenManager.show('lobby');
                
                // Rafraîchir la liste des salles
                setTimeout(() => {
                    SocketManager.getRooms();
                }, 1000);
            }
        });
        
        socket.on('game_finished', (data) => {
            console.log('🏆 Partie terminée !');
            GameManager.endGame(data);
            SoundFX.success();
        });
        
        socket.on('rooms_list', (data) => {
            console.log(`📋 ${data.total} salles disponibles`);
            LobbyManager.displayRooms(data.rooms);
        });
        
        socket.on('room_left', (data) => {
            if (data.success) {
                GameState.currentRoom = null;
                ScreenManager.show('lobby');
            }
        });
        
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
    
    // Démarre la partie (uniquement si l'utilisateur est l'hôte)
    startGame() {
        console.log('🔍 [startGame] Début de la fonction startGame');
        
        // Vérifie si l'utilisateur est l'hôte de la salle
        const isHost = this.isRoomHost();
        console.log(`🔍 [startGame] Est l'hôte de la salle: ${isHost}`);
        
        if (!isHost) {
            const errorMsg = 'Seul l\'hôte peut démarrer la partie';
            console.error(`❌ [startGame] ${errorMsg}`);
            UIManager.showNotification(errorMsg, 'error');
            return false;
        }

        // Vérifie qu'il y a assez de joueurs (au moins 1 joueur)
        const playerCount = GameState.currentRoom?.players?.length || 0;
        console.log(`🔍 [startGame] Nombre de joueurs dans la salle: ${playerCount}`);
        
        if (playerCount < 1) {
            const errorMsg = 'Il faut au moins 1 joueur pour commencer';
            console.error(`❌ [startGame] ${errorMsg}`);
            UIManager.showNotification(errorMsg, 'warning');
            return false;
        }

        console.log('🚀 [startGame] Envoi de l\'événement start_game au serveur');
        GameState.socket.emit('start_game', (response) => {
            // Callback pour la confirmation du serveur
            if (response && response.error) {
                console.error(`❌ [startGame] Erreur du serveur: ${response.error}`);
                UIManager.showNotification(`Erreur: ${response.error}`, 'error');
            } else {
                console.log('✅ [startGame] Le serveur a confirmé la réception de start_game');
            }
        });
        
        return true;
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
            // Convert WebSocket URL to HTTP URL
            const httpUrl = CONFIG.SERVER_URL.replace('ws://', 'http://').replace('wss://', 'https://');
            const statsUrl = `${httpUrl}/api/stats`;
            
            console.log('📊 Fetching stats from:', statsUrl);
            
            const response = await fetch(statsUrl, {
                method: 'GET',
                mode: 'cors',  // Explicitly set CORS mode
                headers: {
                    'Content-Type': 'application/json',
                }
                // ✅ CORRECTION: Retirer credentials car incompatible avec Access-Control-Allow-Origin: *
                // credentials: 'include'
            });
            
            console.log('📊 Stats response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📊 Stats data received:', data);
            
            if (DOM.onlineCount) DOM.onlineCount.textContent = data.total_players || 0;
            if (DOM.roomsCount) DOM.roomsCount.textContent = data.active_rooms || 0;
            if (DOM.gamesCount) DOM.gamesCount.textContent = data.total_games_played || 0;
        } catch (error) {
            console.error('❌ Erreur stats:', error.message);
            console.error('❌ Stack:', error.stack);
            // Set default values on error
            if (DOM.onlineCount) DOM.onlineCount.textContent = '0';
            if (DOM.roomsCount) DOM.roomsCount.textContent = '0';
            if (DOM.gamesCount) DOM.gamesCount.textContent = '0';
        }
    }
};

// ========== GESTIONNAIRE DE JEU ==========
const GameManager = {
    initGame(room) {
        GameState.currentRoom = room;
        // ✅ CORRECTION (doublons): Vider l'historique
        GameState.history = []; 
        GameState.myStats = { attempts: 0, found: false };

        DOM.currentRoomId.textContent = room.room_id;
        DOM.attemptCount.textContent = '0';
        DOM.guessInput.value = '';
        DOM.historyList.innerHTML = '<div style="text-align: center; padding: 40px; color: #555; font-size: 10px;">No attempts yet</div>';
        DOM.victoryMessage.style.display = 'none';
        
        this.updatePlayers();
        
        if (room.status === 'playing') {
            this.startGame();
        } else {
            DOM.gameMessage.textContent = 'En attente du début de la partie...';
            DOM.guessInput.disabled = true;
            DOM.submitGuessBtn.disabled = true;
        }
    },
    
    startGame() {
        // ✅ CORRECTION (auto-start): Cacher le bouton de démarrage
        const oldBtn = document.getElementById('hostStartBtn');
        if (oldBtn) oldBtn.remove();

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

        // ✅ CORRECTION (auto-start): Logique d'affichage du bouton pour l'hôte
        const room = GameState.currentRoom;
        const isHost = room.players.length > 0 && room.players[0].socket_id === GameState.socketId;
        
        console.log('🔍 [updatePlayers] Vérification hôte:', {
            socketId: GameState.socketId,
            firstPlayer: room.players[0]?.socket_id,
            isHost: isHost,
            roomStatus: room.status
        });

        // Nettoyer l'ancien bouton
        const oldBtn = document.getElementById('hostStartBtn');
        if (oldBtn) oldBtn.remove();

        // Si je suis l'hôte, que la partie n'a pas démarré
        if (isHost && room.status === 'waiting') {
            const startBtn = document.createElement('button');
            startBtn.id = 'hostStartBtn';
            startBtn.className = 'btn';
            // ✅ CORRECTION: Permettre de jouer seul (1 joueur minimum)
            const minPlayers = 1; 
            startBtn.disabled = room.players.length < minPlayers;
            
            startBtn.textContent = `🚀 DÉMARRER (${room.players.length}/${room.max_players})`;
            startBtn.style.marginTop = '20px';
            startBtn.onclick = () => {
                SocketManager.startGame();
                SoundFX.click();
                startBtn.disabled = true;
            };
            
            DOM.playersList.after(startBtn);
            
            if (room.players.length < minPlayers) {
                DOM.gameMessage.textContent = `En attente d'au moins ${minPlayers} joueurs...`;
            } else {
                DOM.gameMessage.textContent = 'Vous êtes l\'hôte. Démarrez la partie !';
            }
        }
    },
    
    handleGuessResult(data) {
        const { result, message, attempts, player_data, guess } = data;
        
        GameState.myStats.attempts = attempts;
        DOM.attemptCount.textContent = attempts;
        DOM.gameMessage.textContent = message;
        
        // Ajouter à l'historique
        this.addToHistory({
            // ✅ CORRECTION (sync history): Toujours passer la proposition
            guess: guess, 
            result,
            message,
            attempt: attempts
        }, GameState.username); // Préciser que c'est "moi"
        
        if (result === 'bravo') {
            GameState.myStats.found = true;
            DOM.guessInput.disabled = true;
            DOM.submitGuessBtn.disabled = true;
            
            // ✅ CORRECTION (double affichage): Ne pas appeler showVictory.
            // L'événement 'game_finished' s'en chargera.
            // this.showVictory(player_data);
            
            DOM.gameMessage.textContent = '🎉 BRAVO ! En attente de la fin de la partie...';
            SoundFX.success();
        } else {
            SoundFX.hint();
        }
        
        DOM.guessInput.value = '';
        DOM.guessInput.focus();
    },
    
    // ✅ CORRECTION (sync history): Nouvelle fonction
    handleOtherPlayerAction(action) {
        const { player, guess, result } = action;
        // On utilise la même fonction addToHistory pour un affichage unifié
        this.addToHistory({
            guess: guess,
            result: result,
            message: '', // Pas pertinent pour les autres
            attempt: null // On ne l'a pas
        }, player); // On passe le nom du joueur
    },

    // ✅ CORRECTION (sync history): 'playerName' ajouté
    addToHistory(item, playerName = 'You') {
        // ✅ CORRECTION (doublons): Sauvegarder MES tentatives dans l'état
        const isMe = playerName === GameState.username;
        if (isMe && item.guess !== null) {
            GameState.history.push(item.guess);
        }

        if (DOM.historyList.children[0]?.textContent === 'No attempts yet') {
            DOM.historyList.innerHTML = '';
        }
        
        // ✅ CORRECTION (sync history): Style différent pour 'me' vs 'other'
        const historyDiv = document.createElement('div');
        historyDiv.className = `history-item ${item.result} ${isMe ? 'me' : 'other'}`;
        
        const guess = item.guess ?? 'X';
        const resultText = item.result === 'grand' ? '📉 TOO HIGH' : 
                          item.result === 'petit' ? '📈 TOO LOW' : 
                          '🎉 CORRECT!';
        
        if (isMe) {
            historyDiv.innerHTML = `
                <div class="history-guess">${guess}</div>
                <div class="history-info">
                    <div class="history-result">${resultText}</div>
                    <div class="history-attempt">Attempt #${item.attempt}</div>
                </div>
            `;
        } else {
             historyDiv.innerHTML = `
                <div class="history-guess">${guess}</div>
                <div class="history-info">
                    <div class="history-result">${playerName} -> ${resultText}</div>
                </div>
            `;
        }
        
        DOM.historyList.insertBefore(historyDiv, DOM.historyList.firstChild);
    },
    
    showVictory(playerData) {
        // (Cette fonction n'est plus appelée, mais on la garde au cas où)
        DOM.victoryMessage.innerHTML = `
            <div class="victory-message">
                <div class="victory-title">🎉 VICTOIRE ! 🎉</div>
                <div>Tu as trouvé le nombre en ${playerData.attempts} tentative(s)</div>
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

        // ✅ CORRECTION: Mettre à jour les stats globales (total_games)
        SocketManager.fetchServerStats();
    }
};

// ========== GESTIONNAIRE DE LOBBY ==========
const LobbyManager = {
    displayRooms(rooms) {
        if (rooms.length === 0) {
            DOM.roomsList.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #555;"> <div style="font-size: 48px; margin-bottom: 20px;">🎮</div> <div style="font-size: 14px; margin-bottom: 10px;">Aucune salle disponible</div> <div style="font-size: 10px;">Crée ta propre salle pour commencer !</div> </div>`;
            return;
        }

        DOM.roomsList.innerHTML = '';
        
        rooms.forEach(room => {
            const roomCard = document.createElement('div');
            roomCard.className = 'room-card';
            
            // On ne peut pas rejoindre une partie en cours
            if (room.status === 'playing' || room.player_count >= room.max_players) {
                roomCard.classList.add('disabled');
            } else {
                roomCard.onclick = () => {
                    SocketManager.joinRoom(room.room_id);
                    SoundFX.click();
                };
            }
            
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
        notif.style.cssText = `position: fixed; top: 80px; right: 20px; padding: 15px 20px; background: ${type === 'success' ? '#5EBD3E' : type === 'error' ? '#E74C3C' : (type === 'warning' ? '#F39C12' : '#47A8BD')}; border: 3px solid ${type === 'success' ? '#3a8a2a' : type === 'error' ? '#c0392b' : (type === 'warning' ? '#b8790f' : '#2e7a8a')}; color: white; font-size: 10px; z-index: 9999; animation: slideInRight 0.3s ease-out; max-width: 300px; box-shadow: 0 4px 8px rgba(0,0,0,0.5);`;
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
            animation: fadeIn 0.3s;
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
        const hasUsername = DOM.usernameInput.value.trim().length > 0;
        DOM.quickMatchBtn.disabled = !hasUsername;
        DOM.joinLobbyBtn.disabled = !hasUsername;
    });

    DOM.usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            handleJoinLobby(); // Par défaut, on va au lobby
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
    // (le 'setTimeout' donne le temps au socket de s'enregistrer)
    setTimeout(() => {
        // Crée une salle et attend que le serveur la confirme
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

    // ✅ CORRECTION (doublons): Vérifier l'historique
    if (GameState.history.includes(num)) {
        UIManager.showNotification('Tu as déjà proposé ce nombre !', 'warning');
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

// Ajouter les animations CSS (notifications + transitions d'écran)
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
    
    /* ✅ CORRECTION (animations): Transitions d'écran */
    .screen {
        display: none;
        opacity: 0;
        transition: opacity 0.4s ease-out;
    }
    .screen.active {
        display: block;
        opacity: 1;
        animation: fadeIn 0.4s ease-out;
    }
    @keyframes fadeIn { 
        from { opacity: 0; transform: translateY(10px); } 
        to { opacity: 1; transform: translateY(0); } 
    }
    
    /* ✅ CORRECTION (sync history): Style pour les autres joueurs */
    .history-item.other {
        background: var(--bg-dark); /* Plus sombre */
        border-color: #333;
    }
    .history-item.other .history-guess {
        background: #444; /* Guess plus sombre */
        color: #bbb;
    }
    .history-item.other .history-info {
        font-size: 9px;
    }

    /* Style pour les salons désactivés */
    .room-card.disabled {
        opacity: 0.4;
        cursor: not-allowed;
        background: var(--bg-darker);
    }
`;
document.head.appendChild(style);