/* PMusic - Metrolist-inspired Material 3 Music Player */
/* Features: Sleep Timer, Lyrics, Download, Audio Effects, Full-screen Player */

// Global State
let player = null;
let currentVideoId = null;
let currentSongInfo = null;
let isPlaying = false;
let isMiniPlayer = true;
let isFullPlayer = false;
let isShuffle = false;
let repeatMode = 0; // 0: off, 1: all, 2: one
let queue = [];
let currentQueueIndex = -1;
let likedSongs = [];
let history = [];
let playlists = [];
let recentlyPlayed = [];
let downloads = [];
let sleepTimer = null;
let sleepTimerEndTime = null;
let currentVolume = 100;
let isMuted = false;
let audioEffects = {
    skipSilence: false,
    normalize: false,
    tempo: 1.0,
    pitch: 0
};

// DOM Elements
let searchInput, clearSearchBtn;
let miniPlayer, miniThumbnail, miniTitle, miniArtist, miniPlayPauseBtn, miniNextBtn, miniLikeBtn;
let miniProgressBar, miniProgressFill;
let fullPlayer, fullThumbnail, fullTitle, fullArtist, fullPlayPauseBtn;
let fullPrevBtn, fullNextBtn, fullShuffleBtn, fullRepeatBtn, fullLikeBtn;
let fullProgressBar, fullProgressFill, fullCurrentTime, fullTotalTime;
let fullPlayerBg, collapsePlayer, playingFrom;
let lyricsPanel, lyricsContent, closeLyrics, lyricsBtn;
let queuePanel, closeQueuePanel, queuePanelList;
let settingsModal, closeSettingsModal, settingsBtn;
let sleepTimerModal, closeSleepTimerModal, sleepTimerBtn;
let addToPlaylistMenu, songOptionsMenu;
let toast, toastMessage;

// Cache
const videoCache = new Map();
const searchCache = new Map();

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    loadAllFromStorage();
    setupEventListeners();
    setupNavigation();
    loadTrendingSongs();
    renderRecentlyPlayed();
    renderLikedSongs();
    renderHistory();
    renderPlaylists();
    renderDownloads();
    setupTheme();
    updateGreeting();
    preloadYouTubeAPI();
});

function initializeElements() {
    // Search
    searchInput = document.getElementById('searchInput');
    clearSearchBtn = document.getElementById('clearSearch');
    
    // Mini Player
    miniPlayer = document.getElementById('miniPlayer');
    miniThumbnail = document.getElementById('miniThumbnail');
    miniTitle = document.getElementById('miniTitle');
    miniArtist = document.getElementById('miniArtist');
    miniPlayPauseBtn = document.getElementById('miniPlayPauseBtn');
    miniNextBtn = document.getElementById('miniNextBtn');
    miniLikeBtn = document.getElementById('miniLikeBtn');
    miniProgressBar = document.getElementById('miniProgressBar');
    miniProgressFill = document.getElementById('miniProgressFill');
    
    // Full Player
    fullPlayer = document.getElementById('fullPlayer');
    fullThumbnail = document.getElementById('fullThumbnail');
    fullTitle = document.getElementById('fullTitle');
    fullArtist = document.getElementById('fullArtist');
    fullPlayPauseBtn = document.getElementById('fullPlayPauseBtn');
    fullPrevBtn = document.getElementById('fullPrevBtn');
    fullNextBtn = document.getElementById('fullNextBtn');
    fullShuffleBtn = document.getElementById('fullShuffleBtn');
    fullRepeatBtn = document.getElementById('fullRepeatBtn');
    fullLikeBtn = document.getElementById('fullLikeBtn');
    fullProgressBar = document.getElementById('fullProgressBar');
    fullProgressFill = document.getElementById('fullProgressFill');
    fullCurrentTime = document.getElementById('fullCurrentTime');
    fullTotalTime = document.getElementById('fullTotalTime');
    fullPlayerBg = document.getElementById('fullPlayerBg');
    collapsePlayer = document.getElementById('collapsePlayer');
    playingFrom = document.getElementById('playingFrom');
    
    // Lyrics
    lyricsPanel = document.getElementById('lyricsPanel');
    lyricsContent = document.getElementById('lyricsContent');
    closeLyrics = document.getElementById('closeLyrics');
    lyricsBtn = document.getElementById('lyricsBtn');
    
    // Queue
    queuePanel = document.getElementById('queuePanel');
    closeQueuePanel = document.getElementById('closeQueuePanel');
    queuePanelList = document.getElementById('queuePanelList');
    
    // Settings
    settingsModal = document.getElementById('settingsModal');
    closeSettingsModal = document.getElementById('closeSettingsModal');
    settingsBtn = document.getElementById('settingsBtn');
    
    // Sleep Timer
    sleepTimerModal = document.getElementById('sleepTimerModal');
    closeSleepTimerModal = document.getElementById('closeSleepTimerModal');
    sleepTimerBtn = document.getElementById('sleepTimerBtn');
    
    // Menus
    addToPlaylistMenu = document.getElementById('addToPlaylistMenu');
    songOptionsMenu = document.getElementById('songOptionsMenu');
    
    // Toast
    toast = document.getElementById('toast');
    toastMessage = document.getElementById('toastMessage');
}

function setupEventListeners() {
    // Search
    searchInput.addEventListener('input', handleSearchInput);
    clearSearchBtn.addEventListener('click', clearSearch);
    
    // Mini Player
    document.getElementById('miniPlayerInfo').addEventListener('click', expandFullPlayer);
    miniPlayPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlayPause();
    });
    miniNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playNext();
    });
    miniLikeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLikeCurrent();
    });
    
    // Full Player
    collapsePlayer.addEventListener('click', collapseFullPlayer);
    fullPlayPauseBtn.addEventListener('click', togglePlayPause);
    fullPrevBtn.addEventListener('click', playPrevious);
    fullNextBtn.addEventListener('click', playNext);
    fullShuffleBtn.addEventListener('click', toggleShuffle);
    fullRepeatBtn.addEventListener('click', toggleRepeat);
    fullLikeBtn.addEventListener('click', toggleLikeCurrent);
    fullProgressBar.addEventListener('click', handleProgressClick);
    
    // Lyrics
    lyricsBtn.addEventListener('click', openLyrics);
    closeLyrics.addEventListener('click', closeLyricsPanel);
    
    // Queue
    document.getElementById('queueBtn').addEventListener('click', openQueue);
    closeQueuePanel.addEventListener('click', closeQueueSheet);
    document.getElementById('clearQueue').addEventListener('click', clearQueue);
    document.getElementById('shuffleQueue').addEventListener('click', shuffleQueue);
    
    // Sleep Timer
    sleepTimerBtn.addEventListener('click', openSleepTimer);
    closeSleepTimerModal.addEventListener('click', closeSleepTimer);
    document.querySelectorAll('.timer-option').forEach(btn => {
        btn.addEventListener('click', () => setSleepTimer(parseInt(btn.dataset.time)));
    });
    document.getElementById('cancelTimer').addEventListener('click', cancelSleepTimer);
    
    // Download
    document.getElementById('downloadBtn').addEventListener('click', downloadCurrentSong);
    
    // Settings
    settingsBtn.addEventListener('click', openSettings);
    closeSettingsModal.addEventListener('click', closeSettings);
    
    // Settings toggles
    document.getElementById('skipSilenceToggle').addEventListener('change', (e) => {
        audioEffects.skipSilence = e.target.checked;
        saveSettings();
    });
    document.getElementById('audioNormalizeToggle').addEventListener('change', (e) => {
        audioEffects.normalize = e.target.checked;
        saveSettings();
    });
    document.getElementById('tempoSlider').addEventListener('input', (e) => {
        audioEffects.tempo = parseFloat(e.target.value);
        document.getElementById('tempoValue').textContent = audioEffects.tempo.toFixed(1) + 'x';
        applyAudioEffects();
        saveSettings();
    });
    document.getElementById('pitchSlider').addEventListener('input', (e) => {
        audioEffects.pitch = parseInt(e.target.value);
        document.getElementById('pitchValue').textContent = audioEffects.pitch;
        applyAudioEffects();
        saveSettings();
    });
    document.getElementById('darkThemeToggle').addEventListener('change', toggleTheme);
    document.getElementById('pureBlackToggle').addEventListener('change', togglePureBlack);
    document.getElementById('clearOfflineBtn').addEventListener('click', clearOfflineSongs);
    
    // Create Playlist
    document.getElementById('createPlaylistBtn').addEventListener('click', openCreatePlaylist);
    document.getElementById('closeCreatePlaylistModal').addEventListener('click', closeCreatePlaylist);
    document.getElementById('cancelCreatePlaylist').addEventListener('click', closeCreatePlaylist);
    document.getElementById('confirmCreatePlaylist').addEventListener('click', createPlaylist);
    
    // Play Liked
    document.getElementById('playLiked').addEventListener('click', playLikedSongs);
    
    // Library Tabs
    document.querySelectorAll('.library-tabs .tab-btn').forEach(tab => {
        tab.addEventListener('click', () => switchLibraryTab(tab.dataset.tab));
    });
    
    // Search Categories
    document.querySelectorAll('.search-categories .chip').forEach(chip => {
        chip.addEventListener('click', () => filterSearchResults(chip.dataset.filter));
    });
    
    // Close sheets on overlay click
    document.querySelectorAll('.bottom-sheet-overlay, .modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', () => {
            const sheet = overlay.closest('.bottom-sheet, .modal');
            if (sheet) sheet.classList.add('hidden');
        });
    });
    
    // Song Options
    document.getElementById('optPlayNext').addEventListener('click', () => {
        playNextFromOptions();
        closeSongOptions();
    });
    document.getElementById('optAddToQueue').addEventListener('click', () => {
        addToQueueFromOptions();
        closeSongOptions();
    });
    document.getElementById('optAddToPlaylist').addEventListener('click', () => {
        openAddToPlaylist();
        closeSongOptions();
    });
    document.getElementById('optDownload').addEventListener('click', () => {
        downloadFromOptions();
        closeSongOptions();
    });
    document.getElementById('optGoToArtist').addEventListener('click', () => {
        goToArtistFromOptions();
        closeSongOptions();
    });
    document.getElementById('optRemove').addEventListener('click', () => {
        removeFromOptions();
        closeSongOptions();
    });
}

function setupNavigation() {
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.dataset.view;
            showView(view);
            updateActiveNav(item);
        });
    });
}

function showView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const targetView = document.getElementById(viewName + 'View');
    if (targetView) {
        targetView.classList.add('active');
        if (viewName === 'search' && searchInput.value.trim()) {
            performSearch(searchInput.value.trim());
        }
    }
}

function updateActiveNav(activeItem) {
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

// Search
async function handleSearchInput(e) {
    const query = e.target.value.trim();
    
    if (query.length > 0) {
        clearSearchBtn.classList.remove('hidden');
        await performSearch(query);
    } else {
        clearSearchBtn.classList.add('hidden');
        showView('home');
    }
}

async function performSearch(query) {
    try {
        // Check cache
        if (searchCache.has(query)) {
            displaySearchResults(searchCache.get(query));
            showView('search');
            return;
        }
        
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.videos) {
            searchCache.set(query, data.videos);
            displaySearchResults(data.videos);
            showView('search');
        }
    } catch (error) {
        console.error('Search error:', error);
        showToast('Search failed. Please try again.');
    }
}

function displaySearchResults(videos) {
    const container = document.getElementById('searchResults');
    container.innerHTML = videos.map(video => createSongItemHTML(video, 'search')).join('');
    
    // Add click handlers
    container.querySelectorAll('.song-item').forEach((item, index) => {
        item.addEventListener('click', () => playVideo(videos[index].id, videos[index]));
        
        const moreBtn = item.querySelector('.song-more-btn');
        if (moreBtn) {
            moreBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openSongOptions(videos[index], item);
            });
        }
    });
}

function createSongItemHTML(song, context = 'default') {
    const isLiked = isSongLiked(song.id);
    return `
        <div class="song-item" data-id="${song.id}">
            <div class="song-thumbnail">
                <img src="${song.thumbnail}" alt="${song.title}">
            </div>
            <div class="song-info">
                <div class="song-title">${song.title}</div>
                <div class="song-artist">${song.artist}</div>
            </div>
            <div class="song-actions">
                <button class="btn-icon small like-btn ${isLiked ? 'liked' : ''}" data-id="${song.id}">
                    <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <button class="btn-icon small song-more-btn" data-id="${song.id}">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
        </div>
    `;
}

function clearSearch() {
    searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    showView('home');
}

// Video Playback
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtubePlayer', {
        height: '1',
        width: '1',
        playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0
        },
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    player.setVolume(currentVolume);
    updateVolumeDisplay();
}

function onPlayerStateChange(event) {
    isPlaying = event.data === YT.PlayerState.PLAYING;
    updatePlayPauseButton();
    
    if (event.data === YT.PlayerState.PLAYING) {
        startProgressUpdate();
        addToRecentlyPlayed(currentSongInfo);
    } else if (event.data === YT.PlayerState.ENDED) {
        handleSongEnd();
    }
}

async function playVideo(id, songInfo = null) {
    if (!player || !player.loadVideoById) {
        setTimeout(() => playVideo(id, songInfo), 100);
        return;
    }
    
    currentVideoId = id;
    
    // Check cache
    if (!songInfo && videoCache.has(id)) {
        songInfo = videoCache.get(id);
    }
    
    if (!songInfo) {
        const queueItem = queue.find(item => item.id === id);
        const likedItem = likedSongs.find(item => item.id === id);
        const historyItem = history.find(item => item.id === id);
        const downloadItem = downloads.find(item => item.id === id);
        songInfo = queueItem || likedItem || historyItem || downloadItem;
        
        if (!songInfo) {
            try {
                const response = await fetch(`/api/video/${id}`);
                songInfo = await response.json();
                videoCache.set(id, songInfo);
            } catch (e) {
                songInfo = { id, title: 'Unknown', artist: 'Unknown' };
            }
        }
    }
    
    currentSongInfo = songInfo;
    player.loadVideoById(id);
    updatePlayerDisplay(songInfo);
    highlightPlayingInLists();
    addToHistory(songInfo);
    applyAudioEffects();
}

function updatePlayerDisplay(songInfo) {
    const thumbnailUrl = songInfo.thumbnail || `https://img.youtube.com/vi/${currentVideoId}/mqdefault.jpg`;
    
    // Mini Player
    miniTitle.textContent = songInfo.title || 'Unknown';
    miniArtist.textContent = songInfo.artist || 'Unknown';
    miniThumbnail.innerHTML = `<img src="${thumbnailUrl}" alt="${songInfo.title}">`;
    miniLikeBtn.innerHTML = `<i class="${isSongLiked(currentVideoId) ? 'fas' : 'far'} fa-heart"></i>`;
    miniLikeBtn.classList.toggle('liked', isSongLiked(currentVideoId));
    
    // Full Player
    fullTitle.textContent = songInfo.title || 'Unknown';
    fullArtist.textContent = songInfo.artist || 'Unknown';
    fullThumbnail.innerHTML = `<img src="${thumbnailUrl}" alt="${songInfo.title}">`;
    fullPlayerBg.style.backgroundImage = `url(${thumbnailUrl})`;
    fullLikeBtn.innerHTML = `<i class="${isSongLiked(currentVideoId) ? 'fas' : 'far'} fa-heart"></i>`;
    fullLikeBtn.classList.toggle('liked', isSongLiked(currentVideoId));
    
    // Update queue info
    const queueIndex = queue.findIndex(item => item.id === currentVideoId);
    if (queueIndex !== -1) {
        currentQueueIndex = queueIndex;
        playingFrom.textContent = 'Queue';
    }
}

function togglePlayPause() {
    if (!player) return;
    
    if (isPlaying) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
}

function updatePlayPauseButton() {
    const icon = isPlaying ? 'fa-pause' : 'fa-play';
    miniPlayPauseBtn.innerHTML = `<i class="fas ${icon}"></i>`;
    fullPlayPauseBtn.innerHTML = `<i class="fas ${icon}"></i>`;
}

function playNext() {
    if (queue.length === 0) return;
    
    let nextIndex;
    if (isShuffle) {
        nextIndex = Math.floor(Math.random() * queue.length);
    } else {
        nextIndex = (currentQueueIndex + 1) % queue.length;
    }
    
    if (repeatMode === 2 && currentVideoId) {
        playVideo(currentVideoId, currentSongInfo);
    } else if (queue[nextIndex]) {
        playVideo(queue[nextIndex].id, queue[nextIndex]);
    }
}

function playPrevious() {
    if (queue.length === 0) return;
    
    const prevIndex = currentQueueIndex > 0 ? currentQueueIndex - 1 : queue.length - 1;
    if (queue[prevIndex]) {
        playVideo(queue[prevIndex].id, queue[prevIndex]);
    }
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    fullShuffleBtn.classList.toggle('active', isShuffle);
    showToast(isShuffle ? 'Shuffle on' : 'Shuffle off');
}

function toggleRepeat() {
    repeatMode = (repeatMode + 1) % 3;
    const icons = ['fa-redo', 'fa-redo', 'fa-redo-alt'];
    const texts = ['Off', 'All', 'One'];
    fullRepeatBtn.innerHTML = `<i class="fas ${icons[repeatMode]}"></i>`;
    fullRepeatBtn.classList.toggle('active', repeatMode !== 0);
    showToast(`Repeat: ${texts[repeatMode]}`);
}

function handleSongEnd() {
    if (repeatMode === 2) {
        playVideo(currentVideoId, currentSongInfo);
    } else {
        playNext();
    }
}

// Full Player
function expandFullPlayer() {
    if (!currentVideoId) return;
    isFullPlayer = true;
    fullPlayer.classList.add('active');
}

function collapseFullPlayer() {
    isFullPlayer = false;
    fullPlayer.classList.remove('active');
    lyricsPanel.classList.add('hidden');
}

function openLyrics() {
    lyricsPanel.classList.remove('hidden');
    fetchLyrics();
}

function closeLyricsPanel() {
    lyricsPanel.classList.add('hidden');
}

async function fetchLyrics() {
    // Placeholder for lyrics API integration
    lyricsContent.innerHTML = `
        <div class="lyrics-placeholder">
            <i class="fas fa-align-center"></i>
            <p>Lyrics feature coming soon</p>
        </div>
    `;
}

// Queue
function openQueue() {
    renderQueuePanel();
    queuePanel.classList.remove('hidden');
}

function closeQueueSheet() {
    queuePanel.classList.add('hidden');
}

function renderQueue() {
    const container = document.getElementById('queueList');
    if (queue.length === 0) {
        container.innerHTML = '<div class="empty-state">Queue is empty</div>';
        return;
    }
    
    container.innerHTML = queue.map((song, index) => createQueueItemHTML(song, index)).join('');
}

function renderQueuePanel() {
    if (queue.length === 0) {
        queuePanelList.innerHTML = '<div class="empty-state">Queue is empty</div>';
        return;
    }
    
    queuePanelList.innerHTML = queue.map((song, index) => createQueueItemHTML(song, index)).join('');
    
    // Add click handlers
    queuePanelList.querySelectorAll('.queue-item').forEach((item, index) => {
        item.addEventListener('click', () => playFromQueue(index));
        
        const removeBtn = item.querySelector('.remove-from-queue');
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeFromQueue(index);
            });
        }
    });
}

function createQueueItemHTML(song, index) {
    const isCurrent = index === currentQueueIndex;
    return `
        <div class="song-item queue-item ${isCurrent ? 'playing' : ''}" data-index="${index}">
            <div class="song-thumbnail">
                <img src="${song.thumbnail}" alt="${song.title}">
                ${isCurrent ? '<div class="playing-indicator"><i class="fas fa-volume-up"></i></div>' : ''}
            </div>
            <div class="song-info">
                <div class="song-title">${song.title}</div>
                <div class="song-artist">${song.artist}</div>
            </div>
            <button class="btn-icon small remove-from-queue">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
}

function addToQueue(song) {
    if (!queue.find(item => item.id === song.id)) {
        queue.push(song);
        saveQueue();
        renderQueue();
        showToast('Added to queue');
    }
}

function removeFromQueue(index) {
    queue.splice(index, 1);
    if (currentQueueIndex >= index) {
        currentQueueIndex--;
    }
    saveQueue();
    renderQueue();
    renderQueuePanel();
}

function playFromQueue(index) {
    if (queue[index]) {
        currentQueueIndex = index;
        playVideo(queue[index].id, queue[index]);
    }
}

function clearQueue() {
    queue = [];
    currentQueueIndex = -1;
    saveQueue();
    renderQueue();
    showToast('Queue cleared');
}

function shuffleQueue() {
    for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    saveQueue();
    renderQueue();
    showToast('Queue shuffled');
}

function saveQueue() {
    localStorage.setItem('pmusic_queue', JSON.stringify(queue));
    localStorage.setItem('pmusic_queueIndex', currentQueueIndex);
}

// Liked Songs
function isSongLiked(id) {
    return likedSongs.some(song => song.id === id);
}

function toggleLike(id, btnElement) {
    const index = likedSongs.findIndex(song => song.id === id);
    
    if (index > -1) {
        likedSongs.splice(index, 1);
        showToast('Removed from liked songs');
    } else {
        const song = findSongById(id) || { id, title: 'Unknown', artist: 'Unknown' };
        likedSongs.push(song);
        showToast('Added to liked songs');
    }
    
    saveLikedSongs();
    renderLikedSongs();
    updateLikeButtons();
}

function toggleLikeCurrent() {
    if (!currentVideoId) return;
    toggleLike(currentVideoId);
}

function findSongById(id) {
    return queue.find(s => s.id === id) ||
           likedSongs.find(s => s.id === id) ||
           history.find(s => s.id === id) ||
           downloads.find(s => s.id === id) ||
           recentlyPlayed.find(s => s.id === id);
}

function saveLikedSongs() {
    localStorage.setItem('pmusic_likedSongs', JSON.stringify(likedSongs));
}

function renderLikedSongs() {
    const container = document.getElementById('likedSongsList');
    const countEl = document.getElementById('likedCount');
    
    countEl.textContent = `${likedSongs.length} song${likedSongs.length !== 1 ? 's' : ''}`;
    
    if (likedSongs.length === 0) {
        container.innerHTML = '<div class="empty-state">No liked songs yet</div>';
        return;
    }
    
    container.innerHTML = likedSongs.map(song => createSongItemHTML(song, 'liked')).join('');
    
    // Add click handlers
    container.querySelectorAll('.song-item').forEach(item => {
        const id = item.dataset.id;
        const song = likedSongs.find(s => s.id === id);
        item.addEventListener('click', () => playVideo(id, song));
    });
}

function updateLikeButtons() {
    document.querySelectorAll('.like-btn').forEach(btn => {
        const id = btn.dataset.id;
        const isLiked = isSongLiked(id);
        btn.classList.toggle('liked', isLiked);
        btn.innerHTML = `<i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>`;
    });
}

function playLikedSongs() {
    if (likedSongs.length === 0) {
        showToast('No liked songs to play');
        return;
    }
    queue = [...likedSongs];
    saveQueue();
    playFromQueue(0);
    showToast('Playing liked songs');
}

// History
function addToHistory(song) {
    if (!song || !song.id) return;
    
    const existingIndex = history.findIndex(h => h.id === song.id);
    if (existingIndex > -1) {
        history.splice(existingIndex, 1);
    }
    
    history.unshift(song);
    if (history.length > 100) {
        history = history.slice(0, 100);
    }
    
    saveHistory();
}

function saveHistory() {
    localStorage.setItem('pmusic_history', JSON.stringify(history));
}

function renderHistory() {
    const container = document.getElementById('historyList');
    
    if (history.length === 0) {
        container.innerHTML = '<div class="empty-state">No history yet</div>';
        return;
    }
    
    container.innerHTML = history.map(song => createSongItemHTML(song, 'history')).join('');
    
    container.querySelectorAll('.song-item').forEach(item => {
        const id = item.dataset.id;
        const song = history.find(s => s.id === id);
        item.addEventListener('click', () => playVideo(id, song));
    });
}

// Recently Played
function addToRecentlyPlayed(song) {
    if (!song || !song.id) return;
    
    const existingIndex = recentlyPlayed.findIndex(r => r.id === song.id);
    if (existingIndex > -1) {
        recentlyPlayed.splice(existingIndex, 1);
    }
    
    recentlyPlayed.unshift(song);
    if (recentlyPlayed.length > 20) {
        recentlyPlayed = recentlyPlayed.slice(0, 20);
    }
    
    localStorage.setItem('pmusic_recentlyPlayed', JSON.stringify(recentlyPlayed));
    renderRecentlyPlayed();
}

function renderRecentlyPlayed() {
    const container = document.getElementById('recentlyPlayed');
    
    if (recentlyPlayed.length === 0) {
        container.innerHTML = '<div class="empty-state">No recently played</div>';
        return;
    }
    
    container.innerHTML = recentlyPlayed.slice(0, 6).map(song => `
        <div class="card" data-id="${song.id}">
            <div class="card-thumbnail">
                <img src="${song.thumbnail}" alt="${song.title}">
            </div>
            <div class="card-info">
                <div class="card-title">${song.title}</div>
                <div class="card-artist">${song.artist}</div>
            </div>
        </div>
    `).join('');
    
    container.querySelectorAll('.card').forEach(card => {
        const id = card.dataset.id;
        const song = recentlyPlayed.find(s => s.id === id);
        card.addEventListener('click', () => playVideo(id, song));
    });
}

// Playlists
function createPlaylist() {
    const name = document.getElementById('playlistNameInput').value.trim();
    if (!name) {
        showToast('Please enter a playlist name');
        return;
    }
    
    const id = 'playlist_' + Date.now();
    const playlist = { id, name, songs: [] };
    playlists.push(playlist);
    
    savePlaylists();
    renderPlaylists();
    closeCreatePlaylist();
    
    document.getElementById('playlistNameInput').value = '';
    showToast(`Playlist "${name}" created`);
}

function savePlaylists() {
    localStorage.setItem('pmusic_playlists', JSON.stringify(playlists));
}

function renderPlaylists() {
    const container = document.getElementById('playlistsList');
    const gridContainer = document.getElementById('playlistsGrid');
    
    const html = playlists.map(playlist => `
        <div class="playlist-card" data-id="${playlist.id}">
            <div class="playlist-card-cover">
                <i class="fas fa-music"></i>
            </div>
            <div class="playlist-card-title">${playlist.name}</div>
            <div class="playlist-card-count">${playlist.songs.length} songs</div>
        </div>
    `).join('');
    
    container.innerHTML = html || '<div class="empty-state">No playlists yet</div>';
    gridContainer.innerHTML = html || '';
}

function openCreatePlaylist() {
    document.getElementById('createPlaylistModal').classList.remove('hidden');
}

function closeCreatePlaylist() {
    document.getElementById('createPlaylistModal').classList.add('hidden');
}

// Downloads
function downloadCurrentSong() {
    if (!currentSongInfo) {
        showToast('No song playing');
        return;
    }
    
    downloadSong(currentSongInfo);
}

function downloadSong(song) {
    if (downloads.find(d => d.id === song.id)) {
        showToast('Song already downloaded');
        return;
    }
    
    // Store song info for offline playback
    song.downloadedAt = Date.now();
    downloads.push(song);
    saveDownloads();
    renderDownloads();
    showToast('Song downloaded for offline');
}

function saveDownloads() {
    localStorage.setItem('pmusic_downloads', JSON.stringify(downloads));
    updateOfflineCount();
}

function renderDownloads() {
    const container = document.getElementById('downloadsList');
    
    if (downloads.length === 0) {
        container.innerHTML = '<div class="empty-state">No offline songs</div>';
        return;
    }
    
    container.innerHTML = downloads.map(song => createSongItemHTML(song, 'downloads')).join('');
    
    container.querySelectorAll('.song-item').forEach(item => {
        const id = item.dataset.id;
        const song = downloads.find(s => s.id === id);
        item.addEventListener('click', () => playVideo(id, song));
    });
}

function clearOfflineSongs() {
    downloads = [];
    saveDownloads();
    renderDownloads();
    closeSettings();
    showToast('Offline songs cleared');
}

function updateOfflineCount() {
    const countEl = document.getElementById('offlineCount');
    if (countEl) {
        countEl.textContent = `${downloads.length} songs`;
    }
}

// Sleep Timer
function openSleepTimer() {
    sleepTimerModal.classList.remove('hidden');
    updateActiveTimerDisplay();
}

function closeSleepTimer() {
    sleepTimerModal.classList.add('hidden');
}

function setSleepTimer(minutes) {
    sleepTimerEndTime = Date.now() + (minutes * 60 * 1000);
    
    if (sleepTimer) {
        clearInterval(sleepTimer);
    }
    
    sleepTimer = setInterval(() => {
        const remaining = sleepTimerEndTime - Date.now();
        
        if (remaining <= 0) {
            stopPlayback();
            cancelSleepTimer();
            showToast('Sleep timer ended');
        } else {
            updateTimerCountdown(remaining);
        }
    }, 1000);
    
    updateActiveTimerDisplay();
    closeSleepTimer();
    showToast(`Sleep timer set for ${minutes} minutes`);
}

function cancelSleepTimer() {
    if (sleepTimer) {
        clearInterval(sleepTimer);
        sleepTimer = null;
    }
    sleepTimerEndTime = null;
    updateActiveTimerDisplay();
}

function stopPlayback() {
    if (player) {
        player.pauseVideo();
    }
}

function updateTimerCountdown(remaining) {
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    const countdownEl = document.getElementById('timerCountdown');
    if (countdownEl) {
        countdownEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

function updateActiveTimerDisplay() {
    const display = document.getElementById('activeTimerDisplay');
    if (sleepTimerEndTime) {
        display.classList.remove('hidden');
    } else {
        display.classList.add('hidden');
    }
}

// Audio Effects
function applyAudioEffects() {
    if (!player) return;
    
    // Note: YouTube IFrame API doesn't support native tempo/pitch changes
    // These would need server-side processing or Web Audio API implementation
    // For now, we store the settings for future implementation
}

function saveSettings() {
    localStorage.setItem('pmusic_audioEffects', JSON.stringify(audioEffects));
}

function loadSettings() {
    const saved = localStorage.getItem('pmusic_audioEffects');
    if (saved) {
        audioEffects = JSON.parse(saved);
        
        // Apply to UI
        document.getElementById('skipSilenceToggle').checked = audioEffects.skipSilence;
        document.getElementById('audioNormalizeToggle').checked = audioEffects.normalize;
        document.getElementById('tempoSlider').value = audioEffects.tempo;
        document.getElementById('tempoValue').textContent = audioEffects.tempo.toFixed(1) + 'x';
        document.getElementById('pitchSlider').value = audioEffects.pitch;
        document.getElementById('pitchValue').textContent = audioEffects.pitch;
    }
}

// Settings Modal
function openSettings() {
    loadSettings();
    settingsModal.classList.remove('hidden');
}

function closeSettings() {
    settingsModal.classList.add('hidden');
}

// Theme
function setupTheme() {
    const savedTheme = localStorage.getItem('pmusic_theme') || 'dark';
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('darkThemeToggle').checked = theme !== 'light';
    document.getElementById('pureBlackToggle').checked = theme === 'black';
}

function toggleTheme(e) {
    const theme = e.target.checked ? 'dark' : 'light';
    applyTheme(theme);
    localStorage.setItem('pmusic_theme', theme);
}

function togglePureBlack(e) {
    const theme = e.target.checked ? 'black' : 'dark';
    applyTheme(theme);
    localStorage.setItem('pmusic_theme', theme);
}

// Song Options
let currentOptionsSong = null;

function openSongOptions(song, element) {
    currentOptionsSong = song;
    document.getElementById('songOptionsTitle').textContent = song.title;
    songOptionsMenu.classList.remove('hidden');
}

function closeSongOptions() {
    songOptionsMenu.classList.add('hidden');
    currentOptionsSong = null;
}

function playNextFromOptions() {
    if (currentOptionsSong) {
        queue.splice(currentQueueIndex + 1, 0, currentOptionsSong);
        saveQueue();
        showToast('Will play next');
    }
}

function addToQueueFromOptions() {
    if (currentOptionsSong) {
        addToQueue(currentOptionsSong);
    }
}

function openAddToPlaylist() {
    renderAddToPlaylistList();
    addToPlaylistMenu.classList.remove('hidden');
}

function renderAddToPlaylistList() {
    const container = document.getElementById('addToPlaylistList');
    
    if (playlists.length === 0) {
        container.innerHTML = '<div class="empty-state">No playlists</div>';
        return;
    }
    
    container.innerHTML = playlists.map(playlist => `
        <div class="playlist-select-item" data-id="${playlist.id}">
            <div class="playlist-select-cover">
                <i class="fas fa-music"></i>
            </div>
            <div class="playlist-select-info">
                <div class="playlist-select-title">${playlist.name}</div>
                <div class="playlist-select-count">${playlist.songs.length} songs</div>
            </div>
        </div>
    `).join('');
    
    container.querySelectorAll('.playlist-select-item').forEach(item => {
        item.addEventListener('click', () => {
            const playlistId = item.dataset.id;
            addToPlaylist(playlistId, currentOptionsSong);
            addToPlaylistMenu.classList.add('hidden');
        });
    });
}

function addToPlaylist(playlistId, song) {
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist && song) {
        if (!playlist.songs.find(s => s.id === song.id)) {
            playlist.songs.push(song);
            savePlaylists();
            renderPlaylists();
            showToast(`Added to "${playlist.name}"`);
        } else {
            showToast('Song already in playlist');
        }
    }
}

function downloadFromOptions() {
    if (currentOptionsSong) {
        downloadSong(currentOptionsSong);
    }
}

function goToArtistFromOptions() {
    if (currentOptionsSong) {
        searchInput.value = currentOptionsSong.artist;
        performSearch(currentOptionsSong.artist);
        showView('search');
    }
}

function removeFromOptions() {
    // Context-specific removal
    closeSongOptions();
}

// Trending/Quick Picks
async function loadTrendingSongs() {
    try {
        const container = document.getElementById('quickPicks');
        container.innerHTML = '<div class="loading">Loading...</div>';
        
        const response = await fetch('/api/trending');
        const data = await response.json();
        
        if (data.videos && data.videos.length > 0) {
            displayQuickPicks(data.videos);
            displayTrending(data.videos);
        }
    } catch (error) {
        console.error('Failed to load trending:', error);
    }
}

function displayQuickPicks(videos) {
    const container = document.getElementById('quickPicks');
    container.innerHTML = videos.slice(0, 10).map(video => `
        <button class="chip" data-id="${video.id}">${video.title}</button>
    `).join('');
    
    container.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const id = chip.dataset.id;
            const video = videos.find(v => v.id === id);
            if (video) playVideo(id, video);
        });
    });
}

function displayTrending(videos) {
    const container = document.getElementById('trendingSongs');
    container.innerHTML = videos.map(video => `
        <div class="card" data-id="${video.id}">
            <div class="card-thumbnail">
                <img src="${video.thumbnail}" alt="${video.title}">
                <span class="card-duration">${video.duration || ''}</span>
            </div>
            <div class="card-info">
                <div class="card-title">${video.title}</div>
                <div class="card-artist">${video.artist}</div>
            </div>
        </div>
    `).join('');
    
    container.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            const video = videos.find(v => v.id === id);
            if (video) {
                playVideo(id, video);
                playingFrom.textContent = 'Trending';
            }
        });
    });
}

// Library Tabs
function switchLibraryTab(tab) {
    document.querySelectorAll('.library-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tab + 'Tab').classList.add('active');
}

// Progress Update
let progressInterval = null;

function startProgressUpdate() {
    if (progressInterval) clearInterval(progressInterval);
    progressInterval = setInterval(() => {
        if (player && isPlaying) {
            const current = player.getCurrentTime();
            const duration = player.getDuration();
            
            if (duration > 0) {
                const percent = (current / duration) * 100;
                miniProgressFill.style.width = percent + '%';
                fullProgressFill.style.width = percent + '%';
                fullCurrentTime.textContent = formatTime(current);
                fullTotalTime.textContent = formatTime(duration);
            }
        }
    }, 1000);
}

function handleProgressClick(e) {
    if (!player) return;
    
    const rect = fullProgressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const duration = player.getDuration();
    
    player.seekTo(duration * percent, true);
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Storage
function loadAllFromStorage() {
    queue = JSON.parse(localStorage.getItem('pmusic_queue') || '[]');
    currentQueueIndex = parseInt(localStorage.getItem('pmusic_queueIndex') || '-1');
    likedSongs = JSON.parse(localStorage.getItem('pmusic_likedSongs') || '[]');
    history = JSON.parse(localStorage.getItem('pmusic_history') || '[]');
    playlists = JSON.parse(localStorage.getItem('pmusic_playlists') || '[]');
    recentlyPlayed = JSON.parse(localStorage.getItem('pmusic_recentlyPlayed') || '[]');
    downloads = JSON.parse(localStorage.getItem('pmusic_downloads') || '[]');
    loadSettings();
}

// Utilities
function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12) greeting = 'Good afternoon';
    if (hour >= 18) greeting = 'Good evening';
    document.getElementById('greetingText').textContent = greeting;
}

function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function highlightPlayingInLists() {
    document.querySelectorAll('.song-item').forEach(item => {
        item.classList.remove('playing');
        if (item.dataset.id === currentVideoId) {
            item.classList.add('playing');
        }
    });
}

function filterSearchResults(filter) {
    document.querySelectorAll('.search-categories .chip').forEach(chip => {
        chip.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    // Re-run search with filter
    const query = searchInput.value.trim();
    if (query) {
        performSearch(query);
    }
}

function preloadYouTubeAPI() {
    if (!window.YT && !document.getElementById('youtube-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
    }
}
