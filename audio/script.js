let player;
let currentVideoId = '';
let isPlaying = false; // Variable to track if the video is playing

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: '',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    console.log("Player is ready");
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        // Update play/pause button if the video is playing
        isPlaying = true;
        document.getElementById('playPauseButton').textContent = 'Pause';
        setInterval(updateCurrentTime, 1000); // Update current time every second
    } else if (event.data == YT.PlayerState.PAUSED) {
        // Update play/pause button if the video is paused
        isPlaying = false;
        document.getElementById('playPauseButton').textContent = 'Play';
    }
}

function searchSong() {
    const query = document.getElementById('searchInput').value;
    const apiKey = 'AIzaSyBQAZ7-zXoAFYBBDp9Amddor0WAooSjUaM'; // Get this from Google Developer Console
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&key=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => displayResults(data.items))
        .catch(error => console.error('Error fetching data:', error));
}

function displayResults(videos) {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = ''; // Clear previous results

    videos.forEach(video => {
        const videoElement = document.createElement('div');
        videoElement.classList.add('video');
        videoElement.innerHTML = `
            <img src="${video.snippet.thumbnails.default.url}" alt="${video.snippet.title}">
            <p>${video.snippet.title}</p>
            <button onclick="playVideo('${video.id.videoId}')">Play</button>
        `;
        resultsContainer.appendChild(videoElement);
    });
}

function playVideo(videoId) {
    currentVideoId = videoId;
    player.loadVideoById(videoId);
    document.getElementById('videoContainer').style.display = 'block';
}

function togglePlayPause() {
    if (isPlaying) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
}

function updateCurrentTime() {
    const currentTime = player.getCurrentTime();
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    document.getElementById('currentTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
