const API_KEY = 'AIzaSyBQAZ7-zXoAFYBBDp9Amddor0WAooSjUaM';
const BASE_URL = 'https://www.googleapis.com/youtube/v3/';
let player;
let currentPlaylist = [];
let currentIndex = 0;
let isLooping = false;

document.addEventListener('DOMContentLoaded', fetchTrendingMusic);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtubePlayer', {
        height: '180',
        width: '320',
        events: {
            'onStateChange': onPlayerStateChange
        }
    });
}

async function fetchTrendingMusic() {
    const url = `${BASE_URL}videos?part=snippet&chart=mostPopular&regionCode=US&videoCategoryId=10&key=${API_KEY}&maxResults=8`;
    const response = await fetch(url);
    const data = await response.json();
    displayResults(data.items, 'trending');
}

async function searchYouTube() {
    const query = document.getElementById('searchInput').value;
    const url = `${BASE_URL}search?part=snippet&q=${query}&type=video&videoCategoryId=10&key=${API_KEY}&maxResults=10`;
    
    const response = await fetch(url);
    const data = await response.json();
    displayResults(data.items, 'results');
}

function displayResults(videos, containerId) {
    const resultsDiv = document.getElementById(containerId);
    resultsDiv.innerHTML = '';
    if (containerId === 'results') currentPlaylist = videos;
    
    videos.forEach((video, index) => {
        const videoElement = document.createElement('div');
        videoElement.classList.add('video-result');
        videoElement.innerHTML = `
            <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}">
            <p>${video.snippet.title}</p>
        `;
        videoElement.onclick = () => playVideo(index);
        resultsDiv.appendChild(videoElement);
    });
}

function playVideo(index) {
    currentIndex = index;
    const videoId = currentPlaylist[index].id.videoId || currentPlaylist[index].id;
    
    if (player && player.loadVideoById) {
        player.loadVideoById(videoId);
    } else {
        document.getElementById('youtubePlayer').src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
    }

    document.querySelector('.player-container').style.display = 'block';
}

function togglePlayPause() {
    if (player && player.getPlayerState) {
        if (player.getPlayerState() === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    }
}

function nextTrack() {
    currentIndex = (currentIndex + 1) % currentPlaylist.length;
    playVideo(currentIndex);
}

function prevTrack() {
    currentIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    playVideo(currentIndex);
}

function toggleLoop() {
    isLooping = !isLooping;
    alert(isLooping ? "Looping ON" : "Looping OFF");
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED && isLooping) {
        playVideo(currentIndex);
    }
}
