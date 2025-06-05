// Video configuration
const videolink = "https://archive.org/download/YAnimeIn.002/01.mp4";
const videocover =
  "https://archive.org/download/video.linkxz.images.aot-ova/03.png";
const videotitle = "Jujutsu Kaisen Season 01 Episode 001";

// DOM elements
const video = document.getElementById("video");
const videoSource = document.getElementById("videoSource");
const videoTitle = document.getElementById("videoTitle");
const overlay = document.getElementById("overlay");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");
const playBtn = document.getElementById("playBtn");
const playPauseBtn = document.getElementById("playPauseBtn");
const muteBtn = document.getElementById("muteBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const speedBtn = document.getElementById("speedBtn");
const pipBtn = document.getElementById("pipBtn");
const progressBar = document.getElementById("progressBar");
const progress = document.getElementById("progress");
const bufferProgress = document.getElementById("bufferProgress");
const progressHandle = document.getElementById("progressHandle");
const volumeSlider = document.getElementById("volumeSlider");
const volumeProgress = document.getElementById("volumeProgress");
const timeDisplay = document.getElementById("timeDisplay");

// State variables
let isPlaying = false;
let isDragging = false;
let currentVolume = 1;
let lastVolume = 1;

// Initialize player
async function initPlayer() {
  try {
    loading.style.display = "block";
    errorMessage.style.display = "none";

    // Set title immediately
    videoTitle.textContent = videotitle;

    // Set video source and poster directly (no redirect resolution to avoid CORS)
    videoSource.src = videolink;
    video.poster = videocover;

    // Load video
    video.load();

    // Initialize volume
    updateVolume(1);
  } catch (error) {
    console.error("Error initializing player:", error);
    showError("Failed to initialize video player");
  }
}

// Show error message
function showError(message) {
  loading.style.display = "none";
  errorMessage.style.display = "block";
  errorMessage.innerHTML = `<strong>Error</strong><br>${message}`;
}

// Format time with better formatting
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

// Update progress and buffer
function updateProgress() {
  if (isDragging) return;

  const progressPercent = (video.currentTime / video.duration) * 100;
  progress.style.width = `${progressPercent}%`;
  progressHandle.style.left = `${progressPercent}%`;

  // Update buffer progress
  if (video.buffered.length > 0) {
    const bufferedEnd = video.buffered.end(video.buffered.length - 1);
    const bufferedPercent = (bufferedEnd / video.duration) * 100;
    bufferProgress.style.width = `${bufferedPercent}%`;
  }

  timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(
    video.duration
  )}`;
}

// Play/Pause functionality
function togglePlay() {
  if (video.paused || video.ended) {
    video
      .play()
      .then(() => {
        isPlaying = true;
        playBtn.textContent = "⏸";
        playPauseBtn.textContent = "⏸";
        overlay.classList.remove("show");
      })
      .catch((error) => {
        console.error("Error playing video:", error);
        showError("Unable to play video");
      });
  } else {
    video.pause();
    isPlaying = false;
    playBtn.textContent = "▶";
    playPauseBtn.textContent = "▶";
    overlay.classList.add("show");
  }
}

// Volume control with better UX
function updateVolume(value) {
  currentVolume = Math.max(0, Math.min(1, value));
  video.volume = currentVolume;
  volumeProgress.style.width = `${currentVolume * 100}%`;

  if (currentVolume === 0) {
    muteBtn.textContent = "🔇";
  } else if (currentVolume < 0.3) {
    muteBtn.textContent = "🔉";
  } else if (currentVolume < 0.7) {
    muteBtn.textContent = "🔊";
  } else {
    muteBtn.textContent = "🔊";
  }
}

// Mute toggle with memory
function toggleMute() {
  if (currentVolume === 0) {
    updateVolume(lastVolume);
  } else {
    lastVolume = currentVolume;
    updateVolume(0);
  }
}

// Speed control with more options
const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
let currentSpeedIndex = 3; // Default to 1x

function changeSpeed() {
  currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
  video.playbackRate = speeds[currentSpeedIndex];
  speedBtn.textContent = `${speeds[currentSpeedIndex]}x`;
}

// Picture-in-Picture
async function togglePiP() {
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await video.requestPictureInPicture();
    }
  } catch (error) {
    console.error("PiP not supported or failed:", error);
  }
}

// Fullscreen with better handling
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    video.parentElement.requestFullscreen().catch((err) => {
      console.error("Fullscreen failed:", err);
    });
  } else {
    document.exitFullscreen();
  }
}

// Progress bar interaction with better UX
function handleProgressBarInteraction(e) {
  const rect = progressBar.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickPercent = Math.max(0, Math.min(1, clickX / rect.width));
  const newTime = clickPercent * video.duration;

  if (!isNaN(newTime)) {
    video.currentTime = newTime;
    updateProgress();
  }
}

// Volume slider interaction
function handleVolumeSliderInteraction(e) {
  const rect = volumeSlider.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickPercent = Math.max(0, Math.min(1, clickX / rect.width));
  updateVolume(clickPercent);
}

// Event listeners
overlay.addEventListener("click", togglePlay);
playPauseBtn.addEventListener("click", togglePlay);
muteBtn.addEventListener("click", toggleMute);
speedBtn.addEventListener("click", changeSpeed);
pipBtn.addEventListener("click", togglePiP);
fullscreenBtn.addEventListener("click", toggleFullscreen);

// Progress bar events
progressBar.addEventListener("click", handleProgressBarInteraction);
progressBar.addEventListener("mousedown", (e) => {
  isDragging = true;
  handleProgressBarInteraction(e);
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    handleProgressBarInteraction(e);
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

// Volume slider events
volumeSlider.addEventListener("click", handleVolumeSliderInteraction);

// Video events
video.addEventListener("loadstart", () => {
  loading.style.display = "block";
  errorMessage.style.display = "none";
});

video.addEventListener("canplay", () => {
  loading.style.display = "none";
});

video.addEventListener("error", (e) => {
  console.error("Video error:", e);
  showError("Video failed to load. Please try again.");
});

video.addEventListener("timeupdate", updateProgress);
video.addEventListener("progress", updateProgress);

video.addEventListener("ended", () => {
  isPlaying = false;
  playBtn.textContent = "▶";
  playPauseBtn.textContent = "▶";
  overlay.classList.add("show");
});

video.addEventListener("play", () => {
  isPlaying = true;
  overlay.classList.remove("show");
});

video.addEventListener("pause", () => {
  isPlaying = false;
  overlay.classList.add("show");
});

// Fullscreen events
document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement) {
    fullscreenBtn.textContent = "⛷";
  } else {
    fullscreenBtn.textContent = "⛶";
  }
});

// Enhanced keyboard controls
document.addEventListener("keydown", (e) => {
  // Prevent default only for our handled keys
  const handledKeys = [
    "Space",
    "KeyK",
    "KeyM",
    "KeyF",
    "KeyP",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
  ];
  if (handledKeys.includes(e.code)) {
    e.preventDefault();
  }

  switch (e.code) {
    case "Space":
    case "KeyK":
      togglePlay();
      break;
    case "KeyM":
      toggleMute();
      break;
    case "KeyF":
      toggleFullscreen();
      break;
    case "KeyP":
      togglePiP();
      break;
    case "ArrowLeft":
      video.currentTime = Math.max(
        0,
        video.currentTime - (e.shiftKey ? 5 : 10)
      );
      break;
    case "ArrowRight":
      video.currentTime = Math.min(
        video.duration,
        video.currentTime + (e.shiftKey ? 5 : 10)
      );
      break;
    case "ArrowUp":
      updateVolume(currentVolume + 0.1);
      break;
    case "ArrowDown":
      updateVolume(currentVolume - 0.1);
      break;
    case "Digit1":
    case "Digit2":
    case "Digit3":
    case "Digit4":
    case "Digit5":
    case "Digit6":
    case "Digit7":
    case "Digit8":
    case "Digit9":
      const percent = parseInt(e.code.slice(-1)) / 10;
      video.currentTime = video.duration * percent;
      break;
    case "Digit0":
      video.currentTime = 0;
      break;
  }
});

// Touch support for mobile
let touchStartX = 0;
let touchStartY = 0;
let isTouching = false;

video.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  isTouching = true;
});

video.addEventListener("touchmove", (e) => {
  if (!isTouching) return;

  const touchX = e.touches[0].clientX;
  const touchY = e.touches[0].clientY;
  const deltaX = touchX - touchStartX;
  const deltaY = touchY - touchStartY;

  // Horizontal swipe for seeking
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
    const seekAmount = deltaX > 0 ? 10 : -10;
    video.currentTime = Math.max(
      0,
      Math.min(video.duration, video.currentTime + seekAmount)
    );
    touchStartX = touchX;
  }

  // Vertical swipe for volume (right side) or brightness (left side)
  if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
    if (touchStartX > window.innerWidth / 2) {
      // Right side - volume control
      const volumeChange = -deltaY / 200;
      updateVolume(currentVolume + volumeChange);
    }
    touchStartY = touchY;
  }
});

video.addEventListener("touchend", () => {
  isTouching = false;
});

// Double tap to toggle fullscreen on mobile
let lastTapTime = 0;
video.addEventListener("touchend", (e) => {
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTapTime;

  if (tapLength < 300 && tapLength > 0) {
    // Double tap detected
    toggleFullscreen();
    e.preventDefault();
  }
  lastTapTime = currentTime;
});

// Auto-hide controls after inactivity
let controlsTimeout;
let isControlsVisible = false;

function showControls() {
  if (!isControlsVisible) {
    document.querySelector(".controls").style.transform = "translateY(0)";
    isControlsVisible = true;
  }

  clearTimeout(controlsTimeout);
  controlsTimeout = setTimeout(() => {
    if (isPlaying && !document.querySelector(".video-wrapper:hover")) {
      document.querySelector(".controls").style.transform = "translateY(100%)";
      isControlsVisible = false;
    }
  }, 3000);
}

// Show controls on mouse movement
document.addEventListener("mousemove", showControls);
document.addEventListener("touchstart", showControls);

// Prevent context menu on video
video.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

// Handle window resize
window.addEventListener("resize", () => {
  // Adjust player size if needed
  if (document.fullscreenElement) {
    // Handle fullscreen resize
    video.style.height = "100vh";
  } else {
    video.style.height = "auto";
  }
});

// Save and restore volume preference
function saveVolumePreference() {
  // In a real implementation, you would use localStorage
  // For now, we'll just keep it in memory
  console.log(`Volume preference saved: ${currentVolume}`);
}

function loadVolumePreference() {
  // In a real implementation, you would load from localStorage
  // For now, we'll just use default volume
  updateVolume(1);
}

// Media session API for browser media controls
if ("mediaSession" in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: videotitle,
    artist: "Video Player",
    artwork: [{ src: videocover, sizes: "512x512", type: "image/png" }],
  });

  navigator.mediaSession.setActionHandler("play", () => {
    if (video.paused) togglePlay();
  });

  navigator.mediaSession.setActionHandler("pause", () => {
    if (!video.paused) togglePlay();
  });

  navigator.mediaSession.setActionHandler("seekbackward", () => {
    video.currentTime = Math.max(0, video.currentTime - 10);
  });

  navigator.mediaSession.setActionHandler("seekforward", () => {
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
  });
}

// Performance optimization: Throttle progress updates
let progressUpdateTimeout;
function throttledUpdateProgress() {
  if (progressUpdateTimeout) return;

  progressUpdateTimeout = setTimeout(() => {
    updateProgress();
    progressUpdateTimeout = null;
  }, 100);
}

// Replace the regular timeupdate listener
video.removeEventListener("timeupdate", updateProgress);
video.addEventListener("timeupdate", throttledUpdateProgress);

// Add loading states for better UX
video.addEventListener("waiting", () => {
  loading.style.display = "block";
});

video.addEventListener("playing", () => {
  loading.style.display = "none";
});

// Network state monitoring
video.addEventListener("stalled", () => {
  console.warn("Video playback stalled");
});

video.addEventListener("suspend", () => {
  console.log("Video loading suspended");
});

// Add retry mechanism for failed loads
let retryCount = 0;
const maxRetries = 3;

function retryVideoLoad() {
  if (retryCount < maxRetries) {
    retryCount++;
    console.log(`Retrying video load (attempt ${retryCount}/${maxRetries})`);
    setTimeout(() => {
      video.load();
    }, 1000 * retryCount);
  } else {
    showError("Failed to load video after multiple attempts");
  }
}

video.addEventListener("error", retryVideoLoad);

// Initialize player when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initPlayer();
  loadVolumePreference();
});

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  saveVolumePreference();
  video.pause();
});

// Initialize immediately if DOM is already loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPlayer);
} else {
  initPlayer();
}
