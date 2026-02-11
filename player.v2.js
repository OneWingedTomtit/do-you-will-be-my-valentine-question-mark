console.log("player.js loaded");
document.addEventListener("DOMContentLoaded", () => {
  const b = document.createElement("div");
  b.textContent = "BUILD ✅ V2 LOADED";
  b.style.cssText = "position:fixed;top:10px;left:10px;z-index:2147483647;background:#001b00;color:#34ff6a;padding:6px 10px;border-radius:10px;font:12px system-ui";
  document.body.appendChild(b);
});

// ===== HARD BUILD BADGE (если не видишь — ты не тот файл открыла) =====
document.addEventListener("DOMContentLoaded", () => {
  const b = document.createElement("div");
  b.textContent = "BUILD ✅ player.js overlay v1";
  b.style.cssText =
    "position:fixed;top:10px;left:10px;z-index:2147483647;background:#001b00;color:#34ff6a;padding:6px 10px;border-radius:10px;font:12px system-ui;opacity:.85";
  document.body.appendChild(b);
});

/* =========================
   DOM
========================= */
const intro = document.getElementById("intro");
const introBtn = document.getElementById("introBtn");

const hero = document.querySelector(".hero");
const envelopeBtn = document.getElementById("envelopeBtn");
const letterPanel = document.getElementById("letterPanel");
const closeLetterBtn = document.getElementById("closeLetterBtn");

const playerCard = document.getElementById("playerCard");
const playerToggle = document.getElementById("playerToggle");
const playerBody = document.getElementById("playerBody");

const audio = document.getElementById("audio");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const seek = document.getElementById("seek");
const volume = document.getElementById("volume");
const trackTitle = document.getElementById("trackTitle");
const trackMeta = document.getElementById("trackMeta");
const trackList = document.getElementById("trackList");

const glitchLayer = document.getElementById("glitchLayer");

/* =========================
   DATA
========================= */
const tracks = [
  { title: "The Day", src: "audio/the-day.mp3" },
  { title: "When We", src: "audio/when-we.mp3" },
  { title: "Started Our", src: "audio/started-our.mp3" },
  { title: "The Midnight Walk", src: "audio/the-midnight-walk.mp3" },
];

const lyricsBySrc = {
  "audio/the-day.mp3": `You wrote
after a long time.

Nothing dramatic,
no “we need to talk” sign.
Just words
that didn’t push,
that didn’t pull,
that knew how much
is too much.

Two years
fit
between lines,
like something lost
but still alive.

I read it once.
Then again.
Then something in me
missed a breath.

You weren’t angry.
That caught me off guard.
You were careful,
like someone
who knows where it hurts
and doesn’t go that far.

I knew
I was wrong back then.
Not confused.
Not caught in plans.
Just not ready
to stay and stand.

I missed you.
Not every day.
But in quiet ways
that don’t ask
to go away.

That night
we sat
on opposite sides
of glowing screens,
with too much space
and honest means.

No promises.
No pulling close.
No fixing what
was almost broke.

Just one question
left to say:

Do we write
tomorrow —
or walk away?

I was scared
because I wanted to.
You were scared
because you didn’t know
if I’d come through.

You wrote anyway.

I said
it’s okay
to stop.

You said
you’ll write.

I said
I’ll reply.

And for once
that
felt
right.`,

  "audio/when-we.mp3": `You were already there,
waiting in the cold air,
hidden street, city center,
evening almost bare.

I was late, I was running,
didn’t know the way,
but something in me knew
where to go that day.

We didn’t know each other
from a distance, from afar,
but then you walked toward me
and I knew who you are.
No pause, no doubt,
no space between,
we met in the middle
and everything went clean.

When we
finally touched,
the city went quiet.
When we
held each other,
nothing else applied.
Happiness first,
then the breath came back,
like my body remembered
something I forgot to track.

Your hands were careful,
every move awake.
I was shy inside my skin,
not scared — just split.
But you didn’t rush me,
you didn’t pull me through,
you stayed right where I was
and let me come to you.

We talked and laughed too much,
time slipped through our hands,
jokes flying easy
without any plans.
For the first time in so long
I didn’t guard my chest,
I just stayed in the moment
and let my body rest.

When we
lost track of minutes
in an empty town,
When we
stood there smiling
while the night came down.
No promises said,
no future to claim,
just knowing this moment
was enough to remain.`,

  "audio/started-our.mp3": `I didn't found words to discribe our first intimacy.`,

  "audio/the-midnight-walk.mp3": `City breathing slow after midnight.
No noise left, no eyes watching.
We step out when everything finally shuts up.

I was the dark.
Left and right, above and under.
No distance, no skin.
I wasn’t inside it. I was it.
Then a spark.
Not hope, not light. Just a rupture.
Eyes to see what’s real.
Ears to hear what hurts.

Nothing.
Then trees.
Then a wide road.
My legs shaking.
I wouldn’t make it far alone.
Your hands on my shoulders.
No force, no direction.
You didn’t walk for me.
You didn’t let me drop.

This is our midnight walk.
Not to escape, not to hide.
We walk because stopping would lie.
If the city goes silent, if the road feels thin,
we stay close and keep moving.

You know my monsters, where they stay, how they breathe
in places without light.
You don’t flinch. You don’t fight.
You don’t ask me to be clean.
I don’t see yours. Maybe I choose not to.
You look intact, but shadows always trail.
Still I don’t fear you. I don’t pull away.
My body says: stay.

No roles. No rescue.
No future spoken out loud.
Just weight, shared.

This is our midnight walk,
between dark and what’s next.
No promises, no map. Just steps.
If the ground starts echoing, if the night presses in,
I move. You move. That’s it.

If I fall into the blue lagoon, thick and deep,
I don’t drown.
Sticky calm at the bottom below.
You go with me, not to save, not to pull me out.
You let me reach it, so I know I can stand there.

This is our midnight walk.
No fire yet, but we know it’s real. We know it’s close.
If the step turns hollow, if the night holds long,
I move. You move. We go.

City stays somewhere behind.
We don’t light the sun tonight.
But we walk, knowing
we are going to.`,
};

/* =========================
   STATE
========================= */
const isMobile = () =>
  window.matchMedia("(pointer: coarse)").matches ||
  window.matchMedia("(max-width: 980px)").matches;

let envState = 0; // 0 front, 1 back, 2 letter
let currentIndex = 0;
let isSeeking = false;
const durationCache = new Map();

/* =========================
   UTILS
========================= */
function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

function formatTime(sec){
  if (!Number.isFinite(sec) || sec < 0) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function pulse(el){
  if (!el) return;
  el.classList.remove("glitchPulse");
  void el.offsetWidth;
  el.classList.add("glitchPulse");
  setTimeout(() => el.classList.remove("glitchPulse"), 360);
}

function maybeTear(el){
  if (!el) return;
  if (Math.random() < 0.18){
    el.classList.add("edgeTear");
    setTimeout(() => el.classList.remove("edgeTear"), 520);
  }
}

/* =========================
   MOBILE LETTER OVERLAY (REAL FIX)
   - Overlay appended to BODY (not inside .hero transforms)
   - Moves letterPanel into overlay on open
   - Moves it back on close
========================= */
let letterOverlay = null;
let letterPlaceholder = null;

function ensureLetterOverlay(){
  if (letterOverlay) return letterOverlay;

  letterOverlay = document.createElement("div");
  letterOverlay.id = "letterOverlay";
  letterOverlay.setAttribute("aria-hidden", "true");
  letterOverlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 2147483647;
    display: none;
    background: rgba(0,0,0,.70);
    backdrop-filter: blur(10px);
    padding: max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right))
             max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
  `;

  const frame = document.createElement("div");
  frame.id = "letterOverlayFrame";
  frame.style.cssText = `
    height: 100%;
    width: 100%;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,.16);
    background: rgba(10,12,20,.94);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 18px 60px rgba(0,0,0,.55);
  `;

  const head = document.createElement("div");
  head.style.cssText = `
    padding: 12px 12px;
    border-bottom: 1px solid rgba(255,255,255,.10);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  `;
  head.innerHTML = `
    <div style="font-weight:900;letter-spacing:.12em;text-transform:uppercase;font-size:12px;color:rgba(233,238,252,.85)">
      Letter
    </div>
    <button id="overlayX" type="button"
      style="border:1px solid rgba(255,255,255,.16);background:transparent;color:#e9eefc;border-radius:12px;padding:8px 12px;font-weight:900;cursor:pointer">
      ✕
    </button>
  `;

  const body = document.createElement("div");
  body.id = "letterOverlayBody";
  body.style.cssText = `
    flex: 1 1 auto;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    padding: 14px 14px 90px;
  `;

  const foot = document.createElement("div");
  foot.style.cssText = `
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: 12px;
    z-index: 2147483647;
  `;
  // NOTE: we will NOT create another close button
  // we will reuse YOUR existing #closeLetterBtn and pin it

  frame.appendChild(head);
  frame.appendChild(body);
  letterOverlay.appendChild(frame);
  document.body.appendChild(letterOverlay);

  // click outside frame to close
  letterOverlay.addEventListener("click", (e) => {
    if (e.target === letterOverlay) closeMobileLetter();
  });
  letterOverlay.querySelector("#overlayX")?.addEventListener("click", closeMobileLetter);

  return letterOverlay;
}

function openMobileLetter(){
  if (!letterPanel) return;

  const ov = ensureLetterOverlay();
  const ovBody = ov.querySelector("#letterOverlayBody");
  if (!ovBody) return;

  // placeholder to restore original position
  if (!letterPlaceholder){
    letterPlaceholder = document.createComment("letterPanel-placeholder");
    letterPanel.parentNode?.insertBefore(letterPlaceholder, letterPanel);
  }

  // move actual panel into overlay body
  ovBody.appendChild(letterPanel);

  // force it to fill width inside overlay
  letterPanel.style.setProperty("display", "block", "important");
  letterPanel.style.setProperty("width", "100%", "important");
  letterPanel.style.setProperty("max-width", "none", "important");
  letterPanel.style.setProperty("margin", "0", "important");
  letterPanel.style.setProperty("border-radius", "18px", "important");
  letterPanel.style.setProperty("overflow", "visible", "important");

  // unsqueeze known inner blocks
  letterPanel.querySelectorAll(".letter__title, .letter__body, p").forEach(el => {
    el.style.setProperty("max-width", "none", "important");
    el.style.setProperty("width", "100%", "important");
  });

  // pin your close button at bottom
  if (closeLetterBtn){
    closeLetterBtn.textContent = "Close";
    closeLetterBtn.style.setProperty("position", "fixed", "important");
    closeLetterBtn.style.setProperty("left", "12px", "important");
    closeLetterBtn.style.setProperty("right", "12px", "important");
    closeLetterBtn.style.setProperty("bottom", "12px", "important");
    closeLetterBtn.style.setProperty("z-index", "2147483647", "important");
  }

  ov.style.display = "block";
  ov.setAttribute("aria-hidden", "false");
  document.body.classList.add("lockScroll");
}

function closeMobileLetter(){
  // close state goes through same flow
  envState = 0;
  applyEnvelope();
}

function restoreLetterPanelToOriginalPlace(){
  if (!letterPanel) return;

  // restore close button
  if (closeLetterBtn){
    closeLetterBtn.style.removeProperty("position");
    closeLetterBtn.style.removeProperty("left");
    closeLetterBtn.style.removeProperty("right");
    closeLetterBtn.style.removeProperty("bottom");
    closeLetterBtn.style.removeProperty("z-index");
  }

  if (letterPlaceholder && letterPlaceholder.parentNode){
    letterPlaceholder.parentNode.insertBefore(letterPanel, letterPlaceholder);
  }

  // remove temporary styles
  letterPanel.style.removeProperty("display");
  letterPanel.style.removeProperty("width");
  letterPanel.style.removeProperty("max-width");
  letterPanel.style.removeProperty("margin");
  letterPanel.style.removeProperty("border-radius");
  letterPanel.style.removeProperty("overflow");

  letterPanel.querySelectorAll(".letter__title, .letter__body, p").forEach(el => {
    el.style.removeProperty("max-width");
    el.style.removeProperty("width");
  });
}

/* =========================
   INTRO
========================= */
function hideIntro(){
  if (!intro) return;
  pulse(intro);
  intro.classList.add("isHidden");
  setTimeout(() => intro.setAttribute("aria-hidden","true"), 480);
}

introBtn?.addEventListener("click", () => {
  miniStars(window.innerWidth/2, window.innerHeight/2, 18);
  hideIntro();
});

/* =========================
   ENVELOPE FSM
========================= */
function applyEnvelope(){
  if (!hero) return;

  const mobile = isMobile();
  const isBack = envState >= 1;
  const isLetter = envState >= 2;

  hero.classList.toggle("isBack", isBack);
  hero.classList.toggle("isOpen", isLetter);
  hero.classList.toggle("isLetter", isLetter);

  envelopeBtn?.setAttribute("aria-expanded", String(isLetter));
  letterPanel?.setAttribute("aria-hidden", String(!isLetter));

  // desktop text
  if (closeLetterBtn){
    closeLetterBtn.textContent = mobile ? "Close" : "CLICK AGAIN TO CLOSE LETTER";
  }

  // Mobile: move to overlay (outside transforms)
  if (mobile && isLetter){
    openMobileLetter();
  } else {
    // close overlay if exists
    if (letterOverlay){
      letterOverlay.style.display = "none";
      letterOverlay.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("lockScroll");
    restoreLetterPanelToOriginalPlace();
  }
}

envelopeBtn?.addEventListener("click", () => {
  if (envState >= 2) return; // close only via button
  envState = envState + 1;   // 0->1->2
  applyEnvelope();
  pulse(envelopeBtn);
  maybeTear(letterPanel);
  miniStarsRandomNear(envelopeBtn, 12);
});

closeLetterBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  envState = 0;
  applyEnvelope();
  pulse(envelopeBtn);
  miniStarsRandomNear(letterPanel, 16);
});

/* =========================
   PLAYER COLLAPSE
========================= */
function setPlayerOpen(open){
  if (!playerCard || !playerToggle || !playerBody) return;
  playerCard.classList.toggle("isOpen", open);
  playerToggle.setAttribute("aria-expanded", String(open));
  playerBody.setAttribute("aria-hidden", String(!open));
  pulse(playerCard);
  maybeTear(playerCard);
}

playerToggle?.addEventListener("click", () => {
  const open = !playerCard.classList.contains("isOpen");
  setPlayerOpen(open);
  miniStarsRandomNear(playerCard, 12);
});

/* =========================
   AUDIO PLAYER
========================= */
function renderTrackList(){
  if (!trackList) return;
  trackList.innerHTML = "";

  tracks.forEach((t, i) => {
    const li = document.createElement("li");
    li.dataset.index = String(i);
    if (i === currentIndex) li.classList.add("active");

    const row = document.createElement("div");
    row.className = "trackRow";

    const name = document.createElement("span");
    name.className = "tname";
    name.textContent = t.title;

    const dur = document.createElement("span");
    dur.className = "tdur";
    dur.textContent = durationCache.get(t.src) ?? "—";

    row.appendChild(name);
    row.appendChild(dur);

    const lyBtn = document.createElement("button");
    lyBtn.className = "lyBtn";
    lyBtn.type = "button";
    lyBtn.textContent = "Lyrics";

    const lyBody = document.createElement("div");
    lyBody.className = "lyBody";
    lyBody.textContent = lyricsBySrc[t.src] ?? "—";

    lyBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      li.classList.toggle("showLyrics");
      pulse(playerCard);
      miniStarsRandomNear(li, 10);
      maybeTear(playerCard);
    });

    li.addEventListener("click", () => {
      loadTrack(i, true);
      pulse(playerCard);
      miniStarsRandomNear(li, 10);
      maybeTear(playerCard);
    });

    li.appendChild(row);
    li.appendChild(lyBtn);
    li.appendChild(lyBody);

    trackList.appendChild(li);
  });
}

function updateUI(){
  if (trackTitle) trackTitle.textContent = tracks[currentIndex]?.title ?? "—";

  const cur = formatTime(audio.currentTime);
  const dur = formatTime(audio.duration);
  if (trackMeta) trackMeta.textContent = `${cur} / ${dur}`;

  if (!isSeeking && Number.isFinite(audio.duration) && audio.duration > 0 && seek){
    seek.value = String((audio.currentTime / audio.duration) * 100);
  }

  if (trackList){
    [...trackList.querySelectorAll("li")].forEach(li => {
      li.classList.toggle("active", Number(li.dataset.index) === currentIndex);
    });
  }

  if (playBtn) playBtn.textContent = audio.paused ? "Play" : "Pause";
}

function loadTrack(index, autoplay=false){
  currentIndex = (index + tracks.length) % tracks.length;
  audio.src = tracks[currentIndex].src;
  audio.load();

  if (trackList){
    [...trackList.querySelectorAll("li")].forEach(li => li.classList.remove("showLyrics"));
  }

  updateUI();
  renderTrackList();

  if (autoplay){
    audio.play().catch(() => {});
  }
}

function nextTrack(){ loadTrack(currentIndex + 1, true); }
function prevTrack(){ loadTrack(currentIndex - 1, true); }

playBtn?.addEventListener("click", () => {
  pulse(playerCard);
  miniStarsRandomNear(playerCard, 10);
  maybeTear(playerCard);

  if (!audio.src) loadTrack(currentIndex, false);

  if (audio.paused) audio.play().catch(() => {});
  else audio.pause();
});

nextBtn?.addEventListener("click", () => { nextTrack(); pulse(playerCard); miniStarsRandomNear(playerCard, 10); maybeTear(playerCard); });
prevBtn?.addEventListener("click", () => { prevTrack(); pulse(playerCard); miniStarsRandomNear(playerCard, 10); maybeTear(playerCard); });

audio.addEventListener("timeupdate", updateUI);
audio.addEventListener("loadedmetadata", updateUI);
audio.addEventListener("durationchange", updateUI);
audio.addEventListener("play", updateUI);
audio.addEventListener("pause", updateUI);
audio.addEventListener("ended", () => { nextTrack(); });

/* seek */
seek?.addEventListener("input", () => {
  isSeeking = true;
  pulse(playerCard);
  miniStarsRandomNear(playerCard, 6);
});
seek?.addEventListener("change", () => {
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
  const pct = clamp(Number(seek.value), 0, 100) / 100;
  audio.currentTime = pct * audio.duration;
  isSeeking = false;
  updateUI();
  maybeTear(playerCard);
});

/* volume */
if (volume){
  audio.volume = Number(volume.value);
  volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
    pulse(playerCard);
    miniStarsRandomNear(playerCard, 8);
    maybeTear(playerCard);
  });
}

/* preload durations */
async function preloadDurations(){
  for (const t of tracks){
    if (durationCache.has(t.src)) continue;

    await new Promise((resolve) => {
      const a = new Audio();
      a.preload = "metadata";
      a.src = t.src;

      a.addEventListener("loadedmetadata", () => {
        durationCache.set(t.src, formatTime(a.duration));
        resolve();
      }, { once:true });

      a.addEventListener("error", () => {
        durationCache.set(t.src, "—");
        resolve();
      }, { once:true });
    });
  }
  renderTrackList();
}

/* =========================
   CLICK GLITCH: tiny stars
========================= */
let starCooldown = 0;

function miniStars(x, y, count=12){
  if (!glitchLayer) return;

  const now = Date.now();
  if (now - starCooldown < 30) return;
  starCooldown = now;

  for (let i=0; i<count; i++){
    const el = document.createElement("div");
    el.className = "star";

    const dx = (Math.random()*2-1) * (18 + Math.random()*26);
    const dy = (Math.random()*2-1) * (18 + Math.random()*26);

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty("--dx", `${dx}px`);
    el.style.setProperty("--dy", `${dy}px`);

    glitchLayer.appendChild(el);
    setTimeout(() => el.remove(), 520);
  }
}

function miniStarsRandomNear(targetEl, count=10){
  if (!targetEl) return;
  const r = targetEl.getBoundingClientRect();
  const x = r.left + r.width/2 + (Math.random()*2-1)*18;
  const y = r.top + r.height/2 + (Math.random()*2-1)*18;
  miniStars(x, y, count);
}

document.addEventListener("click", (e) => {
  const sel = window.getSelection?.();
  if (sel && String(sel).length > 0) return;
  miniStars(e.clientX, e.clientY, 10);
}, { passive:true });

let scrollTick = 0;
window.addEventListener("scroll", () => {
  const now = Date.now();
  if (now - scrollTick < 120) return;
  scrollTick = now;

  if (Math.random() < 0.25){
    pulse(playerCard);
    maybeTear(playerCard);
  }
}, { passive:true });

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  applyEnvelope();
  setPlayerOpen(false);

  loadTrack(0, false);
  renderTrackList();
  preloadDurations();
});

window.addEventListener("resize", () => {
  applyEnvelope();
}, { passive:true });
