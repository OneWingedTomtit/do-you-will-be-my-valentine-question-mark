const hero = document.querySelector(".hero");
const envelopeBtn = document.getElementById("envelopeBtn");
const letterPanel = document.getElementById("letterPanel");

const audio = document.getElementById("audio");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const seek = document.getElementById("seek");
const trackTitle = document.getElementById("trackTitle");
const trackMeta = document.getElementById("trackMeta");
const trackList = document.getElementById("trackList");
// --- GLITCH (add-on, does not change your logic) ---
const playerCard = document.querySelector(".playerCard");
let glitchTimer = null;

function burstGlitch(level = "medium") {
  if (!playerCard) return;

  playerCard.classList.remove("glitchOn", "scanFlash", "shakeTiny");
  void playerCard.offsetWidth;

  playerCard.classList.add("glitchOn", "scanFlash");
  if (level !== "light") playerCard.classList.add("shakeTiny");

  if (level === "hard") {
    setTimeout(() => {
      playerCard.classList.remove("glitchOn", "scanFlash", "shakeTiny");
      void playerCard.offsetWidth;
      playerCard.classList.add("glitchOn", "scanFlash", "shakeTiny");
    }, 160);
  }

  setTimeout(() => {
    playerCard.classList.remove("glitchOn", "scanFlash", "shakeTiny");
  }, 520);
}

function startAmbientGlitches() {
  if (glitchTimer) return;
  glitchTimer = setInterval(() => {
    if (!audio || audio.paused) return;
    if (Math.random() < 0.20) burstGlitch("light");
  }, 4500);
}

function stopAmbientGlitches() {
  if (!glitchTimer) return;
  clearInterval(glitchTimer);
  glitchTimer = null;
}
// --- /GLITCH ---

// 🔧 Edit this list to match your files
const tracks = [
  { title: "The Day", src: "audio/the-day.mp3" },
  { title: "When We", src: "audio/when-we.mp3" },
  { title: "Started Our", src: "audio/started-our.mp3" },
  { title: "The Midnight Walk", src: "audio/the-midnight-walk.mp3" },
];

let currentIndex = 0;
let isSeeking = false;
let durationCache = new Map();

// Envelope toggle
function setOpenState(open) {
  hero.classList.toggle("isOpen", open);
  envelopeBtn.setAttribute("aria-expanded", String(open));
  letterPanel.setAttribute("aria-hidden", String(!open));
}

envelopeBtn.addEventListener("click", () => {
  const open = !hero.classList.contains("isOpen");
  setOpenState(open);
});

// Build track list
function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function renderTrackList() {
  trackList.innerHTML = "";
  tracks.forEach((t, i) => {
    const li = document.createElement("li");
    li.dataset.index = String(i);
    if (i === currentIndex) li.classList.add("active");

    const name = document.createElement("span");
    name.className = "tname";
    name.textContent = t.title;

    const dur = document.createElement("span");
    dur.className = "tdur";
    dur.textContent = durationCache.get(t.src) ?? "—";

    li.appendChild(name);
    li.appendChild(dur);

    li.addEventListener("click", () => {
      loadTrack(i, true);
    });

    trackList.appendChild(li);
  });
}

async function preloadDurations() {
  // Load metadata for durations (best-effort)
  for (const t of tracks) {
    if (durationCache.has(t.src)) continue;

    await new Promise((resolve) => {
      const a = new Audio();
      a.preload = "metadata";
      a.src = t.src;

      a.addEventListener("loadedmetadata", () => {
        durationCache.set(t.src, formatTime(a.duration));
        resolve();
      });
      a.addEventListener("error", () => {
        durationCache.set(t.src, "—");
        resolve();
      });
    });
  }
  renderTrackList();
}

function updateUI() {
  trackTitle.textContent = tracks[currentIndex]?.title ?? "—";
  const cur = formatTime(audio.currentTime);
  const dur = formatTime(audio.duration);
  trackMeta.textContent = `${cur} / ${dur}`;

  // progress range
  if (!isSeeking && Number.isFinite(audio.duration) && audio.duration > 0) {
    seek.value = String((audio.currentTime / audio.duration) * 100);
  }

  // active list item
  [...trackList.querySelectorAll("li")].forEach(li => {
    li.classList.toggle("active", Number(li.dataset.index) === currentIndex);
  });

  playBtn.textContent = audio.paused ? "Play" : "Pause";
}

function loadTrack(index, autoplay = false) {
  currentIndex = (index + tracks.length) % tracks.length;
  audio.src = tracks[currentIndex].src;
  audio.load();
  burstGlitch("medium");
  updateUI();


  if (autoplay) {
    audio.play().catch(() => { /* ignore autoplay blocking */ });
  }
}

function nextTrack(autoplay = true) {
  loadTrack(currentIndex + 1, autoplay);
}

function prevTrack(autoplay = true) {
  loadTrack(currentIndex - 1, autoplay);
}

playBtn.addEventListener("click", () => {
  burstGlitch("light");
  if (!audio.src) loadTrack(currentIndex, false);
  if (audio.paused) audio.play();
  else audio.pause();
});

nextBtn.addEventListener("click", () => { burstGlitch("hard"); nextTrack(true); });
prevBtn.addEventListener("click", () => { burstGlitch("hard"); prevTrack(true); });


audio.addEventListener("timeupdate", updateUI);
audio.addEventListener("loadedmetadata", updateUI);
audio.addEventListener("play", () => { updateUI(); startAmbientGlitches(); });
audio.addEventListener("pause", () => { updateUI(); stopAmbientGlitches(); });
audio.addEventListener("ended", () => nextTrack(true));

// Seek handling
seek.addEventListener("input", () => { isSeeking = true; });
seek.addEventListener("change", () => {
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
  const pct = Number(seek.value) / 100;
  audio.currentTime = pct * audio.duration;
  isSeeking = false;
  updateUI();
});

// Init
loadTrack(0, false);
renderTrackList();
preloadDurations();
