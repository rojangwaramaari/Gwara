// PLAYLIST DATA (Supports Local MP3 & YouTube Fallback)
let playlist = [
  {
    title: "Mana Ki Rani",
    artist: "Kuma Sagar",
    duration: "4:00",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=300",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    type: "MP3"
  },
  {
    title: "Hawa Ko Lahar",
    artist: "Kuma Sagar",
    duration: "3:30",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    type: "MP3"
  },
  {
    title: "Pahadi Lofi Session",
    artist: "Acoustic Nepal",
    duration: "4:15",
    cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=300",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    type: "MP3"
  }
];

let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isLoop = false;

const audio = new Audio();
const $ = (id) => document.getElementById(id);

// --- KATHMANDU CLOCK SYSTEM ---
function updateKathmanduClock() {
  const now = new Date();
  
  // Convert to NPT (UTC + 5:45)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const ktmTime = new Date(utc + (3600000 * 5.75));

  let hours = ktmTime.getHours();
  const minutes = ktmTime.getMinutes();
  const seconds = ktmTime.getSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; 

  const strTime = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  if ($('digi-time')) $('digi-time').textContent = strTime;

  // Analog Hands Calculations
  const secDeg = (seconds / 60) * 360;
  const minDeg = ((minutes + seconds / 60) / 60) * 360;
  const hourDeg = (((hours % 12) + minutes / 60) / 12) * 360;

  setHandAngle('hand-sec', secDeg);
  setHandAngle('hand-min', minDeg);
  setHandAngle('hand-hour', hourDeg);
}

function setHandAngle(id, deg) {
  const hand = $(id);
  if (hand) {
    hand.setAttribute('transform', `rotate(${deg} 50 50)`);
  }
}

setInterval(updateKathmanduClock, 1000);
updateKathmanduClock();

// --- PLAYER ENGINE ---
function loadTrack(index) {
  currentIndex = index;
  const track = playlist[currentIndex];

  $('track-title').textContent = track.title;
  $('track-artist').textContent = track.artist;
  $('cover-art').src = track.cover;
  $('source-badge').textContent = track.type;

  audio.src = track.url;
  audio.load();

  renderPlaylist();

  if (isPlaying) {
    audio.play().catch(() => {});
  }
}

function togglePlay() {
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
  } else {
    audio.play();
    isPlaying = true;
  }
  updateUIState();
}

function updateUIState() {
  $('btn-play').textContent = isPlaying ? '⏸' : '▶';
  if (isPlaying) {
    $('vinyl-box').classList.add('playing');
  } else {
    $('vinyl-box').classList.remove('playing');
  }
}

function nextTrack() {
  if (isShuffle) {
    currentIndex = Math.floor(Math.random() * playlist.length);
  } else {
    currentIndex = (currentIndex + 1) % playlist.length;
  }
  loadTrack(currentIndex);
  if (!isPlaying) togglePlay();
}

function prevTrack() {
  currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  loadTrack(currentIndex);
  if (!isPlaying) togglePlay();
}

// --- RENDER PLAYLIST & FILE UPLOAD ---
function renderPlaylist() {
  const container = $('song-list');
  container.innerHTML = '';

  playlist.forEach((song, i) => {
    const div = document.createElement('div');
    div.className = `song-item ${i === currentIndex ? 'active' : ''}`;
    div.innerHTML = `
      <div>
        <div class="song-title">${song.title}</div>
        <div class="song-artist">${song.artist}</div>
      </div>
      <span style="font-size:10px; opacity:0.6">${song.duration}</span>
    `;
    div.onclick = () => {
      loadTrack(i);
      if (!isPlaying) togglePlay();
    };
    container.appendChild(div);
  });
}

// Handle Local File Upload
$('file-input').addEventListener('change', (e) => {
  const files = e.target.files;
  for (let file of files) {
    const url = URL.createObjectURL(file);
    playlist.push({
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: "Local Upload",
      duration: "Local",
      cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=300",
      url: url,
      type: "Local MP3"
    });
  }
  renderPlaylist();
});

// --- CONTROLS EVENT LISTENERS ---
$('btn-play').onclick = togglePlay;
$('btn-next').onclick = nextTrack;
$('btn-prev').onclick = prevTrack;

$('btn-shuffle').onclick = () => {
  isShuffle = !isShuffle;
  $('btn-shuffle').classList.toggle('active', isShuffle);
};

$('btn-loop').onclick = () => {
  isLoop = !isLoop;
  $('btn-loop').classList.toggle('active', isLoop);
};

audio.addEventListener('timeupdate', () => {
  if (audio.duration) {
    $('seek-bar').value = (audio.currentTime / audio.duration) * 100;
    $('curr-time').textContent = formatTime(audio.currentTime);
    $('dur-time').textContent = formatTime(audio.duration);
  }
});

audio.addEventListener('ended', () => {
  if (isLoop) {
    audio.currentTime = 0;
    audio.play();
  } else {
    nextTrack();
  }
});

$('seek-bar').oninput = (e) => {
  if (audio.duration) {
    audio.currentTime = (e.target.value / 100) * audio.duration;
  }
};

$('vol-bar').oninput = (e) => {
  audio.volume = e.target.value;
};

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// --- AMBIENT NOISE GENERATOR (TEA SHOP & RAIN) ---
let audioCtx, rainNode, chatterNode;

function toggleAmbience(type, btnId) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  const btn = $(btnId);
  btn.classList.toggle('active');

  if (btn.classList.contains('active')) {
    // Generate pink noise / ambient simulation
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
    filter.frequency.value = type === 'rain' ? 800 : 1200;

    const gain = audioCtx.createGain();
    gain.gain.value = 0.05;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();

    if (type === 'rain') rainNode = noise;
    else chatterNode = noise;
  } else {
    if (type === 'rain' && rainNode) rainNode.stop();
    if (type === 'chatter' && chatterNode) chatterNode.stop();
  }
}

$('btn-rain').onclick = () => toggleAmbience('rain', 'btn-rain');
$('btn-chatter').onclick = () => toggleAmbience('chatter', 'btn-chatter');

// Initialize
loadTrack(0);