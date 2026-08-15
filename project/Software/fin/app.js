/* ============================================================
   GwaraFin — app.js
   Real-time Asia/Kathmandu clock, live Open-Meteo weather,
   canvas RevPAR chart, and live finance calculators.
   ============================================================ */

// ---------- 1. Real-time Kathmandu clock (UTC+5:45) ----------
const timeEl = document.getElementById("clock-time");
const dateEl = document.getElementById("clock-date");

const timeFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kathmandu",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});
const dateFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kathmandu",
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

function tick() {
  const now = new Date();
  timeEl.textContent = timeFmt.format(now);
  dateEl.textContent = dateFmt.format(now);
}
tick();
setInterval(tick, 1000);

// ---------- 2. Live weather — Open-Meteo (no API key) ----------
const KTM = { lat: 27.7172, lon: 85.324 };

const WEATHER_CODES = {
  0: ["Clear sky", "☀️"],
  1: ["Mainly clear", "🌤️"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"],
  48: ["Rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  53: ["Drizzle", "🌦️"],
  55: ["Heavy drizzle", "🌧️"],
  61: ["Light rain", "🌦️"],
  63: ["Rain", "🌧️"],
  65: ["Heavy rain", "🌧️"],
  71: ["Light snow", "🌨️"],
  73: ["Snow", "🌨️"],
  75: ["Heavy snow", "❄️"],
  80: ["Rain showers", "🌦️"],
  81: ["Showers", "🌧️"],
  82: ["Violent showers", "⛈️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Storm + hail", "⛈️"],
  99: ["Storm + hail", "⛈️"],
};

function describe(code) {
  return WEATHER_CODES[code] || ["Unknown", "🌡️"];
}

async function loadWeather() {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${KTM.lat}&longitude=${KTM.lon}` +
    "&current=temperature_2m,weather_code,relative_humidity_2m" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
    "&timezone=Asia%2FKathmandu&forecast_days=5";

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather request failed: " + res.status);
    const data = await res.json();

    // Header widget
    const [desc, icon] = describe(data.current.weather_code);
    document.getElementById("weather-temp").textContent =
      Math.round(data.current.temperature_2m) + "°C";
    document.getElementById("weather-desc").textContent =
      desc + " · " + data.current.relative_humidity_2m + "% RH · Kathmandu";
    document.getElementById("weather-icon").textContent = icon;

    // 5-day forecast strip
    const strip = document.getElementById("forecast-strip");
    strip.innerHTML = "";
    const dayFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });

    data.daily.time.forEach((iso, i) => {
      const [dDesc, dIcon] = describe(data.daily.weather_code[i]);
      const card = document.createElement("article");
      card.className = "forecast-day";
      card.innerHTML =
        '<p class="fc-name">' + dayFmt.format(new Date(iso + "T12:00:00")) + "</p>" +
        '<p class="fc-icon" aria-hidden="true">' + dIcon + "</p>" +
        '<p class="fc-temps">' + Math.round(data.daily.temperature_2m_max[i]) + "° " +
        "<span>/ " + Math.round(data.daily.temperature_2m_min[i]) + "°</span></p>" +
        '<p class="fc-desc">' + dDesc + "</p>";
      strip.appendChild(card);
    });
  } catch (err) {
    console.log("[v0] Weather fetch error:", err.message);
    document.getElementById("weather-desc").textContent = "Weather unavailable";
    document.getElementById("forecast-strip").innerHTML =
      '<p class="forecast-loading">Forecast unavailable right now.</p>';
  }
}
loadWeather();
setInterval(loadWeather, 15 * 60 * 1000); // refresh every 15 min

// ---------- 3. Formatting helpers ----------
const npr = (n) =>
  "NPR " + Math.round(n).toLocaleString("en-IN");
const pct = (n) => (isFinite(n) ? n.toFixed(1) + "%" : "—");

function num(id) {
  const v = parseFloat(document.getElementById(id).value);
  return isNaN(v) ? 0 : v;
}

// ---------- 4. RevPAR calculator ----------
function calcRevpar() {
  const avail = num("rooms-available");
  const sold = Math.min(num("rooms-sold"), avail);
  const rev = num("room-revenue");

  const occ = avail > 0 ? (sold / avail) * 100 : 0;
  const adr = sold > 0 ? rev / sold : 0;
  const revpar = avail > 0 ? rev / avail : 0;

  document.getElementById("res-occ").textContent = pct(occ);
  document.getElementById("res-adr").textContent = npr(adr);
  document.getElementById("res-revpar").textContent = npr(revpar);
}

// ---------- 5. Break-even occupancy ----------
function calcBreakEven() {
  const fixed = num("fixed-costs");
  const varCost = num("var-cost");
  const adr = num("be-adr");
  const rooms = num("be-rooms");

  const margin = adr - varCost;
  const roomsNeeded = margin > 0 ? fixed / margin : Infinity;
  const occNeeded = rooms > 0 && isFinite(roomsNeeded) ? (roomsNeeded / rooms) * 100 : Infinity;

  document.getElementById("res-be-rooms").textContent = isFinite(roomsNeeded)
    ? Math.ceil(roomsNeeded).toLocaleString("en-IN") + " rooms"
    : "Not achievable";
  document.getElementById("res-be-occ").textContent = isFinite(occNeeded)
    ? pct(occNeeded)
    : "—";
}

// ---------- 6. F&B cost ratio ----------
function calcFnb() {
  const rev = num("fnb-revenue");
  const food = num("food-cost");
  const labour = num("labour-cost");

  const foodPct = rev > 0 ? (food / rev) * 100 : NaN;
  const labourPct = rev > 0 ? (labour / rev) * 100 : NaN;
  const prime = foodPct + labourPct;

  document.getElementById("res-food-pct").textContent = pct(foodPct);
  document.getElementById("res-labour-pct").textContent = pct(labourPct);
  document.getElementById("res-prime-pct").textContent = pct(prime);

  const verdict = document.getElementById("fnb-verdict");
  if (!isFinite(prime)) verdict.textContent = "";
  else if (prime <= 55) verdict.textContent = "Healthy — prime cost under the 55–60% benchmark.";
  else if (prime <= 65) verdict.textContent = "Watchlist — prime cost is creeping above benchmark.";
  else verdict.textContent = "Action needed — prime cost is eating the margin.";
}

// Wire all inputs to live recalculation
document.querySelectorAll(".calc-card input").forEach((input) => {
  input.addEventListener("input", () => {
    calcRevpar();
    calcBreakEven();
    calcFnb();
  });
});
calcRevpar();
calcBreakEven();
calcFnb();

// ---------- 7. RevPAR trend chart (pure canvas) ----------
function drawChart() {
  const canvas = document.getElementById("revpar-chart");
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  // Sample trailing 14-day RevPAR data (NPR)
  const data = [
    12400, 13100, 12850, 14200, 15600, 16900, 16100,
    13800, 13200, 14500, 15100, 15900, 17200, 15941,
  ];
  const labels = [];
  for (let i = data.length - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(
      new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kathmandu", day: "numeric", month: "short" }).format(d)
    );
  }

  const pad = { top: 30, right: 20, bottom: 44, left: 70 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;
  const maxV = Math.max(...data) * 1.12;

  ctx.clearRect(0, 0, W, H);

  // Gridlines + y labels
  ctx.strokeStyle = "rgba(237,234,226,0.07)";
  ctx.fillStyle = "#8a94a0";
  ctx.font = "12px Inter, sans-serif";
  ctx.textAlign = "right";
  for (let g = 0; g <= 4; g++) {
    const y = pad.top + plotH - (plotH * g) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();
    ctx.fillText(Math.round((maxV * g) / 4 / 1000) + "K", pad.left - 10, y + 4);
  }

  // Bars
  const slot = plotW / data.length;
  const barW = slot * 0.55;
  data.forEach((v, i) => {
    const h = (v / maxV) * plotH;
    const x = pad.left + i * slot + (slot - barW) / 2;
    const y = pad.top + plotH - h;
    const isLast = i === data.length - 1;

    ctx.fillStyle = isLast ? "#c9a24b" : "rgba(201,162,75,0.32)";
    ctx.beginPath();
    ctx.roundRect(x, y, barW, h, [4, 4, 0, 0]);
    ctx.fill();

    // x labels (every other one to avoid crowding)
    if (i % 2 === 1 || isLast) {
      ctx.fillStyle = "#8a94a0";
      ctx.textAlign = "center";
      ctx.fillText(labels[i], x + barW / 2, H - pad.bottom + 24);
    }
  });

  // Highlight value on last bar
  const last = data[data.length - 1];
  const lastX = pad.left + (data.length - 1) * slot + slot / 2;
  const lastY = pad.top + plotH - (last / maxV) * plotH;
  ctx.fillStyle = "#edeae2";
  ctx.font = "600 13px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(npr(last), lastX, lastY - 10);
}
drawChart();
