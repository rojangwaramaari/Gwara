const playlists = {
  "Golden Memories": [
    { id: "gm-01", title: "Mana Ki Rani", artist: "Kuma Sagar", film: "Single", year: 2024, duration: 240, videoId: "clQK__cONpI" },
    { id: "gm-02", title: "Hawa Ko Lahar", artist: "Kuma Sagar", film: "Single", year: 2025, duration: 240, videoId: "gebozQyu-pY" },
    { id: "gm-03", title: "Man Dulayera", artist: "ShreeGo", film: "Album", year: 2024, duration: 180, videoId: "RfGfPMFl19w" },
    { id: "gm-04", title: "Syndicate", artist: "Bipul Chettri", film: "Sketches of Darjeeling", year: 2014, duration: 260, videoId: "fJ9rUzIMcZQ" }
  ],

  "Roadside Radio": [
    { id: "rr-01", title: "Sarangi", artist: "Sushant KC", film: "Single", year: 2023, duration: 215, videoId: "3JZ_D3ELwOQ" },
    { id: "rr-02", title: "Maya", artist: "Ashutosh KC", film: "Single", year: 2022, duration: 200, videoId: "2Vv-BfVoq4g" },
    { id: "rr-03", title: "Kasaari", artist: "Swoopna Suman", film: "Single", year: 2021, duration: 230, videoId: "L_LUpnjgPso" }
  ],

  "Late Night": [
    { id: "ln-01", title: "lofi hip hop radio - beats to relax/study to", artist: "Lofi Girl", film: "Stream", year: 2024, duration: 300, videoId: "jfKfPfyJRdk" },
    { id: "ln-02", title: "Midnight City", artist: "M83", film: "Hurry Up, We're Dreaming", year: 2011, duration: 243, videoId: "DX3InT7p1oM" },
    { id: "ln-03", title: "Night Trouble", artist: "Petit Biscuit", film: "Single", year: 2015, duration: 228, videoId: "dQw4w9WgXcQ" }
  ]
};

let playlistName = Object.keys(playlists)[0];
let trackIndex = 0;
let ytPlayer = null;
let apiReady = false;
let isPlaying = false;
let currentTrack = null;
let progressTimer = null;
let initialRenderDone = false;

const $ = (selector) => document.querySelector(selector);

function formatTime(seconds) {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function updateClock() {
  const clock = document.getElementById("clock");
  if (!clock) return;

  const now = new Date();
  clock.textContent = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kathmandu",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(now);
}

function renderTabs() {
  const tabs = $("#playlist-tabs");
  if (!tabs) return;
  tabs.innerHTML = "";

  Object.keys(playlists).forEach(name => {
    const button = document.createElement("button");
    button.textContent = name;
    button.className = name === playlistName ? "active" : "";
    button.addEventListener("click", () => switchPlaylist(name));
    tabs.appendChild(button);
  });
}

function playerMarkup(track) {
  return `
    <div class="player desktop-player">
      <div class="artwork" id="artwork">
        <div id="yt-desktop"></div>
        <div class="spindle"></div>
      </div>

      <div class="info">
        <div class="title" id="track-title-desktop">${escapeHtml(track.title)}</div>
        <div class="artist" id="track-artist-desktop">${escapeHtml(track.artist)}</div>
        <div class="seek" id="seek-desktop" role="slider" aria-label="Seek">
          <div class="rail"></div>
          <div class="fill" id="fill-desktop"></div>
          <div class="knob" id="knob-desktop"></div>
        </div>
        <div class="times">
          <span id="elapsed-desktop">0:00</span>
          <span id="duration-desktop">${formatTime(track.duration)}</span>
        </div>
      </div>

      ${transportMarkup("desktop")}
    </div>

    <div class="player mobile-player">
      <div class="mobile-top">
        <div class="mobile-artwork" id="mobile-artwork">
          <div id="yt-mobile"></div>
        </div>
        <div class="info">
          <div class="title" id="track-title-mobile">${escapeHtml(track.title)}</div>
          <div class="artist" id="track-artist-mobile">${escapeHtml(track.artist)}</div>
          <div class="meta" id="track-meta-mobile">${escapeHtml(track.film)} • ${track.year}</div>
        </div>
      </div>

      <div class="seek" id="seek-mobile" role="slider" aria-label="Seek">
        <div class="rail"></div>
        <div class="fill" id="fill-mobile"></div>
        <div class="knob" id="knob-mobile"></div>
      </div>

      <div class="mobile-controls">
        <div class="mobile-times">
          <span id="elapsed-mobile">0:00</span> /
          <span id="duration-mobile">${formatTime(track.duration)}</span>
        </div>
        ${transportMarkup("mobile")}
      </div>
    </div>

    <div id="track-list" class="track-list"></div>
  `;
}

function transportMarkup(prefix) {
  return `
    <div class="transport">
      <button class="icon-btn" id="${prefix}-prev" aria-label="Previous">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 5v14M18 6l-8 6 8 6V6Z"/>
        </svg>
      </button>

      <button class="play-btn" id="${prefix}-play" aria-label="Play">
        <svg class="play-icon" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5.2v13.6c0 .8.9 1.3 1.6.9l10-6.8c.6-.4.6-1.3 0-1.7l-10-6.8C8.9 4 8 4.4 8 5.2Z"/>
        </svg>
        <svg class="pause-icon" width="17" height="17" viewBox="0 0 24 24" fill="currentColor" style="display:none">
          <path d="M7 5h3v14H7V5Zm7 0h3v14h-3V5Z"/>
        </svg>
      </button>

      <button class="icon-btn" id="${prefix}-next" aria-label="Next">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 5v14M6 6l8 6-8 6V6Z"/>
        </svg>
      </button>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadTrack(shouldPlay = false) {
  const tracks = playlists[playlistName] || [];
  currentTrack = tracks[trackIndex];
  if (!currentTrack) return;

  ["desktop", "mobile"].forEach(prefix => {
    const titleEl = $(`#track-title-${prefix}`);
    const artistEl = $(`#track-artist-${prefix}`);
    const metaEl = $(`#track-meta-${prefix}`);

    if (titleEl) titleEl.textContent = currentTrack.title;
    if (artistEl) artistEl.textContent = currentTrack.artist;
    if (metaEl) metaEl.textContent = `${currentTrack.film} • ${currentTrack.year}`;
    
    const playBtn = $(`#${prefix}-play`);
    if (playBtn) playBtn.disabled = false;
  });

  renderTrackList();
  updateProgress(0, currentTrack.duration);

  if (ytPlayer && typeof ytPlayer.loadVideoById === "function") {
    try {
      if (shouldPlay) {
        ytPlayer.loadVideoById(currentTrack.videoId);
      } else {
        ytPlayer.cueVideoById(currentTrack.videoId);
      }
    } catch (err) {
      console.warn("Player video swap error:", err);
    }
  }
}

function renderPlayer() {
  const tracks = playlists[playlistName] || [];
  currentTrack = tracks[trackIndex];

  if (!initialRenderDone) {
    $("#player").innerHTML = playerMarkup(currentTrack);

    ["desktop", "mobile"].forEach(prefix => {
      $(`#${prefix}-play`)?.addEventListener("click", togglePlayback);
      $(`#${prefix}-prev`)?.addEventListener("click", previousTrack);
      $(`#${prefix}-next`)?.addEventListener("click", nextTrack);
    });

    setupSeek("seek-desktop");
    setupSeek("seek-mobile");
    initialRenderDone = true;
  }

  loadTrack(false);

  if (apiReady && !ytPlayer) {
    createYouTubePlayer();
  }
}

function renderTrackList() {
  const container = document.getElementById("track-list");
  if (!container) return;

  const tracks = playlists[playlistName] || [];
  container.innerHTML = tracks.map((t, index) => `
    <button class="track-item ${index === trackIndex ? 'active' : ''}" onclick="selectTrack(${index})">
      <span class="track-title">${index + 1}. ${escapeHtml(t.title)}</span>
      <span class="track-artist">${escapeHtml(t.artist)}</span>
    </button>
  `).join('');
}

window.selectTrack = function(index) {
  trackIndex = index;
  loadTrack(true);
};

function setupSeek(id) {
  const seek = document.getElementById(id);
  if (!seek) return;

  seek.addEventListener("pointerdown", event => {
    if (!ytPlayer || !currentTrack) return;

    const rect = seek.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const duration = (typeof ytPlayer.getDuration === "function" && ytPlayer.getDuration()) || currentTrack.duration;

    if (typeof ytPlayer.seekTo === "function") {
      ytPlayer.seekTo(ratio * duration, true);
    }
    updateProgress(ratio * duration, duration);
  });
}

function setPlayIcon() {
  ["desktop", "mobile"].forEach(prefix => {
    const button = $(`#${prefix}-play`);
    if (!button) return;

    button.setAttribute("aria-label", isPlaying ? "Pause" : "Play");

    const play = button.querySelector(".play-icon");
    const pause = button.querySelector(".pause-icon");

    if (play) play.style.display = isPlaying ? "none" : "block";
    if (pause) pause.style.display = isPlaying ? "block" : "none";
  });

  ["artwork", "mobile-artwork"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.animationPlayState = isPlaying ? "running" : "paused";
  });
}

function updateProgress(current, duration) {
  const percent = duration ? Math.min(100, Math.max(0, current / duration * 100)) : 0;

  ["desktop", "mobile"].forEach(prefix => {
    const fill = $(`#fill-${prefix}`);
    const knob = $(`#knob-${prefix}`);
    const elapsed = $(`#elapsed-${prefix}`);
    const total = $(`#duration-${prefix}`);

    if (fill) fill.style.width = `${percent}%`;
    if (knob) knob.style.left = `${percent}%`;
    if (elapsed) elapsed.textContent = formatTime(current);
    if (total) total.textContent = formatTime(duration);
  });
}

function startProgressTimer() {
  clearInterval(progressTimer);

  progressTimer = setInterval(() => {
    if (!ytPlayer || typeof ytPlayer.getCurrentTime !== "function") return;

    try {
      const current = ytPlayer.getCurrentTime();
      const duration = ytPlayer.getDuration() || currentTrack?.duration || 0;
      updateProgress(current, duration);
    } catch {}
  }, 400);
}

function createYouTubePlayer() {
  if (!window.YT || !window.YT.Player || !currentTrack) return;

  const desktopHost = document.getElementById("yt-desktop");
  const mobileHost = document.getElementById("yt-mobile");
  const host = window.matchMedia("(max-width: 639px)").matches ? mobileHost : desktopHost;

  if (!host) return;

  ytPlayer = new YT.Player(host, {
    videoId: currentTrack.videoId,
    playerVars: {
      autoplay: 0,
      controls: 0,
      rel: 0,
      modestbranding: 1,
      playsinline: 1
    },
    events: {
      onReady: () => {
        setPlayIcon();
        startProgressTimer();
      },

      onStateChange: event => {
        if (event.data === YT.PlayerState.PLAYING) {
          isPlaying = true;
          setPlayIcon();
        } else if (event.data === YT.PlayerState.PAUSED) {
          isPlaying = false;
          setPlayIcon();
        } else if (event.data === YT.PlayerState.ENDED) {
          isPlaying = false;
          setPlayIcon();
          nextTrack();
        }
      },

      onError: () => {
        isPlaying = false;
        setPlayIcon();
        nextTrack();
      }
    }
  });
}

function togglePlayback() {
  if (!ytPlayer) return;

  if (isPlaying) {
    if (typeof ytPlayer.pauseVideo === "function") ytPlayer.pauseVideo();
  } else {
    if (typeof ytPlayer.playVideo === "function") ytPlayer.playVideo();
  }
}

function nextTrack() {
  const tracks = playlists[playlistName] || [];
  if (!tracks.length) return;

  trackIndex = (trackIndex + 1) % tracks.length;
  loadTrack(true);
}

function previousTrack() {
  const tracks = playlists[playlistName] || [];
  if (!tracks.length) return;

  trackIndex = (trackIndex - 1 + tracks.length) % tracks.length;
  loadTrack(true);
}

function switchPlaylist(name) {
  playlistName = name;
  trackIndex = 0;

  renderTabs();
  loadTrack(false);
}

window.onYouTubeIframeAPIReady = function () {
  apiReady = true;
  if (initialRenderDone) createYouTubePlayer();
};

updateClock();
setInterval(updateClock, 1000);

renderTabs();
renderPlayer();

let wasMobile = window.matchMedia("(max-width: 639px)").matches;

window.addEventListener("resize", () => {
  const mobile = window.matchMedia("(max-width: 639px)").matches;

  if (mobile !== wasMobile) {
    wasMobile = mobile;

    if (apiReady && currentTrack) {
      createYouTubePlayer();
    }
  }
});