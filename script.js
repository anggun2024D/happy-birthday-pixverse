// script.js - Improved version with Spotify Player, Scrollable Content, and Fixed Awards

document.addEventListener('DOMContentLoaded', function() {
    // State management
    const appState = {
        currentScreen: 'loading',
        collectedKeys: 0,
        tokens: 0,
        xp: 0,
        completedPuzzles: [],
        pinnedMemories: [],
        starMessages: [],
        birthdayDate: new Date(new Date().getFullYear(), 11, 25), // Default to Dec 25
        viewedCards: [],
        unlockedAwards: ['Meme Master', 'Late Night Coder', 'Smile Champion'], // Default awards
        version: 1,
        journeystarted: false
    };

    // DOM Elements
    const screens = {
        loading: document.getElementById('loading-screen'),
        countdown: document.getElementById('countdown-screen'),
        wrapped: document.getElementById('wrapped-screen'),
        jigsaw: document.getElementById('jigsaw-screen'),
        reveal: document.getElementById('reveal-screen'),
        'post-reveal': document.getElementById('post-reveal-screen')
    };

    const modal = document.getElementById('memory-modal');
    const toast = document.getElementById('toast');
    const flashEffect = document.getElementById('flash-effect');

    // Puzzle variables
    let puzzlePieces = [];
    let emptyIndex = 8;
    let currentCardIndex = 0;
    let currentPhotoIndex = 0;
    let typewriterInterval = null;

    // Global intervals
    let countdownInterval = null;
    let yearbookInterval = null;

    // Initialize the app
    function init() {
        // Show loading screen first
        showScreen('loading');

        // Preload audio files
        preloadAudio();

        // initialize audio contols
        initializeAudioControls();
        
        // Start loading progress
        startLoadingProgress();

        // Create loading particles
        createLoadingParticles();
        
        // Set up event listeners
        setupEventListeners();

        // Set up responsive handlers
        setupResponsiveHandlers();

        // initialize responsive layout
        handleResize();
        
        // Initialize game state from localStorage if available
        loadGameState();
    }

    // Initialize audio controls
    function initializeAudioControls() {
        const audioControls = document.createElement('div');
        audioControls.className = 'audio-controls';
        audioControls.innerHTML = `
            <input type="range" class="volume-slider" min="0" max="1" step="0.1" value="0.7">
            <button class="mute-btn">🔊</button>
        `;
        
        document.body.appendChild(audioControls);
        
        const volumeSlider = document.querySelector('.volume-slider');
        const muteBtn = document.querySelector('.mute-btn');
        
        volumeSlider.addEventListener('input', function() {
            setAudioVolume(this.value);
            muteBtn.textContent = this.value == 0 ? '🔇' : '🔊';
        });
        
        muteBtn.addEventListener('click', function() {
            const isUnmuted = toggleMute();
            this.textContent = isUnmuted ? '🔊' : '🔇';
            volumeSlider.value = isUnmuted ? 0.7 : 0;
        });
        
        setAudioVolume(0.7);
    }

    // Loading progress functionality
    function startLoadingProgress() {
        const progressFill = document.getElementById('loading-progress');
        const percentageText = document.getElementById('loading-percentage');
        const loadingText = document.querySelector('.loading-text');
        
        let progress = 0;
        const totalSteps = 10;
        const stepDuration = 150; // ms
        
        const loadingSteps = [
            "LOADING PIXEL ASSETS...",
            "INITIALIZING MEMORY GRID...",
            "CALIBRATING COLOR MATRIX...",
            "GENERATING TIMELINE DATA...",
            "LOADING AUDIO MODULES...",
            "PREPARING GAME ENGINE...",
            "INITIALIZING PUZZLE SYSTEMS...",
            "LOADING USER PROFILE...",
            "FINALIZING SETUP...",
            "READY TO LAUNCH!"
        ];
        
        const progressInterval = setInterval(() => {
            progress += 1;
            const percentage = Math.min(100, (progress / totalSteps) * 100);
            
            // Update progress bar
            progressFill.style.width = percentage + '%';
            percentageText.textContent = Math.round(percentage) + '%';
            
            // Update loading text
            if (progress <= loadingSteps.length) {
                loadingText.innerHTML = loadingSteps[progress - 1] + ' <span id="loading-percentage">' + Math.round(percentage) + '%</span>';
            }
            
            // Complete loading
            if (progress >= totalSteps) {
                clearInterval(progressInterval);
                
                // Add completion animation
                progressFill.style.background = 'linear-gradient(90deg, #00ff00, #00cc00)';
                progressFill.style.boxShadow = '0 0 10px #00ff00';
                
                // Show completion message briefly
                setTimeout(() => {
                    showScreen('countdown');
                    startCountdown();
                }, 800);
            }
        }, stepDuration);
    }

    // Add particle effect to loading screen
    function createLoadingParticles() {
        const loadingScreen = document.getElementById('loading-screen');
        
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'loading-particle';
                particle.style.cssText = `
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: var(--pink-accent);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 1;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    animation: floatParticle ${3 + Math.random() * 2}s ease-in-out infinite;
                `;
                
                loadingScreen.appendChild(particle);
                
                // Remove particles after animation to prevent memory leak
                setTimeout(() => {
                    if (particle.parentNode) {
                        loadingScreen.removeChild(particle);
                    }
                }, 5000);
            }, i * 200);
        }
    }

    // Set up all event listeners
    function setupEventListeners() {
        console.log('Setting up event listeners...');

        // Navigation buttons using data-action pattern
        document.querySelectorAll('[data-action]').forEach(element => {
            element.addEventListener('click', handleAction);
        });

        // Keyboard navigation
        document.addEventListener('keydown', handleKeydown);

        // Tambahkan event listener untuk touch devices
        document.addEventListener('touchstart', function(e) {
        }, { passive: true });

        // Prevent default touch behaviors
        document.addEventListener('touchmove', function(e) {
            if (e.scale !== 1) {
                e.preventDefault();
            }
        }, { passive: false });

        // Direct event listeners for critical buttons
        const startBtn = document.getElementById('start-journey-btn');
        if (startBtn) {
            startBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Start button clicked directly');
                startJourney();
            });
        }
    }

    // Handle all actions based on data-action attribute
    function handleAction(e) {
        e.preventDefault();
        e.stopPropagation();

        const action = e.currentTarget.getAttribute('data-action');
        const target = e.currentTarget.getAttribute('data-target');
        const platform = e.currentTarget.getAttribute('data-platform');
        
        switch(action) {
            case 'start':
                startJourney();
                break;
            case 'continue':
                if (target) {
                    showScreen(target);
                }
                break;
            case 'back':
                if (target) {
                    showScreen(target);
                }
                break;
            case 'prev-card':
                prevCard();
                break;
            case 'next-card':
                nextCard();
                break;
            case 'hint':
                showHint();
                break;
            case 'reset':
                resetPuzzle();
                break;
            case 'share':
                shareMoment();
                break;
            case 'share-social':
                handleSocialShare(platform);
                break;
            case 'download':
                downloadYearbook();
                break;
            case 'play-video':
                playVideo();
                break;
            case 'submit-message':
                submitMessage();
                break;
            case 'generate-poster':
                generatePoster();
                break;
            case 'restart':
                restartJourney();
                break;
            case 'close-modal':
                closeModal();
                break;
            case 'pin-memory':
                pinMemory();
                break;
        }
        
        playSound('click');
    }

    // Handle keyboard navigation
    function handleKeydown(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
        
        if (e.key === 'Enter' && document.activeElement) {
            document.activeElement.click();
        }
        
        if (appState.currentScreen === 'wrapped') {
            if (e.key === 'ArrowLeft') {
                prevCard();
            } else if (e.key === 'ArrowRight') {
                nextCard();
            }
        }
    }

    // Screen management - FIXED VERSION
    function showScreen(screenName) {
        console.log(`Switching to screen: ${screenName}`);
        console.log('Available screens:', Object.keys(screens));
        
        // Validate screen name
        if (!screens[screenName]) {
            console.error(`Screen ${screenName} not found!`);
            showToast(`Screen ${screenName} not available`);
            return;
        }
        
        // Clear any existing intervals
        if (countdownInterval && screenName !== 'countdown') {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        
        // Hide all screens
        Object.values(screens).forEach(screen => {
            if (screen) {
                screen.classList.remove('active');
                console.log(`Hiding screen: ${screen.id}`);
            }
        });
        
        // Show the requested screen
        screens[screenName].classList.add('active');
        appState.currentScreen = screenName;
        
        console.log(`Now active screen: ${screenName}`);
        
        // Initialize screen-specific content
        switch(screenName) {
            case 'countdown':
                startCountdown();
                break;
            case 'wrapped':
                initWrapped();
                break;
            case 'jigsaw':
                initJigsawPuzzle();
                break;
            case 'reveal':
                initReveal();
                break;
            case 'post-reveal':
                initPostReveal();
                break;
        }
        
        // Save game state
        saveGameState();
    }

    // Audio management
    function playSound(type) {
        const audioElements = {
            'click': document.getElementById('click-sound'),
            'win': document.getElementById('win-sound'),
            'hint': document.getElementById('hint-sound'),
            'reset': document.getElementById('reset-sound'),
            'video': document.getElementById('video-sound'),
            'message': document.getElementById('message-sound'),
            'poster': document.getElementById('poster-sound'),
            'download': document.getElementById('download-sound'),
            'share': document.getElementById('share-sound'),
            'pin': document.getElementById('pin-sound'),
            'restart': document.getElementById('restart-sound'),
            'level-up': document.getElementById('level-up-sound'),
            'start': document.getElementById('start-sound')
        };

        const audio = audioElements[type];
        
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(error => {
                console.log('Audio play failed:', error);
                createFallbackSound(type);
            });
        } else {
            console.warn(`Audio for ${type} not found`);
            createFallbackSound(type);
        }
    }

    function createFallbackSound(type) {
        // Fallback beep sounds
        console.log(`Fallback sound for: ${type}`);
    }

    function setAudioVolume(volume) {
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
            audio.volume = Math.max(0, Math.min(1, volume));
        });
    }

    function toggleMute() {
        const audioElements = document.querySelectorAll('audio');
        const isMuted = audioElements[0].volume === 0;
        
        audioElements.forEach(audio => {
            audio.volume = isMuted ? 0.7 : 0;
        });
        
        return !isMuted;
    }

    function preloadAudio() {
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
            audio.load();
        });
    }

    // Countdown functionality
    function startCountdown() {
        if (countdownInterval) clearInterval(countdownInterval);
        updateCountdown(); 
        countdownInterval = setInterval(updateCountdown, 1000);
    }

    function updateCountdown() {
        const now = new Date();
        const timeDiff = appState.birthdayDate - now;
        
        if (timeDiff > 0) {
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            
            const daysElement = document.getElementById('days');
            const hoursElement = document.getElementById('hours');
            const minutesElement = document.getElementById('minutes');
            
            if (daysElement) daysElement.textContent = days.toString().padStart(2, '0');
            if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
            if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
        } else {
            // Birthday has arrived!
            const countdownText = document.querySelector('.countdown-text');
            const countdownTimer = document.querySelector('.countdown-timer');
            
            if (countdownText) countdownText.textContent = "HAPPY BIRTHDAY!";
            if (countdownTimer) countdownTimer.style.display = 'none';
            
            // Clear interval
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownInterval = null;
            }
        }
    }

    // Wrapped screen functionality
    function initWrapped() {
        // Initialize carousel
        updateCarousel();
        
        // Initialize music player if on the music card
        if (currentCardIndex === 1) {
            initializeMusicPlayer();
        }
        
        // Initialize photobox if on the photobox card
        if (currentCardIndex === 2) {
            initializePhotobox();
        }

        // Initialize awards if on the awards card
        if (currentCardIndex === 3) {
            initializeAwards();
        }
    }

    function updateCarousel() {
        const cards = document.querySelectorAll('.pixel-card');
        const indicators = document.querySelectorAll('.indicator');
        const track = document.querySelector('.carousel-track');
        
        cards.forEach((card, index) => {
            card.classList.toggle('active', index === currentCardIndex);
            
            if (index === currentCardIndex) {
                setTimeout(() => {
                    if (index === 1) initializeMusicPlayer();
                    if (index === 2) initializePhotobox();
                    if (index === 3) initializeAwards();
                }, 100);
            }
        });
        
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentCardIndex);
        });
        
        if (track) {
            track.style.transform = `translateX(-${currentCardIndex * 100}%)`;
        }
    }

    function setupTouchCarousel() {
    const carouselTrack = document.querySelector('.carousel-track');
    if (!carouselTrack) return;
    
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    carouselTrack.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    }, { passive: true });
    
    carouselTrack.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        const diff = startX - currentX;
        
        // Only prevent default if horizontal swipe
        if (Math.abs(diff) > Math.abs(e.touches[0].clientY - startX)) {
            e.preventDefault();
        }
    }, { passive: false });
    
    carouselTrack.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        
        const diff = startX - currentX;
        const swipeThreshold = 50;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextCard();
            } else {
                prevCard();
            }
        }
        
        isDragging = false;
    }, { passive: true });
    }

    function prevCard() {
        const cards = document.querySelectorAll('.pixel-card');
        currentCardIndex = currentCardIndex > 0 ? currentCardIndex - 1 : cards.length - 1;
        updateCarousel();
        playSound('click');
    }

    function nextCard() {
        const cards = document.querySelectorAll('.pixel-card');
        currentCardIndex = currentCardIndex < cards.length - 1 ? currentCardIndex + 1 : 0;
        
        // Add tokens when navigating cards
        if (!appState.viewedCards.includes(currentCardIndex)) {
            appState.viewedCards.push(currentCardIndex);
            appState.tokens += 10;
            updateTokenDisplay();
        }
        
        updateCarousel();
        playSound('click');
    }

    // Update token display
    function updateTokenDisplay() {
        const tokenElements = document.querySelectorAll('.token-count');
        tokenElements.forEach(element => {
            element.textContent = appState.tokens;
        });
    }

    // Music Player Functions
    function initializeMusicPlayer() {
        const musicContent = document.querySelector('.music-content');
        if (!musicContent) return;
        
        musicContent.innerHTML = `
            <div class="spotify-container">
                <div class="spotify-embed-container">
                    <iframe id="spotify-iframe" 
                            style="border-radius:12px" 
                            src="" 
                            width="100%" 
                            height="200" 
                            frameBorder="0" 
                            allowfullscreen="" 
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                            loading="lazy">
                    </iframe>
                </div>
                <div class="playlist-controls">
                    <button class="playlist-btn active" data-playlist="1">Birthday Mix</button>
                    <button class="playlist-btn" data-playlist="2">Love Songs</button>
                    <button class="playlist-btn" data-playlist="3">Happy Memories</button>
                </div>
                <div class="music-info">
                    <div class="current-playlist">Now Playing: Birthday Special Mix</div>
                    <div class="playlist-description">Lagu-lagu spesial untuk hari istimewa kamu ✨</div>
                </div>
            </div>
        `;
        
        // Add music player event listeners
        addSpotifyPlayerListeners();
        
        // Load default playlist
        loadSpotifyPlaylist(1);
    }

    function addSpotifyPlayerListeners() {
        const playlistBtns = document.querySelectorAll('.playlist-btn');
        
        playlistBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                playlistBtns.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Get playlist number
                const playlistNum = parseInt(this.getAttribute('data-playlist'));
                
                // Load corresponding playlist
                loadSpotifyPlaylist(playlistNum);
                
                playSound('click');
            });
        });
    }

    function loadSpotifyPlaylist(playlistNumber) {
        const iframe = document.getElementById('spotify-iframe');
        const currentPlaylist = document.querySelector('.current-playlist');
        const playlistDescription = document.querySelector('.playlist-description');
        
        if (!iframe) return;
        
        // Playlist data - Ganti dengan link playlist Spotify kamu
        const playlists = {
            1: {
                // Ganti dengan playlist pertama kamu
                embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWYtQSOiZF6hj?si=0b945793c2934ba1',
                name: 'Birthday Special Mix',
                description: 'Lagu-lagu spesial untuk hari istimewa kamu ✨'
            },
            2: {
                // Ganti dengan playlist kedua kamu
                embedUrl: 'https://open.spotify.com/embed/playlist/3gPSenyxZMdB3A54HeEruz?si=6b4dec830d4f4a48',
                name: 'Love Songs Collection',
                description: 'Koleksi lagu cinta terbaik untuk kita ❤️'
            },
            3: {
                // Ganti dengan playlist ketiga kamu
                embedUrl: 'https://open.spotify.com/embed/playlist/4dlQ4JHE6abxv38aae2HL1?si=95730613199e4dad',
                name: 'Happy Memories',
                description: 'Lagu-lagu yang mengingatkan kenangan indah 🌟'
            }
        };
        
        const selectedPlaylist = playlists[playlistNumber];
        
        if (selectedPlaylist) {
            // Update iframe source
            iframe.src = selectedPlaylist.embedUrl;
            
            // Update info
            if (currentPlaylist) {
                currentPlaylist.textContent = `Now Playing: ${selectedPlaylist.name}`;
            }
            
            if (playlistDescription) {
                playlistDescription.textContent = selectedPlaylist.description;
            }
            
            // Add loading effect
            iframe.style.opacity = '0.5';
            
            iframe.onload = function() {
                this.style.opacity = '1';
            };
        }
    }

    // Photobox Functions
    function initializePhotobox() {
        const photoboxContent = document.querySelector('.photobox-content');
        if (!photoboxContent) return;
        
        photoboxContent.innerHTML = `
            <div class="photobox-header">
                <div class="photobox-dot red"></div>
                <span class="photobox-title">PHOTOBOX SESSION</span>
                <div class="photobox-dot green"></div>
            </div>
            <div class="photobox-progress">READY TO PRINT</div>
            <div class="photo-display">
                <div class="photo-placeholder">Press MULAI CETAK to start photo session</div>
            </div>
            <div class="photobox-controls">
                <button class="photo-btn pixel-btn">MULAI CETAK</button>
            </div>
        `;
        
        // Add event listener for photo button
        setTimeout(() => {
            const photoBtn = document.querySelector('.photo-btn');
            if (photoBtn) {
                photoBtn.addEventListener('click', startPhotoShow);
            }
        }, 100);
    }

    function startPhotoShow() {
        const photoBtn = document.querySelector('.photo-btn');
        const photoDisplay = document.querySelector('.photo-display'); 
        const progressDiv = document.querySelector('.photobox-progress');
        
        if (!photoBtn || !photoDisplay || !progressDiv) return;
        
        // Foto lokal dari folder images
        const photos = [
            {
                text: 'Our First Date 💕',
                image: './images/photo1.jpg'
            },
            {
                text: 'Birthday Moment 🎂',
                image: './images/photo2.jpg'
            },
            {
                text: 'Adventure Time 🌟',
                image: './images/photo3.jpg'
            },
            {
                text: 'Cozy Together ❤️',
                image: './images/photo4.jpg'
            },
            {
                text: 'Sweet Memories 🥰',
                image: './images/photo5.jpg'
            },
            {
                text: 'Laugh Together 😂',
                image: './images/photo6.jpg'
            },
            {
                text: 'Perfect Day ☀️',
                image: './images/photo7.jpg'
            },
            {
                text: 'Love Forever 💖',
                image: './images/photo8.jpg'
            },
            {
                text: 'Best Friends Always 🤗',
                image: './images/photo9.jpg'
            },
            {
                text: 'Unforgettable Moments 🌈',
                image: './images/photo10.jpg'
            },
            {
                text: 'Unforgettable Moments 🌈',
                image: './images/photo11.jpg'
            },
            {
                text: 'Unforgettable Moments 🌈',
                image: './images/photo12.jpg'
            },
            {
                text: 'Unforgettable Moments 🌈',
                image: './images/photo13.jpg'
            },
            {
                text: 'Unforgettable Moments 🌈',
                image: './images/photo14.jpg'
            },
            {
                text: 'Unforgettable Moments 🌈',
                image: './images/photo15.jpg'
            },
            {
                text: 'Unforgettable Moments 🌈',
                image: './images/photo16.jpg'
            },
            {
                text: 'Unforgettable Moments 🌈',
                image: './images/photo17.jpg'
            },
            {
                text: 'Unforgettable Moments 🌈',
                image: './images/photo18.jpg'
            },
            {
                text: 'Unforgettable Moments 🌈',
                image: './images/photo19.jpg'
            },
            {
                text: 'Unforgettable Moments 🌈',
                image: './images/photo20.jpg'
            }
        ];
        
        photoBtn.textContent = 'MENCETAK...';
        photoBtn.disabled = true;
        progressDiv.textContent = 'INITIALIZING CAMERA...';
        
        // Create horizontal photo strip container
        const photoStripHTML = `
            <div class="photo-strip-horizontal">
                <div class="photo-strip-header">PHOTOSTRIP SESSION</div>
                <div class="photo-frames-container-horizontal">
                    ${photos.map((photo, index) => `
                        <div class="photo-frame-horizontal" id="frame-${index + 1}">
                            <div class="photo-content">READY</div>
                        </div>
                    `).join('')}
                </div>
                <div class="photo-strip-footer">💕 MEMORIES 💕</div>
            </div>
        `;
        
        photoDisplay.innerHTML = photoStripHTML;
        currentPhotoIndex = 0;
        
        // Countdown before starting
        let countdown = 3;
        progressDiv.textContent = `GET READY... ${countdown}`;
        
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                progressDiv.textContent = `GET READY... ${countdown}`;
            } else {
                clearInterval(countdownInterval);
                progressDiv.textContent = 'SMILE! 📸';
                startPhotoCapture(photos);
            }
        }, 1000);
    }

    function startPhotoCapture(photos) {
        const progressDiv = document.querySelector('.photobox-progress');
        const photoBtn = document.querySelector('.photo-btn');
        const framesContainer = document.querySelector('.photo-frames-container-horizontal');
        const scrollIndicator = document.querySelector('.scroll-indicator-horizontal');
        
        const captureInterval = setInterval(() => {
            if (currentPhotoIndex < photos.length) {
                const frameId = `frame-${currentPhotoIndex + 1}`;
                const frame = document.getElementById(frameId);
                
                if (frame) {
                    // Flash effect
                    progressDiv.textContent = '✨ FLASH! ✨';
                    
                    // Auto scroll to current photo
                    setTimeout(() => {
                        if (framesContainer) {
                            try {
                                const frameLeft = frame.offsetLeft - framesContainer.offsetLeft;
                                const containerWidth = framesContainer.clientWidth;
                                const frameWidth = frame.clientWidth;
                                
                                const scrollPosition = frameLeft - (containerWidth / 2) + (frameWidth / 2);
                                
                                framesContainer.scrollTo({
                                    left: scrollPosition,
                                    behavior: 'smooth'
                                });
                            } catch (error) {
                                console.log('Scroll error:', error);
                                const frameLeft = frame.offsetLeft - framesContainer.offsetLeft;
                                framesContainer.scrollLeft = frameLeft - (framesContainer.clientWidth / 2);
                            }
                        }
                    }, 200);
                    
                    // Update frame content with image
                    setTimeout(() => {
                        frame.classList.add('filled');
                        
                        const photo = photos[currentPhotoIndex];
                        frame.innerHTML = `
                            <img src="${photo.image}" alt="${photo.text}" class="photo-image-horizontal" 
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                            <div class="photo-overlay-horizontal" style="display: none;">
                                <div class="photo-content">${photo.text}</div>
                            </div>
                        `;
                        
                        const displayCount = currentPhotoIndex + 1;
                        progressDiv.textContent = `CAPTURED ${displayCount}/${photos.length}`;
                        
                        if (currentPhotoIndex < photos.length - 1 && scrollIndicator) {
                            scrollIndicator.style.display = 'block';
                        }
                        
                        currentPhotoIndex++;
                        
                    }, 500);
                } else {
                    currentPhotoIndex++;
                }
                
            } else {
                clearInterval(captureInterval);
                
                if (scrollIndicator) {
                    scrollIndicator.style.display = 'none';
                }
                
                setTimeout(() => {
                    if (framesContainer) {
                        try {
                            framesContainer.scrollTo({ left: 0, behavior: 'smooth' });
                        } catch (error) {
                            framesContainer.scrollLeft = 0;
                        }
                    }
                }, 1000);
                
                setTimeout(() => {
                    progressDiv.textContent = '🎉 PHOTO STRIP COMPLETE! 🎉';
                    photoBtn.textContent = 'CETAK LAGI';
                    photoBtn.disabled = false;
                    
                    photoBtn.removeEventListener('click', startPhotoShow);
                    photoBtn.addEventListener('click', startNewSession);
                }, 2000);
            }
        }, 2500);
    }

    function startNewSession() {
        const photoBtn = document.querySelector('.photo-btn');
        const progressDiv = document.querySelector('.photobox-progress');
        
        // Reset for new session
        progressDiv.textContent = 'READY TO PRINT';
        photoBtn.textContent = 'MULAI CETAK';
        
        // Remove old listener and add original
        photoBtn.removeEventListener('click', startNewSession);
        photoBtn.addEventListener('click', startPhotoShow);
        
        // Clear display
        const photoDisplay = document.querySelector('.photo-display');
        if (photoDisplay) {
            photoDisplay.innerHTML = '<div class="photo-placeholder">Press MULAI CETAK to start photo session</div>';
        }
        
        // Reset photo index
        currentPhotoIndex = 0;
    }
    
    // Awards System
    function initializeAwards() {
    const awardsContent = document.querySelector('.awards-content');
    if (!awardsContent) {
        console.error('Awards content element not found!');
        return;
    }
    
    // Update state dengan awards baru
    appState.unlockedAwards = [
        'The Drama Queen Lifetime Achievement',
        'Best Partner in Gossip Crimes', 
        'Best in Ngakak Random Situations'
    ];
    
    console.log('Initializing awards with:', appState.unlockedAwards);
    
    awardsContent.innerHTML = `
        <div class="awards-header">
            <h3>ACHIEVEMENTS UNLOCKED</h3>
            <div class="awards-count">${appState.unlockedAwards.length} Awards</div>
        </div>
        <div class="award-grid">
            ${appState.unlockedAwards.map((award, index) => `
                <div class="award-card" style="opacity: 0; transform: translateY(20px);">
                    <div class="award-icon">${getAwardIcon(award)}</div>
                    <div class="award-title">${award}</div>
                    <div class="award-description">${getAwardDescription(award)}</div>
                </div>
            `).join('')}
        </div>
        <div class="achievement-text">${appState.unlockedAwards.length} Achievements Unlocked this Year!</div>
    `;
    
    // Animate awards entrance
    setTimeout(() => {
        animateAwardsEntrance();
    }, 100);
}

function getAwardIcon(award) {
    const icons = {
        'The Drama Queen Lifetime Achievement': '👑',
        'Best Partner in Gossip Crimes': '🕵️‍♀️',
        'Best in Ngakak Random Situations': '🤣'
    };
    return icons[award] || '🏆';
}

function getAwardDescription(award) {
    const descriptions = {
        'The Drama Queen Lifetime Achievement': 'karena tiap cerita tuh kayak sinetron 1000 episode',
        'Best Partner in Gossip Crimes': 'karena setiap gosip butuh saksi dan analis profesional', 
        'Best in Ngakak Random Situations': 'karena bisa ketawa bahkan pas halnya gak lucu-lucu amat'
    };
    return descriptions[award] || 'Achievement unlocked!';
}

function animateAwardsEntrance() {
    const awardCards = document.querySelectorAll('.award-card');
    console.log('Animating', awardCards.length, 'award cards');
    
    awardCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            card.style.transition = 'all 0.5s ease';
            playSound('level-up');
            
            if (index === awardCards.length - 1) {
                setTimeout(() => {
                    createConfettiEffect(document.querySelector('.awards-content'));
                }, 500);
            }
        }, index * 300);
    });
}

    // Jigsaw Puzzle functionality - Using image puzzle
    function initJigsawPuzzle() {
        const puzzleBoard = document.getElementById('puzzle-board');
        const puzzleStatus = document.getElementById('puzzle-status');
        
        if (!puzzleBoard || !puzzleStatus) return;
        
        // Initialize puzzle
        puzzleBoard.innerHTML = '';
        puzzlePieces = [1, 2, 3, 4, 5, 6, 7, 8, null];
        emptyIndex = 8;
        puzzleStatus.textContent = 'SOLVE THE PUZZLE!';
        
        // Shuffle pieces (Fisher-Yates algorithm)
        for (let i = puzzlePieces.length - 2; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [puzzlePieces[i], puzzlePieces[j]] = [puzzlePieces[j], puzzlePieces[i]];
        }
        
        // Find the new empty index
        emptyIndex = puzzlePieces.indexOf(null);
        
        // Create puzzle pieces with images
        puzzlePieces.forEach((piece, index) => {
            const pieceElement = document.createElement('div');
            pieceElement.className = piece ? 'puzzle-piece' : 'puzzle-piece empty';

            if (piece) {
                const img = document.createElement('img');
                img.className = 'puzzle-image-piece';
                img.src = `./puzzle/foto${piece}.png`; 
                img.alt = `Puzzle piece ${piece}`;
                img.onerror = function() {
                    this.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.textContent = piece;
                    fallback.style.cssText = 'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold;';
                    pieceElement.appendChild(fallback);
                };
            
                pieceElement.appendChild(img);
                pieceElement.addEventListener('click', function() {
                    movePuzzlePiece(index);
                });
            }

            puzzleBoard.appendChild(pieceElement);
        });
    }
    
    // Move puzzle piece
    function movePuzzlePiece(index) {
        // Check if piece can move (adjacent to empty space)
        const row = Math.floor(index / 3);
        const col = index % 3;
        const emptyRow = Math.floor(emptyIndex / 3);
        const emptyCol = emptyIndex % 3;
        
        const isAdjacent = 
            (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
            (Math.abs(col - emptyCol) === 1 && row === emptyRow);
        
        if (isAdjacent) {
            // Swap pieces
            [puzzlePieces[index], puzzlePieces[emptyIndex]] = [puzzlePieces[emptyIndex], puzzlePieces[index]];
            
            // Update empty index
            emptyIndex = index;
            
            // Update display
            updatePuzzleDisplay();
            playSound('click');
            
            // Check if solved
            checkPuzzleSolution();
        }
    }
    
    // Update puzzle display
    function updatePuzzleDisplay() {
        const pieces = document.querySelectorAll('.puzzle-piece');
        pieces.forEach((piece, index) => {
            piece.className = puzzlePieces[index] ? 'puzzle-piece' : 'puzzle-piece empty';
            
            if (puzzlePieces[index]) {
                piece.innerHTML = '';
                const img = document.createElement('img');
                img.className = 'puzzle-image-piece';
                img.src = `./puzzle/foto${puzzlePieces[index]}.png`; 
                img.alt = `Puzzle piece ${puzzlePieces[index]}`;
                img.onerror = function() {
                    this.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.textContent = puzzlePieces[index];
                    fallback.style.cssText = 'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold;';
                    piece.appendChild(fallback);
                };
                piece.appendChild(img);
                piece.onclick = function() { movePuzzlePiece(index); };
            } else {
                piece.innerHTML = '';
            }
        });
    }
    
    // Check if puzzle is solved
    function checkPuzzleSolution() {
        const solved = puzzlePieces.slice(0, 8).every((piece, index) => piece === index + 1);
        
        if (solved) {
            const puzzleStatus = document.getElementById('puzzle-status');
            if (puzzleStatus) {
                puzzleStatus.textContent = 'PUZZLE SOLVED! 🎉';
            }
            
            playSound('win');
            
            // Award key if not already collected
            if (!appState.completedPuzzles.includes('jigsaw')) {
                appState.completedPuzzles.push('jigsaw');
                appState.collectedKeys += 1;
                appState.tokens += 50;
                updateTokenDisplay();
                saveGameState();
            }
            
            // Add celebration effect
            setTimeout(() => {
                createConfettiEffect(document.getElementById('jigsaw-screen'));
            }, 500);
            
            showToast('Puzzle completed! You earned a key and 50 tokens.');
        }
    }

    function showHint() {
        // Highlight pieces that are in wrong position
        const pieces = document.querySelectorAll('.puzzle-piece');
        let wrongPieces = 0;
        
        pieces.forEach((piece, index) => {
            if (puzzlePieces[index] && puzzlePieces[index] !== index + 1) {
                piece.style.border = '5px solid var(--purple-pixel)';
                wrongPieces++;
                
                // Remove highlight after delay
                setTimeout(() => {
                    piece.style.border = '';
                }, 2000);
            }
        });
        
        if (wrongPieces === 0) {
            showToast('All pieces are in the correct position!');
        } else {
            showToast(`Found ${wrongPieces} pieces in wrong position`);
            playSound('hint');
        }
    }

    function resetPuzzle() {
        initJigsawPuzzle();
        showToast('Puzzle reset');
        playSound('reset');
    }

    // Reveal screen functionality
    function initReveal() {
        showConfetti();
        initVideoPlayer();
        startTypewriterEffect();
        updateAchievementStats();
    }

    // Dalam function initReveal(), tambahkan:
function initReveal() {
    showConfetti();
    initVideoPlayer();
    startTypewriterEffect();
    updateAchievementStats(); // Tambahkan ini
}

// Tambahkan fungsi baru untuk update stats
function updateAchievementStats() {
    const memoryCount = document.getElementById('memory-count');
    const tokenCount = document.getElementById('token-count');
    const awardCount = document.getElementById('award-count');
    
    if (memoryCount) memoryCount.textContent = '20'; // Ganti dengan data aktual
    if (tokenCount) tokenCount.textContent = appState.tokens;
    if (awardCount) awardCount.textContent = appState.unlockedAwards.length;
}

    function initVideoPlayer() {
        const playVideoBtn = document.querySelector('[data-action="play-video"]');
        if (playVideoBtn) {
            playVideoBtn.addEventListener('click', playVideo);
        }
    }   

    function playVideo() {
    const videoContainer = document.getElementById('video-container');
    const playBtn = document.querySelector('.play-video-btn');
    const downloadBtn = document.querySelector('.download-video-btn');
    
    if (!videoContainer) return;
    
    // Tampilkan loading state
    videoContainer.innerHTML = `
        <div class="video-loading">
            <div class="loading-spinner"></div>
            <div style="margin-left: 10px; color: var(--pink-soft);">Preparing video player...</div>
        </div>
    `;
    
    const DRIVE_FILE_ID = '1-xLyPWkK4vacrnywp3Tcw1G1c_xXfcRH';
    
    console.log('Loading video with ID:', DRIVE_FILE_ID);
    
    // Langsung gunakan metode direct download karena embed diblokir
    tryDirectVideoMethod();
    
    function tryDirectVideoMethod() {
        console.log('Using direct video method...');
        
        // URL untuk direct playback (coba beberapa format)
        const directUrls = [
            `https://drive.google.com/uc?export=download&id=${DRIVE_FILE_ID}`,
            `https://www.googleapis.com/drive/v3/files/${DRIVE_FILE_ID}?alt=media&key=YOUR_API_KEY`, // Butuh API key
        ];
        
        const video = document.createElement('video');
        video.className = 'birthday-video';
        video.controls = true;
        video.autoplay = true;
        video.style.width = '100%';
        video.style.borderRadius = '8px';
        video.style.maxHeight = '400px';
        video.preload = 'auto';
        
        // Coba URL pertama (direct download)
        const source = document.createElement('source');
        source.src = directUrls[0];
        source.type = 'video/mp4';
        
        video.appendChild(source);
        
        video.onloadeddata = function() {
            console.log('✅ Video loaded successfully via direct method');
            playSound('video');
            
            if (downloadBtn) {
                downloadBtn.style.display = 'inline-block';
                downloadBtn.onclick = function() {
                    window.open(`https://drive.google.com/uc?export=download&id=${DRIVE_FILE_ID}`, '_blank');
                };
            }
            
            if (playBtn) {
                playBtn.textContent = 'REPLAY VIDEO';
            }
            
            showToast('Video berhasil dimuat! 🎬');
        };
        
        video.oncanplay = function() {
            console.log('Video can play');
        };
        
        video.onerror = function(e) {
            console.log('❌ Direct video error:', e);
            console.log('Video error code:', video.error);
            
            // Coba metode fallback
            showEnhancedFallback();
        };
        
        video.onstalled = function() {
            console.log('Video stalled, showing fallback');
            showEnhancedFallback();
        };
        
        // Timeout fallback
        setTimeout(() => {
            if (video.readyState < 2) { // BELUM loaded
                console.log('Video loading timeout');
                showEnhancedFallback();
            }
        }, 10000); // 10 second timeout
        
        videoContainer.innerHTML = '';
        videoContainer.appendChild(video);
        
        // Coba play programmatically
        setTimeout(() => {
            video.play().catch(e => {
                console.log('Auto-play blocked:', e);
                // Tampilkan manual play button
                showManualPlayButton(video);
            });
        }, 1000);
    }
    
    function showManualPlayButton(videoElement) {
        const playOverlay = document.createElement('div');
        playOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            border-radius: 8px;
            color: white;
            z-index: 10;
        `;
        
        playOverlay.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 10px;">▶️</div>
            <div style="font-size: 16px; margin-bottom: 15px;">Click to play video</div>
            <button class="pixel-btn" style="z-index: 11;">PLAY VIDEO</button>
        `;
        
        const playBtn = playOverlay.querySelector('.pixel-btn');
        playBtn.onclick = function(e) {
            e.stopPropagation();
            videoElement.play().then(() => {
                playOverlay.style.display = 'none';
            }).catch(err => {
                console.log('Manual play failed:', err);
                showEnhancedFallback();
            });
        };
        
        videoElement.parentNode.style.position = 'relative';
        videoElement.parentNode.appendChild(playOverlay);
    }
    
    function showEnhancedFallback() {
        console.log('Showing enhanced fallback options');
        
        videoContainer.innerHTML = `
            <div class="video-fallback-container">
                
                <div class="fallback-options">
                    <div class="fallback-option">
                        <div class="option-icon">📺</div>
                        <div class="option-content">
                            <h4>Watch in Google Drive</h4>
                            <p>Open video in new tab for best experience</p>
                            <button class="pixel-btn option-btn" onclick="window.open('https://drive.google.com/file/d/${DRIVE_FILE_ID}/view', '_blank')">
                                OPEN IN DRIVE
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="fallback-footer">
                    <small>If videos don't work, make sure your Google Drive file is set to "Anyone with the link can view"</small>
                </div>
            </div>
        `;
        
        showToast('Semoga suka sama videonya!');
    }
    
    showToast('Mempersiapkan video spesial untuk kamu... 💕');
}

// Tambahkan fungsi untuk menangani resize
function setupResponsiveHandlers() {
    let resizeTimeout;
    
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 250);
    });
    
    // Handle orientation changes
    window.addEventListener('orientationchange', function() {
        setTimeout(handleResize, 500);
    });
}

function handleResize() {
    console.log('Window resized to:', window.innerWidth, 'x', window.innerHeight);
    
    // Adjust layout based on screen size
    if (window.innerWidth <= 768) {
        document.body.classList.add('mobile-layout');
        // Mobile-specific adjustments
        adjustForMobile();
    } else {
        document.body.classList.remove('mobile-layout');
        // Desktop adjustments
        adjustForDesktop();
    }
    
    // Re-initialize current screen components if needed
    reinitializeCurrentScreen();
}

function adjustForMobile() {
    // Mobile-specific adjustments
    const buttons = document.querySelectorAll('.pixel-btn');
    buttons.forEach(btn => {
        btn.style.minHeight = '44px';
        btn.style.padding = '12px 20px';
    });
    
    // Adjust carousel height
    const carousel = document.querySelector('.carousel-container');
    if (carousel) {
        carousel.style.height = '250px';
    }
}

function adjustForDesktop() {
    // Reset desktop styles
    const buttons = document.querySelectorAll('.pixel-btn');
    buttons.forEach(btn => {
        btn.style.minHeight = '';
        btn.style.padding = '';
    });
    
    const carousel = document.querySelector('.carousel-container');
    if (carousel) {
        carousel.style.height = '300px';
    }
}

function reinitializeCurrentScreen() {
    // Re-initialize components based on current screen
    switch(appState.currentScreen) {
        case 'wrapped':
            updateCarousel();
            break;
        case 'jigsaw':
            // Adjust puzzle size if needed
            const puzzleBoard = document.getElementById('puzzle-board');
            if (puzzleBoard && window.innerWidth <= 480) {
                puzzleBoard.style.width = '200px';
                puzzleBoard.style.height = '200px';
            }
            break;
    }
}

    function startTypewriterEffect() {
    const letterContent = document.querySelector('.letter-content');
    if (!letterContent) return;
    
    const originalText = letterContent.innerHTML;
    letterContent.innerHTML = '';
    
    const text = `Dear Bestieeee! 🎂✨

HAPPY BIRTHDAY SUURR!! 🥳💗
cieee yg udah umur 200 eh 20 maksudnya xixi, perasaan baru tahun lalu kita lulus SMA, eh sekarang udah setahun aja kita lewatin semua bareng-bareng

Tapi sumpah, tiap inget masa-masa dulu tuh masih ngakak dan aku bersyukur banget, dari sekian banyak orang yang dateng dan pergi, kamu masih tetep di sini 🫶
Makasih yaa udah jadi temen paling random, paling rame, tapi juga paling ngerti aku.
Makasih udah mau dengerin curhatan aku yang gak penting banget — Yang bisa jadi tempat curhat, tempat ketawa sampe guling-guling, tempat ngomel bareng soal hidup (dan tugas kuliah) 😩💅
Terus makasih juga udah selalu ada di semua momen, entah lagi ketawa sampe sakit perut, atau nangis bareng gara-gara hal receh.

Doaku buat kamu, semoga hidup kamu makin tenang, makin bahagia, makin dapet hal-hal baik yang kamu pantas dapetin.
Semoga kuliahnya lancar, rezekinya lancar, hatinya juga… yaa semoga gak diganggu orang random lagi 😌
Dan kalo lagi capek banget, inget aja: kamu tuh hebat banget bisa sejauh ini — jangan terlalu keras sama diri sendiri okaay?

Kamu tuh keren banget, dan aku yakin kamu bakal ngelakuin hal-hal luar biasa di masa depan
Aku tau hidup makin sibuk, tapi plis jangan ilang.
Kalo kamu ilang, nantik syapa yg mw diajak healing klo stress 😭
Pokoknya makasih udah jadi bagian dari hidup aku, dan semoga nanti kita tetep bisa ngakak bareng walau udah pada sibuk masing-masing 🫶

Sekali lagi, HAPPY BIRTHDAY YAAAAA!! 🎉
Semoga tahun ini lebih banyak tawa, sedikit drama (kalo bisa 😭), dan banyak jajan gratis 🧁✨
Love u suur, jangan ilang, nanti aku gabisa gosip, hehe 😭🫶

With all my love,
Your Bestie 💕`;
    
    let i = 0;
    clearInterval(typewriterInterval);
    
    typewriterInterval = setInterval(() => {
        if (i < text.length) {
            letterContent.innerHTML += text.charAt(i);
            i++;
            letterContent.scrollTop = letterContent.scrollHeight;
        } else {
            clearInterval(typewriterInterval);
        }
    }, 50);
}

    // Post-reveal functionality
    function initPostReveal() {
        // Populate star gallery with messages
        populateStarGallery();
    }

    function populateStarGallery() {
        const messagesContainer = document.querySelector('.messages-container');
        if (!messagesContainer) return;
        
        // Clear existing messages
        messagesContainer.innerHTML = '';
        
        // Add sample messages
        const sampleMessages = [
            { name: 'Pixel Friend', message: 'Happy Birthday! Hope your day is as amazing as you are! 🌟' },
            { name: 'Retro Pal', message: 'Wishing you a day filled with joy and pixel-perfect moments! 🎮' },
            { name: 'Digital Buddy', message: 'Another year older, another level unlocked! Happy birthday! 🎉' }
        ];
        
        sampleMessages.forEach((msg, index) => {
            const messageElement = document.createElement('div');
            messageElement.className = 'star-message';
            messageElement.innerHTML = `
                <div class="message-author">${msg.name}</div>
                <div class="message-text">${msg.message}</div>
            `;
            
            messagesContainer.appendChild(messageElement);
        });
        
        // Add user messages from state
        appState.starMessages.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.className = 'star-message user-message';
            messageElement.innerHTML = `
                <div class="message-author">You</div>
                <div class="message-text">${msg}</div>
            `;
            
            messagesContainer.appendChild(messageElement);
        });
    }

    function submitMessage() {
        const messageTextarea = document.querySelector('.message-form textarea');
        if (!messageTextarea) return;
        
        const message = messageTextarea.value.trim();
        if (message) {
            // Add to state
            appState.starMessages.push(message);
            
            // Save state
            saveGameState();
            
            // Update display
            populateStarGallery();
            
            // Clear textarea
            messageTextarea.value = '';
            
            // Show confirmation
            showToast('Message added to star gallery!');
            playSound('message');
        } else {
            showToast('Please write a message first');
        }
    }

    function generatePoster() {
        // In a real implementation, this would generate a downloadable poster
        showToast('Generating your pixel poster...');
        
        // Simulate generation delay
        setTimeout(() => {
            showToast('Poster generated! Ready to download.');
            playSound('poster');
        }, 1500);
    }

    function downloadYearbook() {
        // In a real implementation, this would generate and download a PDF
        showToast('Preparing your yearbook download...');
        
        // Simulate download delay
        setTimeout(() => {
            showToast('Yearbook downloaded successfully!');
            playSound('download');
        }, 2000);
    }

    function shareMoment() {
        // In a real implementation, this would use the Web Share API
        if (navigator.share) {
            navigator.share({
                title: 'My Pixverse Journey',
                text: 'Check out my personalized pixel universe!',
                url: window.location.href
            })
            .then(() => showToast('Thanks for sharing!'))
            .catch(() => showToast('Sharing cancelled'));
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href)
                .then(() => showToast('Link copied to clipboard!'))
                .catch(() => showToast('Failed to copy link'));
        }
        
        playSound('share');
    }

    function handleSocialShare(platform) {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent('Check out my personalized Pixverse!');
        
        let shareUrl = '';
        
        switch(platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'instagram':
                // Instagram doesn't support direct sharing, so we'll just copy
                navigator.clipboard.writeText(window.location.href)
                    .then(() => showToast('Link copied! Paste it in your Instagram story'))
                    .catch(() => showToast('Failed to copy link'));
                return;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
        
        playSound('share');
    }

    // Modal functionality
    function closeModal() {
        if (modal) modal.classList.remove('active');
    }

    function pinMemory() {
        showToast('Memory pinned to your collection!');
        playSound('pin');
        closeModal();
    }

    // Utility functions
    function showToast(message, duration = 3000) {
        const toastContent = toast.querySelector('.toast-content');
        if (toastContent) {
            toastContent.textContent = message;
        }
        
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, duration);
    }

    function showConfetti() {
        // Simple confetti effect
        const confettiCount = 50;
        const container = document.getElementById('pixverse-container');
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.cssText = `
                    position: fixed;
                    width: 10px;
                    height: 10px;
                    background: var(--pink-accent);
                    top: -20px;
                    left: ${Math.random() * 100}%;
                    animation: fall ${1 + Math.random() * 2}s linear forwards;
                    z-index: 1000;
                `;
                
                container.appendChild(confetti);
                
                setTimeout(() => {
                    if (confetti.parentNode) {
                        container.removeChild(confetti);
                    }
                }, 3000);
            }, i * 100);
        }
    }

    function createConfettiEffect(container) {
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.cssText = `
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    background: var(--pink-accent);
                    top: 50%;
                    left: 50%;
                    animation: confettiFall ${1 + Math.random() * 2}s ease-out forwards;
                    z-index: 10;
                `;
                
                container.appendChild(confetti);
                
                setTimeout(() => {
                    if (confetti.parentNode) {
                        container.removeChild(confetti);
                    }
                }, 2000);
            }, i * 50);
        }
    }

    // Start Journey Function - FIXED VERSION
    function startJourney() {
        console.log('🎮 START JOURNEY TRIGGERED!');
        
        // Set flag bahwa journey sudah dimulai
        appState.journeyStarted = true;
        appState.currentScreen = 'wrapped';
        
        // Simpan state terlebih dahulu
        saveGameState();
        
        // Navigate ke wrapped screen
        showScreen('wrapped');
        playSound('start');
        
        // Tambahkan confetti untuk celebration
        setTimeout(() => {
            createConfettiEffect(screens.wrapped);
        }, 500);
        
        showToast('Welcome to your Pixverse! 🎉');
    }

    function restartJourney() {
        // Reset game state
        appState.collectedKeys = 0;
        appState.tokens = 0;
        appState.xp = 0;
        appState.completedPuzzles = [];
        appState.pinnedMemories = [];
        appState.starMessages = [];
        appState.viewedCards = [];
        appState.journeystarted = false;
        
        // Save reset state
        saveGameState();
        
        // Go back to countdown
        showScreen('countdown');
        
        showToast('Journey restarted!');
        playSound('restart');
    }

    // Game state management
    function saveGameState() {
        try {
            localStorage.setItem('pixverseState', JSON.stringify(appState));
        } catch (e) {
            console.warn('Could not save game state:', e);
        }
    }

    function loadGameState() {
        try {
            const saved = localStorage.getItem('pixverseState');
            if (saved) {
                const loadedState = JSON.parse(saved);
                Object.assign(appState, loadedState);
                updateTokenDisplay();
                
                // Jika journey sudah dimulai, langsung ke wrapped screen setelah loading
                if (appState.journeyStarted && appState.currentScreen === 'loading') {
                    setTimeout(() => {
                        showScreen('wrapped');
                    }, 500);
                }
            }
        } catch (e) {
            console.warn('Could not load game state:', e);
        }
    }

    // Start the application
    init();
});

// Add CSS animations to the document
const style = document.createElement('style');
style.textContent = `
    @keyframes floatParticle {
        0%, 100% { transform: translateY(0) translateX(0); opacity: 1; }
        50% { transform: translateY(-20px) translateX(10px); opacity: 0.7; }
    }
    
    @keyframes fall {
        to { transform: translateY(100vh) rotate(360deg); opacity: 0; }
    }
    
    @keyframes confettiFall {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
        100% { transform: translate(${Math.random() * 200 - 100}px, 100vh) rotate(360deg); opacity: 0; }
    }
    
    .loading-particle {
        animation: floatParticle 3s ease-in-out infinite;
    }
    
    .confetti {
        pointer-events: none;
    }
    
    .award-card {
        opacity: 0;
        transform: translateY(20px);
        transition: all 5s ease;
    }
`;
document.head.appendChild(style);