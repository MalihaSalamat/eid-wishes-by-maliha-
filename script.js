/* ═══════════════════════════════════════════════════════
   script.js  —  Eid Mubarak Greeting Website
   ═══════════════════════════════════════════════════════

   TABLE OF CONTENTS
   -----------------
   1.  buildStarfield()    — create twinkling background stars
   2.  buildFringe()       — create gold fringe drops in valance
   3.  Confetti Engine     — canvas-based falling confetti
   4.  sparkBurst()        — radial sparkle explosion from center
   5.  Music Engine        — Web Audio API chime melody
   6.  addParticles()      — floating gold dots for scene 2
   7.  goToScene2()        — fade transition between scenes
   8.  Master Sequence     — orchestrates the whole timeline

   TIMELINE
   --------
   t = 0 s  → Page loads. Stars twinkle. Curtains are closed.
   t = 5 s  → Curtains slide open.
   t = 5.3s → Crescent moon begins rising.
   t = 5.8s → Greeting text appears + confetti + sparks + music.
   t = 9.8s → Smooth fade to Scene 2 (main greeting page).
═══════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════
   1.  BUILD STARFIELD
       Fills #starfield with randomly sized & timed dots.
       CSS custom properties drive the twinkle animation.
═══════════════════════════════════════════════════════ */
function buildStarfield() {
  const host = document.getElementById('starfield');

  for (let i = 0; i < 240; i++) {
    const star = document.createElement('div');
    star.className = 'star';

    const size = Math.random() * 2.4 + 0.45; // 0.45 – 2.85 px

    star.style.cssText = [
      `left:   ${Math.random() * 100}%`,
      `top:    ${Math.random() * 100}%`,
      `width:  ${size}px`,
      `height: ${size}px`,
      `--d:    ${2 + Math.random() * 4}s`,          // twinkle duration
      `--dl:   ${Math.random() * 7}s`,               // twinkle delay
      `--b:    ${0.28 + Math.random() * 0.72}`,      // peak brightness
    ].join(';');

    host.appendChild(star);
  }
}


/* ═══════════════════════════════════════════════════════
   2.  BUILD FRINGE
       Creates gold fringe drops across the valance bar.
       Count adapts to viewport width.
═══════════════════════════════════════════════════════ */
function buildFringe() {
  const row   = document.getElementById('fringe-row');
  const count = Math.round(window.innerWidth / 34); // ~1 drop per 34 px

  for (let i = 0; i < count; i++) {
    const drop = document.createElement('div');
    drop.className = 'fringe-drop';
    drop.innerHTML = '<div class="fringe-stem"></div><div class="fringe-ball"></div>';
    row.appendChild(drop);
  }
}


/* ═══════════════════════════════════════════════════════
   3.  CONFETTI ENGINE
       Uses an HTML5 Canvas to render falling confetti
       shapes: rectangles, circles, and 5-pointed stars.
═══════════════════════════════════════════════════════ */
const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx    = confettiCanvas.getContext('2d');

let pieces  = [];   // active confetti pieces
let raining = false; // true while confetti is being spawned

/* Match canvas size to viewport */
function resizeCanvas() {
  confettiCanvas.width  = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

/* Confetti colour palette — all bright/saturated on transparent canvas */
const CONFETTI_COLORS = [
  '#ffe899', '#f2c96a',   // gold
  '#ff7eb3', '#c084fc',   // pink / purple
  '#5ee8d4', '#60a5fa',   // teal / blue
  '#34d399', '#f87171',   // green / red
  '#ffffff',              // white
];
const CONFETTI_SHAPES = ['rect', 'circle', 'star'];

/* Confetti piece constructor */
function ConfettiPiece() {
  this.x   = Math.random() * confettiCanvas.width;
  this.y   = -12;                                  // start above viewport
  this.w   = Math.random() * 11 + 5;
  this.h   = Math.random() * 6  + 3;
  this.rot = Math.random() * Math.PI * 2;          // random start rotation
  this.rv  = (Math.random() - 0.5) * 0.18;        // rotation velocity
  this.vx  = (Math.random() - 0.5) * 4;           // horizontal drift
  this.vy  = Math.random() * 2.8 + 1.5;           // downward speed
  this.col = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
  this.shp = CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)];
  this.alpha = 1;
  this.age   = 0;
  this.maxAge = Math.random() * 120 + 80;
}

/* Update position and fade out near end of life */
ConfettiPiece.prototype.tick = function () {
  this.x   += this.vx;
  this.y   += this.vy;
  this.vy  += 0.06;      // gravity
  this.rot += this.rv;
  this.age++;

  // Fade out in the last 30% of life
  if (this.age > this.maxAge * 0.7) {
    this.alpha = 1 - (this.age - this.maxAge * 0.7) / (this.maxAge * 0.3);
  }
};

/* Draw one confetti piece */
ConfettiPiece.prototype.draw = function (c) {
  c.save();
  c.globalAlpha = this.alpha;
  c.translate(this.x, this.y);
  c.rotate(this.rot);
  c.fillStyle = this.col;

  if (this.shp === 'rect') {
    c.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);

  } else if (this.shp === 'circle') {
    c.beginPath();
    c.arc(0, 0, this.w / 2, 0, Math.PI * 2);
    c.fill();

  } else {
    // 5-pointed star
    c.beginPath();
    for (let i = 0; i < 5; i++) {
      const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const innerAngle = outerAngle + 2 * Math.PI / 5;
      if (i === 0) {
        c.moveTo(Math.cos(outerAngle) * this.w / 2, Math.sin(outerAngle) * this.w / 2);
      } else {
        c.lineTo(Math.cos(outerAngle) * this.w / 2, Math.sin(outerAngle) * this.w / 2);
      }
      c.lineTo(Math.cos(innerAngle) * this.w / 4, Math.sin(innerAngle) * this.w / 4);
    }
    c.closePath();
    c.fill();
  }

  c.restore();
};

/* Main animation loop — runs continuously */
let spawnTick = 0;

function confettiLoop() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  // Spawn new pieces every other frame while raining
  if (raining && spawnTick++ % 2 === 0) {
    for (let i = 0; i < 7; i++) {
      pieces.push(new ConfettiPiece());
    }
  }

  // Update, draw, and remove dead/out-of-bounds pieces
  pieces = pieces.filter(p => {
    p.tick();
    p.draw(confettiCtx);
    return p.age < p.maxAge && p.y < confettiCanvas.height + 20;
  });

  requestAnimationFrame(confettiLoop);
}
confettiLoop(); // start immediately

/* Call this to begin a 4.8 s confetti burst */
function launchConfetti() {
  raining = true;
  setTimeout(() => { raining = false; }, 4800);
}


/* ═══════════════════════════════════════════════════════
   4.  SPARKLE BURST
       Creates 60 DOM circles that fly outward from the
       screen centre using CSS animation + custom props.
═══════════════════════════════════════════════════════ */
function sparkBurst() {
  const centerX = window.innerWidth  / 2;
  const centerY = window.innerHeight / 2;

  const SPARK_COLORS = [
    '#ffe899', '#fff9d0', '#f2c96a', '#ffffff',
    '#c084fc', '#60a5fa', '#5ee8d4', '#f87171',
  ];

  for (let i = 0; i < 60; i++) {
    const el    = document.createElement('div');
    el.className = 'spark';

    const angle = Math.random() * Math.PI * 2;
    const dist  = Math.random() * 280 + 60;
    const color = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];
    const size  = Math.random() * 5 + 3;

    el.style.cssText = [
      `left:   ${centerX}px`,
      `top:    ${centerY}px`,
      `width:  ${size}px`,
      `height: ${size}px`,
      `background: ${color}`,
      `box-shadow: 0 0 ${size * 2}px ${color}`,
      `--sd:  ${0.85 + Math.random() * 0.85}s`,         // duration
      `--sdl: ${Math.random() * 0.38}s`,                 // delay
      `--sx:  ${Math.cos(angle) * dist}px`,              // final x offset
      `--sy:  ${Math.sin(angle) * dist}px`,              // final y offset
    ].join(';');

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2400); // clean up after animation
  }
}


/* ═══════════════════════════════════════════════════════
   5.  MUSIC ENGINE  (Web Audio API)
       Plays a looping pentatonic bell-chime melody using
       oscillators with harmonics for a realistic bell tone.
       No external audio files needed.
═══════════════════════════════════════════════════════ */
let audioCtx  = null;
let masterGain = null;
let musicOn   = false;

const musicBtn = document.getElementById('music-btn');

/* Pentatonic melody — frequencies (Hz) and start times (seconds) */
const MELODY_NOTES = [
  { freq: 396, time: 0    },
  { freq: 528, time: 0.44 },
  { freq: 660, time: 0.88 },
  { freq: 792, time: 1.36 },
  { freq: 660, time: 2.1  },
  { freq: 528, time: 2.9  },
  { freq: 440, time: 3.7  },
  { freq: 528, time: 4.65 },
  { freq: 660, time: 5.55 },
  { freq: 792, time: 6.45 },
  { freq: 880, time: 7.4  },
  { freq: 792, time: 8.35 },
  { freq: 660, time: 9.2  },
  { freq: 528, time: 10.1 },
  { freq: 396, time: 11.0 },
];
const LOOP_DURATION = 14; // seconds per melody loop

/* Play a single bell note with harmonics */
function playNote(freq, startTime, duration, gain) {
  if (!audioCtx || audioCtx.state === 'closed') return;

  // Fundamental + 2 overtones → warm bell quality
  [1, 2.76, 5.4].forEach((multiplier, index) => {
    const osc = audioCtx.createOscillator();
    const gn  = audioCtx.createGain();

    // Harmonics are quieter than fundamental
    const gainValue = (gain / (index + 1)) * (index === 0 ? 1 : 0.34);

    osc.type = 'sine';
    osc.frequency.value = freq * multiplier;

    // Quick attack, long decay — classic bell envelope
    gn.gain.setValueAtTime(0, startTime);
    gn.gain.linearRampToValueAtTime(gainValue, startTime + 0.03);
    gn.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * (index === 0 ? 1 : 0.48));

    osc.connect(gn);
    gn.connect(masterGain);
    osc.start(startTime);
    osc.stop(startTime + duration);
  });
}

/* Schedule one full loop of the melody */
function scheduleMelodyLoop(offset) {
  if (!musicOn) return;

  // Schedule all melody notes
  MELODY_NOTES.forEach(({ freq, time }) => {
    playNote(freq, offset + time, 1.75, 0.145);
  });

  // Ambient bass drone underneath
  const drone     = audioCtx.createOscillator();
  const droneGain = audioCtx.createGain();

  drone.type = 'sine';
  drone.frequency.value = 110; // bass A

  droneGain.gain.setValueAtTime(0,      offset);
  droneGain.gain.linearRampToValueAtTime(0.034, offset + 1.2);
  droneGain.gain.linearRampToValueAtTime(0.034, offset + LOOP_DURATION - 1.2);
  droneGain.gain.linearRampToValueAtTime(0,     offset + LOOP_DURATION);

  drone.connect(droneGain);
  droneGain.connect(masterGain);
  drone.start(offset);
  drone.stop(offset + LOOP_DURATION);

  // Queue the next loop 0.5 s before this one ends
  setTimeout(() => {
    if (musicOn) scheduleMelodyLoop(audioCtx.currentTime + 0.05);
  }, (LOOP_DURATION - 0.5) * 1000);
}

/* Start playing music */
function startMusic() {
  if (!audioCtx) {
    audioCtx   = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.55;
    masterGain.connect(audioCtx.destination);
  } else {
    audioCtx.resume();
  }
  musicOn = true;
  scheduleMelodyLoop(audioCtx.currentTime + 0.1);
}

/* Pause music */
function stopMusic() {
  if (audioCtx) audioCtx.suspend();
  musicOn = false;
}

/* Music button toggle */
musicBtn.addEventListener('click', () => {
  if (musicOn) {
    stopMusic();
    musicBtn.textContent = '🔇';
  } else {
    startMusic();
    musicBtn.textContent = '🔊';
  }
});


/* ═══════════════════════════════════════════════════════
   6.  ADD FLOATING PARTICLES  (Scene 2)
       Injects softly glowing dots that drift upward to
       create atmosphere on the main greeting page.
═══════════════════════════════════════════════════════ */
function addParticles() {
  const host   = document.getElementById('scene2');
  const colors = ['#f2c96a', '#fff9d0', '#c9913a', '#ffe090', '#ffffff'];

  for (let i = 0; i < 30; i++) {
    const p    = document.createElement('div');
    p.className = 'fp';

    const size = Math.random() * 4.5 + 2;

    p.style.cssText = [
      `left:    ${5 + Math.random() * 90}%`,
      `bottom:  ${4 + Math.random() * 28}%`,
      `width:   ${size}px`,
      `height:  ${size}px`,
      `background: ${colors[Math.floor(Math.random() * colors.length)]}`,
      `--fpd:  ${5 + Math.random() * 6}s`,     // float duration
      `--fpdl: ${Math.random() * 5}s`,          // float delay
    ].join(';');

    host.appendChild(p);
  }
}


/* ═══════════════════════════════════════════════════════
   7.  SCENE TRANSITION
       Fades out Scene 1 then fades in Scene 2.
       Double requestAnimationFrame ensures CSS display
       change is painted before opacity transition starts.
═══════════════════════════════════════════════════════ */
function goToScene2() {
  const scene1 = document.getElementById('scene1');
  const scene2 = document.getElementById('scene2');

  // Fade out scene 1
  scene1.style.transition = 'opacity 1.6s ease';
  scene1.style.opacity    = '0';

  setTimeout(() => {
    scene1.classList.add('gone'); // display:none

    addParticles();               // inject ambient particles into scene 2

    scene2.style.display = 'flex';

    // Wait for browser to paint display:flex before triggering opacity
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scene2.classList.add('visible');
      });
    });
  }, 1600);
}


/* ═══════════════════════════════════════════════════════
   8.  MASTER SEQUENCE
       Orchestrates the full opening animation timeline.
═══════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {

  // Build static elements on load
  buildStarfield();
  buildFringe();

  /*
    t = 5 000 ms  →  Curtains slide open
  */
  setTimeout(() => {

    document.getElementById('cLeft').classList.add('open');
    document.getElementById('cRight').classList.add('open');

    /*
      t = 5 300 ms  →  Crescent moon begins to rise
    */
    setTimeout(() => {
      document.getElementById('moonShell').classList.add('risen');
    }, 300);

    /*
      t = 5 800 ms  →  Greeting text fades in
                        + confetti launches
                        + sparkle burst fires
                        + chime music starts
    */
    setTimeout(() => {
      document.getElementById('greetingReveal').classList.add('show');
      startMusic();
      launchConfetti();
      sparkBurst();
    }, 800);

    /*
      t = 9 800 ms  →  Smooth fade transition to Scene 2
    */
    setTimeout(goToScene2, 4800);

  }, 5000); // ← 5-second wait before curtains open

});
