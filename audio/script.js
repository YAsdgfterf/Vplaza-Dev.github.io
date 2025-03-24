let videoPlaying = false;
let currentVideoIndex = 0;
let videoData = [];
let loop = false;
let loopOne = false;
let player;
let playerReady = false;
let videoDuration = 0;

const API_KEY = 'AIzaSyBQAZ7-zXoAFYBBDp9Amddor0WAooSjUaM'; // Replace this with your YouTube API key

// This function is called when the YouTube IFrame API is loaded and ready to use
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '315',
    width: '560',
    videoId: '', // Initial video ID is empty
    playerVars: {
      'controls': 0, // Hide controls
      'autoplay': 1, // Autoplay the video
      'rel': 0, // Prevent related videos from showing at the end
      'showinfo': 0, // Prevent video title from showing
      'modestbranding': 1 // Reduce YouTube branding
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onError': onPlayerError // Listen for the onError event to handle restricted videos
    }
  });
}

// This function runs once the YouTube player is ready
function onPlayerReady(event) {
  playerReady = true;
  videoDuration = player.getDuration(); // Set the video duration
  updateDuration();
  setInterval(updateSlider, 1000); // Update slider position every second
}

// This function runs whenever the player state changes
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED && loopOne) {
    player.playVideo();
  }
}

// This function runs if there is an error (e.g., restricted video)
function onPlayerError(event) {
  console.log("Video error occurred: ", event.data);
  // If the video is restricted, we skip to the next video in the list
  if (event.data === 100 || event.data === 101 || event.data === 150) {
    // Error codes for restricted videos
    currentVideoIndex++;  // Increment index to skip to next video
    if (currentVideoIndex < videoData.length) {
      playVideo(videoData[currentVideoIndex].id.videoId);
    } else {
      console.log("No more videos available");
    }
  }
}

// Function to search YouTube for videos based on the input query
function searchSong() {
  const query = document.getElementById("searchInput").value;
  if (!query) return;

  // Perform search using YouTube Data API with safeSearch filter
  fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
      videoData = data.items;
      filterRestrictedVideos(videoData);
      displayResults(videoData);
    })
    .catch(error => console.error("Error fetching data:", error));
}

// Function to filter out age-restricted or region-restricted videos
function filterRestrictedVideos(videos) {
  // Filter out restricted videos (both region-restricted and age-restricted)
  videoData = videos.filter(video => {
    if (video.contentDetails && video.contentDetails.regionRestriction) {
      return false; // Exclude videos with region restrictions
    }
    if (video.contentDetails && video.contentDetails.contentRating) {
      // You can filter based on age-restricted content
      const contentRating = video.contentDetails.contentRating;
      if (contentRating && contentRating.ytRating === 'restricted') {
        return false; // Exclude age-restricted content
      }
    }
    return true; // Keep video if no restrictions
  });
}

// Display search results as clickable items without showing channels
function displayResults(videos) {
  const resultsContainer = document.getElementById("resultsContainer");
  resultsContainer.innerHTML = '';

  if (videos.length === 0) {
    resultsContainer.innerHTML = "<p>No results found or all results are restricted.</p>";
    return;
  }

  videos.forEach((video, index) => {
    const videoElement = document.createElement("div");
    videoElement.classList.add("result-item");
    videoElement.innerHTML = `
      <div class="result-thumbnail-container">
        <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}">
        <div class="play-icon">&#9654;</div>
      </div>
      <div class="result-info">
        <p><strong>${video.snippet.title}</strong></p>
      </div>
    `;
    // Make the thumbnail clickable to play the video
    videoElement.onclick = () => playVideo(video.id.videoId);
    resultsContainer.appendChild(videoElement);
  });
}

// Play the video using YouTube iframe
function playVideo(videoId) {
  const videoContainer = document.getElementById("videoContainer");
  videoContainer.style.display = 'block';

  if (playerReady) {
    // Load the new video by ID and apply settings for autoplay and controls hidden
    player.loadVideoById({
      videoId: videoId,
      startSeconds: 0,
      playerVars: {
        'controls': 0,
        'autoplay': 1,
        'rel': 0,
        'showinfo': 0,
        'modestbranding': 1
      }
    });
    videoPlaying = true;
  } else {
    player = new YT.Player('player', {
      height: '315',
      width: '560',
      videoId: videoId,
      playerVars: {
        'controls': 0,
        'autoplay': 1,
        'rel': 0,
        'showinfo': 0,
        'modestbranding': 1
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange,
        'onError': onPlayerError
      }
    });
  }
}

// Update the slider position based on current time
function updateSlider() {
  const currentTime = player.getCurrentTime();
  const slider = document.getElementById("progressSlider");
  const currentTimeLabel = document.getElementById("currentTime");

  // Update slider position
  slider.value = (currentTime / videoDuration) * 100;

  // Format current time and update it
  currentTimeLabel.textContent = formatTime(currentTime);
}

// Update the video position when the slider is changed
function seekVideo() {
  const slider = document.getElementById("progressSlider");
  const newTime = (slider.value / 100) * videoDuration;
  player.seekTo(newTime);
}

// Format time in MM:SS format
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}
