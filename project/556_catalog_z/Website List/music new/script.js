const playlists = {
 const playlists = {
  "Golden Memories": [
    {
      id: "gm-01",
      title: "Mana Ki Rani",
      artist: "Kuma Sagar",
      film: "Kuma Sagar",
      year: 2024,
      duration: 240,
      videoId: "clQK__cONpI"
    },
  ],
  
  "Roadside Radio": [
    // { id: "rr-01", title: "Your licensed track", artist: "Artist", film: "Film", year: 2001, duration: 230, videoId: "YOUR_VIDEO_ID" },
  ],

  "Late Night": [
    // { id: "ln-01", title: "Your licensed track", artist: "Artist", film: "Film", year: 2002, duration: 250, videoId: "YOUR_VIDEO_ID" },
  ]
};

let playlistName = Object.keys(playlists)[0];
let trackIndex = 0;
let ytPlayer = null;
let apiReady = false;
let isPlaying = false;
let playerReady = false;
let currentTrack = null;
let progressTimer = null;

const $ = (selector) => document.querySelector(selector);

function formatTime(seconds) {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function analytics(name, payload) {
  window.dispatchEvent(new CustomEvent("nostalgia:analytics", {
    detail: { name, ...payload }
  }));
}

function updateClock() {
  const now = new Date();

  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kathmandu",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(now);

  const clock = document.getElementById("clock");

  if (clock) {
    clock.textContent = time;
  }
}

  const hour = parts.find(p => p.type === "hour")?.value || "12";
  const minute = parts.find(p => p.type === "minute")?.value || "00";
  const period = parts.find(p => p.type === "dayPeriod")?.value || "AM";

  $("#clock").innerHTML = `${hour}<span class="colon">:</span>${minute} ${period}`;
}

function renderTabs() {
  const tabs = $("#playlist-tabs");
  tabs.innerHTML = "";

  Object.keys(playlists).forEach(name => {
    const button = document.createElement("button");
    button.textContent = name;
    button.className = name === playlistName ? "active" : "";
    button.addEventListener("click", () => switchPlaylist(name));
    tabs.appendChild(button);
  });
}

function emptyMarkup() {
  return `
    <div class="player empty">
      <strong>Your nostalgia station is ready.</strong>
      <p>Add a rights-cleared YouTube video to <code>script.js</code>.</p>
    </div>
  `;
}

function playerMarkup(track) {
  return `
    <div class="player desktop-player">
      <div class="artwork" id="artwork">
        <div id="yt-desktop"></div>
        <div class="spindle"></div>
      </div>

      <div class="info">
        <div class="title">${escapeHtml(track.title)}</div>
        <div class="artist">${escapeHtml(track.artist)}</div>
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
          <div class="title">${escapeHtml(track.title)}</div>
          <div class="artist">${escapeHtml(track.artist)}</div>
          <div class="meta">${escapeHtml(track.film)} • ${track.year}</div>
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

      <button class="play-btn" id="${prefix}-play" aria-label="Play" disabled>
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

function renderPlayer() {
  const tracks = playlists[playlistName] || [];
  currentTrack = tracks[trackIndex];

  if (!currentTrack) {
    $("#player").innerHTML = emptyMarkup();
    return;
  }

  $("#player").innerHTML = playerMarkup(currentTrack);

  ["desktop", "mobile"].forEach(prefix => {
    $(`#${prefix}-play`).addEventListener("click", togglePlayback);
    $(`#${prefix}-prev`).addEventListener("click", previousTrack);
    $(`#${prefix}-next`).addEventListener("click", nextTrack);
  });

  setupSeek("seek-desktop");
  setupSeek("seek-mobile");

  playerReady = false;
  isPlaying = false;

  if (apiReady) createYouTubePlayer();
}

function setupSeek(id) {
  const seek = document.getElementById(id);
  if (!seek) return;

  seek.addEventListener("pointerdown", event => {
    if (!ytPlayer || !playerReady || !currentTrack) return;

    const rect = seek.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const duration = ytPlayer.getDuration() || currentTrack.duration;

    ytPlayer.seekTo(ratio * duration, true);
    updateProgress(ratio * duration, duration);
  });
}

function setPlayIcon() {
  ["desktop", "mobile"].forEach(prefix => {
    const button = $(`#${prefix}-play`);
    if (!button) return;

    button.disabled = !playerReady;
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
    if (!ytPlayer || !playerReady) return;

    try {
      const current = ytPlayer.getCurrentTime();
      const duration = ytPlayer.getDuration() || currentTrack?.duration || 0;
      updateProgress(current, duration);
    } catch {}
  }, 400);
}

function createYouTubePlayer() {
  if (!window.YT || !window.YT.Player || !currentTrack) return;

  if (ytPlayer) {
    try { ytPlayer.destroy(); } catch {}
    ytPlayer = null;
  }

  const desktopHost = document.getElementById("yt-desktop");
  const mobileHost = document.getElementById("yt-mobile");

  // The same visible player is mounted into the currently visible layout.
  // On resize, recreate the player so the artwork remains visible.
  const host = window.matchMedia("(max-width: 639px)").matches ? mobileHost : desktopHost;
  if (!host) return;

  ytPlayer = new YT.Player(host, {
    videoId: currentTrack.videoId,
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      modestbranding: 1,
      playsinline: 1
    },
    events: {
      onReady: event => {
        playerReady = true;
        const actualDuration = event.target.getDuration();
        updateProgress(0, actualDuration || currentTrack.duration);
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

      onError: event => {
        analytics("youtube_track_error", {
          code: event.data,
          videoId: currentTrack.videoId,
          trackId: currentTrack.id
        });
        nextTrack();
      }
    }
  });
}

function togglePlayback() {
  if (!ytPlayer || !playerReady) return;

  if (isPlaying) ytPlayer.pauseVideo();
  else ytPlayer.playVideo();
}

function nextTrack() {
  const tracks = playlists[playlistName] || [];
  if (!tracks.length) return;

  trackIndex = (trackIndex + 1) % tracks.length;
  renderPlayer();
}

function previousTrack() {
  const tracks = playlists[playlistName] || [];
  if (!tracks.length) return;

  trackIndex = (trackIndex - 1 + tracks.length) % tracks.length;
  renderPlayer();
}

function switchPlaylist(name) {
  playlistName = name;
  trackIndex = 0;

  if (ytPlayer) {
    try { ytPlayer.stopVideo(); } catch {}
  }

  renderTabs();
  renderPlayer();
}

window.onYouTubeIframeAPIReady = function () {
  apiReady = true;
  createYouTubePlayer();
};

updateClock();
setInterval(updateClock, 1000);

renderTabs();
renderPlayer();

// Rebuild the visible YouTube player when crossing the mobile/desktop breakpoint.
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