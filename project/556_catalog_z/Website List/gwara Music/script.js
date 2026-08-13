const playlists = {
  "Golden Memories": [
    { id: "gm-01", title: "Mana Ki Rani", artist: "Kuma Sagar", duration: 240, cover: "https://img.youtube.com/vi/clQK__cONpI/hqdefault.jpg", youtubeId: "clQK__cONpI" },
    { id: "gm-02", title: "Hawa Ko Lahar", artist: "Kuma Sagar", duration: 210, cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { id: "gm-03", title: "Man Dulayera", artist: "ShreeGo", duration: 180, cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=300", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
    { id: "gm-04", title: "Syndicate", artist: "Bipul Chettri", duration: 260, cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=300", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" }
  ],

  "Roadside Radio": [
    { id: "rr-01", title: "Sarangi", artist: "Sushant KC", duration: 215, cover: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=300", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
    { id: "rr-02", title: "Maya", artist: "Ashutosh KC", duration: 200, cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=300", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" }
  ],

  "Late Night": [
    { id: "ln-01", title: "Midnight Kathmandu", artist: "Lofi Vibes", duration: 228, cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=300", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
    { id: "ln-02", title: "Pahadi Breeze", artist: "Acoustic Session", duration: 243, cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=300", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3" }
  ]
};

let currentPlaylist = Object.keys(playlists)[0];
let currentTrackIndex = 0;
let isPlaying = false;
const audioPlayer = new Audio();

const $ = (s) => document.querySelector(s);

function formatTime(seconds) {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function updateClock() {
  const clock = $("#clock");
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
  const container = $("#playlist-tabs");
  if (!container) return;
  container.innerHTML = "";

  Object.keys(playlists).forEach(name => {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.className = name === currentPlaylist ? "active" : "";
    btn.onclick = () => switchPlaylist(name);
    container.appendChild(btn);
  });
}

function renderPlayerShell() {
  const track = playlists[currentPlaylist][currentTrackIndex];
  const container = $("#player");

  container.innerHTML = `
    <div class="player-card">
      <div class="player-main">
        <div class="artwork" id="artwork">
          <img src="${track.cover}" class="artwork-img" alt="Cover">
          <div class="spindle"></div>
        </div>

        <div class="info">
          <div class="title" id="track-title">${escapeHtml(track.title)}</div>
          <div class="artist" id="track-artist">${escapeHtml(track.artist)}</div>
          
          <div class="seek" id="seek-bar" role="slider">
            <div class="rail"></div>
            <div class="fill" id="seek-fill"></div>
            <div class="knob" id="seek-knob"></div>
          </div>
          
          <div class="times">
            <span id="time-elapsed">0:00</span>
            <span id="time-duration">${formatTime(track.duration)}</span>
          </div>
        </div>

        <div class="transport">
          <button class="icon-btn" id="prev-btn" aria-label="Previous">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 5v14M18 6l-8 6 8 6V6Z"/></svg>
          </button>
          
          <button class="play-btn" id="play-btn" aria-label="Play">
            <svg id="play-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.2v13.6c0 .8.9 1.3 1.6.9l10-6.8c.6-.4.6-1.3 0-1.7l-10-6.8C8.9 4 8 4.4 8 5.2Z"/></svg>
            <svg id="pause-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M7 5h3v14H7V5Zm7 0h3v14h-3V5Z"/></svg>
          </button>

          <button class="icon-btn" id="next-btn" aria-label="Next">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 5v14M6 6l8 6-8 6V6Z"/></svg>
          </button>
        </div>
      </div>

      <div class="track-list" id="track-list"></div>
    </div>
  `;

  $("#play-btn").onclick = togglePlay;
  $("#prev-btn").onclick = prevTrack;
  $("#next-btn").onclick = nextTrack;
  setupSeek();
  renderTrackList();
  loadTrack(false);
}

function renderTrackList() {
  const container = $("#track-list");
  if (!container) return;
  const tracks = playlists[currentPlaylist];

  container.innerHTML = tracks.map((t, idx) => `
    <div class="track-item ${idx === currentTrackIndex ? 'active' : ''}" onclick="selectTrack(${idx})">
      <span>${idx + 1}. ${escapeHtml(t.title)}</span>
      <span class="track-item-artist">${escapeHtml(t.artist)}</span>
    </div>
  `).join('');
}

function loadTrack(shouldPlay = true) {
  const track = playlists[currentPlaylist][currentTrackIndex];
  if (!track) return;

  $("#track-title").textContent = track.title;
  $("#track-artist").textContent = track.artist;
  $(".artwork-img").src = track.cover;
  $("#time-duration").textContent = formatTime(track.duration);

  audioPlayer.src = track.audioUrl;
  updateProgress(0, track.duration);
  renderTrackList();

  if (shouldPlay) {
    audioPlayer.play().then(() => {
      isPlaying = true;
      updatePlayState();
    }).catch(err => console.warn("Autoplay blocked:", err));
  } else {
    isPlaying = false;
    updatePlayState();
  }
}

function togglePlay() {
  if (isPlaying) {
    audioPlayer.pause();
    isPlaying = false;
  } else {
    audioPlayer.play();
    isPlaying = true;
  }
  updatePlayState();
}

function updatePlayState() {
  const playIcon = $("#play-icon");
  const pauseIcon = $("#pause-icon");
  const artwork = $("#artwork");

  if (playIcon) playIcon.style.display = isPlaying ? "none" : "block";
  if (pauseIcon) pauseIcon.style.display = isPlaying ? "block" : "none";
  if (artwork) artwork.style.animationPlayState = isPlaying ? "running" : "paused";
}

function setupSeek() {
  const seek = $("#seek-bar");
  if (!seek) return;

  seek.addEventListener("pointerdown", (e) => {
    const rect = seek.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const duration = audioPlayer.duration || playlists[currentPlaylist][currentTrackIndex].duration;

    audioPlayer.currentTime = ratio * duration;
    updateProgress(ratio * duration, duration);
  });
}

function updateProgress(current, duration) {
  const percent = duration ? Math.min(100, Math.max(0, (current / duration) * 100)) : 0;
  const fill = $("#seek-fill");
  const knob = $("#seek-knob");
  const elapsed = $("#time-elapsed");

  if (fill) fill.style.width = `${percent}%`;
  if (knob) knob.style.left = `${percent}%`;
  if (elapsed) elapsed.textContent = formatTime(current);
}

function nextTrack() {
  const tracks = playlists[currentPlaylist];
  currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
  loadTrack(true);
}

function prevTrack() {
  const tracks = playlists[currentPlaylist];
  currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
  loadTrack(true);
}

function switchPlaylist(name) {
  currentPlaylist = name;
  currentTrackIndex = 0;
  renderTabs();
  loadTrack(isPlaying);
}

window.selectTrack = function(index) {
  currentTrackIndex = index;
  loadTrack(true);
};

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
}

// Audio Event Listeners
audioPlayer.addEventListener("timeupdate", () => {
  const cur = audioPlayer.currentTime || 0;
  const dur = audioPlayer.duration || playlists[currentPlaylist][currentTrackIndex].duration;
  updateProgress(cur, dur);
});

audioPlayer.addEventListener("ended", () => nextTrack());

// Initialization
updateClock();
setInterval(updateClock, 1000);
renderTabs();
renderPlayerShell();