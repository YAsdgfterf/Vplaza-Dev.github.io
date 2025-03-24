let videoPlaying = false;
let currentVideoIndex = 0;
let videoData = [];
let loop = false;
let loopOne = false;
const invidiousUrl = 'https://inv.nakedo.net'; // Replace this with a valid Invidious instance URL.

function searchVideo() {
  const query = document.getElementById("searchInput").value;
  if (!query) return;

  // Fetch results from the Invidious API
  fetch(`${invidiousUrl}/api/v1/search?q=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
      videoData = data || [];
      displayResults(videoData);
    })
    .catch(error => console.error("Error fetching data:", error));
}

function displayResults(videos) {
  const resultsContainer = document.getElementById("resultsContainer");
  resultsContainer.innerHTML = '';

  if (videos.length === 0) {
    resultsContainer.innerHTML = "<p>No results found.</p>";
    return;
  }

  videos.forEach((video, index) => {
    const videoElement = document.createElement("div");
    videoElement.classList.add("result-item");
    videoElement.innerHTML = `
      <img src="${video.thumbnails[0].url}" alt="${video.title}">
      <p>${video.title}</p>
    `;
    videoElement.onclick = () => playVideo(index);
    resultsContainer.appendChild(videoElement);
  });
}

function playVideo(index) {
  const video = videoData[index];
  const videoFrame = document.getElementById("videoFrame");
  const videoContainer = document.getElementById("videoContainer");

  // Embed the video using the Invidious embed URL
  videoFrame.src = `${invidiousUrl}/embed/${video.videoId}?autoplay=1`;
  videoContainer.style.display = 'block';

  currentVideoIndex = index;
  videoPlaying = true;
}

function playPause() {
  const videoFrame = document.getElementById("videoFrame");
  const player = videoFrame.contentWindow;

  if (videoPlaying) {
    player.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    videoPlaying = false;
  } else {
    player.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
    videoPlaying = true;
  }
}

function skipVideo() {
  currentVideoIndex = (currentVideoIndex + 1) % videoData.length;
  playVideo(currentVideoIndex);
}

function backVideo() {
  currentVideoIndex = (currentVideoIndex - 1 + videoData.length) % videoData.length;
  playVideo(currentVideoIndex);
}

function toggleLoop() {
  loop = !loop;
  const videoFrame = document.getElementById("videoFrame");
  const player = videoFrame.contentWindow;

  if (loop) {
    player.postMessage('{"event":"command","func":"setLoop","args":["true"]}', '*');
  } else {
    player.postMessage('{"event":"command","func":"setLoop","args":["false"]}', '*');
  }
}

function toggleLoopOne() {
  loopOne = !loopOne;
  const videoFrame = document.getElementById("videoFrame");
  const player = videoFrame.contentWindow;

  if (loopOne) {
    player.postMessage('{"event":"command","func":"setLoop","args":["true"]}', '*');
  } else {
    player.postMessage('{"event":"command","func":"setLoop","args":["false"]}', '*');
  }
}
