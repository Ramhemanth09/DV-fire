/**
 * SHADOW ISLAND - 3D Tactical Battle Royale Offline Prototype
 * Virtual Touch Joystick & Realistic Human 3D Characters Edition:
 * - 360° Virtual Touch Joystick with touch/mouse drag for mobile phone and desktop.
 * - Anatomically realistic, articulated 3D human soldiers with helmets, vests, comms, gloves, combat boots.
 * - Natural walking/running leg stride animations and idle breathing sway.
 * - Progressive threat escalation & multi-bot survival loop.
 */

// =========================================================
// 1. PROCEDURAL SOUND SYNTHESIZER (Web Audio API)
// =========================================================
class TacticalAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playGunshot(isPlayer = true, distance = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const vol = isPlayer ? 1.0 : Math.max(0.08, 1.0 - (distance / 70));

    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(isPlayer ? 1800 : 1200, t);
    noiseFilter.Q.setValueAtTime(1.5, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.8 * vol, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(t);

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.14);

    oscGain.gain.setValueAtTime(0.9 * vol, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  playHitSound(isHeadshot = false) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isHeadshot ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(isHeadshot ? 1600 : 850, t);
    osc.frequency.exponentialRampToValueAtTime(isHeadshot ? 2400 : 400, t + 0.06);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  playReload() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.playClick(t, 600, 0.03);
    this.playClick(t + 0.6, 900, 0.04);
    this.playClick(t + 1.2, 1400, 0.05);
  }

  playClick(time, freq, dur) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + dur);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + dur + 0.01);
  }

  playZoneAlert() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.linearRampToValueAtTime(880, t + 0.4);
    osc.frequency.linearRampToValueAtTime(440, t + 0.8);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.9);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.95);
  }

  playFootstep() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.04);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  playJump() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(260, t + 0.12);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  playRadioSquelch() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1100, t);
    osc.frequency.setValueAtTime(1800, t + 0.04);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  playHeal() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.linearRampToValueAtTime(640, t + 0.3);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.4);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.45);
  }

  playExplosion() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 0.6);
    gain.gain.setValueAtTime(1.0, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.7);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.75);

    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.9, t);
    nGain.gain.exponentialRampToValueAtTime(0.01, t + 0.55);
    noise.connect(nGain);
    nGain.connect(this.masterGain);
    noise.start(t);
  }
}

const audio = new TacticalAudioEngine();

// =========================================================
// 2. CHARACTER & BOT DATABASE
// =========================================================
const OPERATORS = {
  raven: {
    name: 'RAVEN',
    title: 'TACTICAL SCOUT SPECIALIST',
    lore: 'Ex-recon operative equipped with shadow optics and stealth dampers for high mobility and rapid flanking.',
    stats: { speed: 88, defense: 62, attack: 78, ability: 90 },
    ability: { name: 'SHADOW SENSE (PASSIVE)', desc: 'Highlights audio footstep waves from enemies within 35 meters on the compass.' },
    shirtColor: 0x1e293b,
    vestColor: 0x0f172a,
    pantsColor: 0x334155,
    accentColor: 0xFFD400
  },
  nova: {
    name: 'NOVA',
    title: 'VANGUARD ENFORCER',
    lore: 'Heavy assault unit with deployable kinetic barrier shielding to absorb high-caliber incoming fire.',
    stats: { speed: 65, defense: 95, attack: 70, ability: 80 },
    ability: { name: 'KINETIC BARRIER', desc: 'Reduces frontal bullet damage by 40% when crouched or stationary.' },
    shirtColor: 0x064e3b,
    vestColor: 0x022c22,
    pantsColor: 0x0f766e,
    accentColor: 0x34d399
  },
  zayn: {
    name: 'ZAYN',
    title: 'CQC DUELIST',
    lore: 'Aggressive breacher who gains an adrenaline burst of reload speed and sprint velocity on eliminating an opponent.',
    stats: { speed: 94, defense: 55, attack: 85, ability: 75 },
    ability: { name: 'ADRENALINE OVERDRIVE', desc: 'Instantly grants 35% sprint boost and rapid reload upon landing a takedown.' },
    shirtColor: 0x78350f,
    vestColor: 0x451a03,
    pantsColor: 0x92400e,
    accentColor: 0xfbbf24
  },
  titan: {
    name: 'TITAN',
    title: 'JUGGERNAUT DEFENDER',
    lore: 'Reinforced ballistic juggernaut built to hold contested strongholds and military dropzones.',
    stats: { speed: 50, defense: 100, attack: 82, ability: 65 },
    ability: { name: 'FORTIFIED PLATING', desc: 'Armor durability degrades 30% slower during active fire exchanges.' },
    shirtColor: 0x334155,
    vestColor: 0x1e293b,
    pantsColor: 0x475569,
    accentColor: 0x94a3b8
  },
  arrow: {
    name: 'ARROW',
    title: 'APEX MARKSMAN',
    lore: 'Long-range designated marksman with unmatched accuracy stabilization and enhanced critical multipliers.',
    stats: { speed: 75, defense: 60, attack: 96, ability: 85 },
    ability: { name: 'EAGLE EYE (PASSIVE)', desc: 'Eliminates weapon sway and increases headshot damage multiplier to 2.5x.' },
    shirtColor: 0x881337,
    vestColor: 0x4c0519,
    pantsColor: 0x9f1239,
    accentColor: 0xf43f5e
  }
};

const BOT_ROSTER = [
  { name: 'Scout_Recruit', shirtColor: 0x334155, vestColor: 0x1e293b, pantsColor: 0x475569, accentColor: 0x94a3b8 },
  { name: 'Rookie_Guard', shirtColor: 0x1e3a8a, vestColor: 0x172554, pantsColor: 0x1e40af, accentColor: 0x60a5fa },
  { name: 'Patrol_Unit', shirtColor: 0x065f46, vestColor: 0x022c22, pantsColor: 0x047857, accentColor: 0x34d399 },
  { name: 'Vanguard_Trooper', shirtColor: 0x7c2d12, vestColor: 0x431407, pantsColor: 0x9a3412, accentColor: 0xfb923c },
  { name: 'Apex_Hunter', shirtColor: 0x831843, vestColor: 0x500724, pantsColor: 0x9d174d, accentColor: 0xf472b6 },
  { name: 'Ghost_Recon', shirtColor: 0x1f2937, vestColor: 0x111827, pantsColor: 0x374151, accentColor: 0xef4444 },
  { name: 'Viper_AI', shirtColor: 0x7f1d1d, vestColor: 0x450a0a, pantsColor: 0x991b1b, accentColor: 0xf87171 }
];

const BOT_SPAWN_LOCATIONS = [
  { x: 18, z: -25 },
  { x: -22, z: 15 },
  { x: -20, z: -18 },
  { x: 0, z: -28 },
  { x: 25, z: 10 },
  { x: -25, z: -5 },
  { x: 15, z: 30 },
  { x: -10, z: 24 }
];

const SHOUT_LINES = [
  'ENEMY SPOTTED AT 210! ENGAGING TARGET!',
  'COVER ME! RELOADING MY PRIMARY!',
  'PUSHING FLANK ROUTE! MOVE MOVE MOVE!',
  'HOSTILE SUPPRESSION! GET BEHIND COVER!',
  'I NEED BACKUP AT THE MILITARY HANGAR!',
  'ZONE IS CLOSING IN! ROTATE TO THE CIRCLE!'
];
let shoutIndex = 0;

let currentOperator = 'raven';
let currentDifficulty = 'Normal';

// =========================================================
// 3. UI SCREEN MANAGEMENT & ROUTING
// =========================================================
const UI = {
  screens: {
    home: document.getElementById('screen-home'),
    mainMenu: document.getElementById('screen-main-menu'),
    modes: document.getElementById('screen-modes'),
    character: document.getElementById('screen-character'),
    inventory: document.getElementById('screen-inventory'),
    aircraft: document.getElementById('screen-aircraft'),
    parachute: document.getElementById('screen-parachute'),
    gameHud: document.getElementById('screen-game-hud'),
    result: document.getElementById('screen-result')
  },

  showScreen(name) {
    Object.values(this.screens).forEach(el => el.classList.remove('active'));
    if (this.screens[name]) {
      this.screens[name].classList.add('active');
    }
  },

  initListeners() {
    document.getElementById('btn-home-play').addEventListener('click', () => {
      audio.init();
      UI.showScreen('mainMenu');
    });

    document.getElementById('btn-home-trailer').addEventListener('click', () => {
      audio.init();
      UI.showScreen('modes');
    });

    document.querySelectorAll('.tactical-sidebar .nav-item[data-nav]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-nav');
        document.querySelectorAll('.tactical-sidebar .nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (target === 'play') UI.showScreen('mainMenu');
        else if (target === 'character') UI.showScreen('character');
        else if (target === 'weapons' || target === 'inventory') UI.showScreen('inventory');
        else if (target === 'modes') UI.showScreen('modes');
      });
    });

    document.getElementById('btn-back-landing').addEventListener('click', () => {
      UI.showScreen('home');
    });

    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        UI.showScreen('mainMenu');
      });
    });

    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDifficulty = btn.getAttribute('data-diff');
        document.getElementById('current-diff-display').textContent = currentDifficulty.toUpperCase();
      });
    });

    document.querySelectorAll('.char-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.char-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const charKey = card.getAttribute('data-char');
        currentOperator = charKey;
        const op = OPERATORS[charKey];

        document.getElementById('detail-char-name').textContent = op.name;
        document.getElementById('detail-char-title').textContent = op.title;
        document.getElementById('detail-char-desc').textContent = op.lore;
        document.getElementById('stat-speed').style.width = op.stats.speed + '%';
        document.getElementById('stat-defense').style.width = op.stats.defense + '%';
        document.getElementById('stat-attack').style.width = op.stats.attack + '%';
        document.getElementById('stat-ability').style.width = op.stats.ability + '%';
        document.getElementById('detail-ability-name').textContent = op.ability.name;
        document.getElementById('detail-ability-desc').textContent = op.ability.desc;
      });
    });

    document.getElementById('btn-select-operator').addEventListener('click', () => {
      UI.showScreen('mainMenu');
    });

    document.getElementById('btn-start-match').addEventListener('click', () => {
      startMatchDropSequence();
    });

    document.getElementById('btn-jump-action').addEventListener('click', () => {
      executeAircraftJump();
    });

    document.getElementById('btn-result-play-again').addEventListener('click', () => {
      startMatchDropSequence();
    });

    document.getElementById('btn-result-menu').addEventListener('click', () => {
      UI.showScreen('mainMenu');
      game.resetToLobby();
    });

    // Action Buttons
    document.getElementById('btn-action-shout').addEventListener('click', () => triggerTacticalShout());
    document.getElementById('btn-action-heal').addEventListener('click', () => triggerPlayerHeal());
    document.getElementById('btn-action-grenade').addEventListener('click', () => triggerThrowGrenade());

    const btnJump = document.getElementById('btn-touch-jump');
    btnJump.addEventListener('click', () => triggerPlayerJump());

    const btnCrouch = document.getElementById('btn-touch-crouch');
    btnCrouch.addEventListener('click', () => {
      game.player.isCrouched = !game.player.isCrouched;
      btnCrouch.classList.toggle('active', game.player.isCrouched);
    });

    const btnRun = document.getElementById('btn-touch-run');
    btnRun.addEventListener('click', () => {
      game.player.isSprinting = !game.player.isSprinting;
      btnRun.classList.toggle('active', game.player.isSprinting);
    });

    const btnADS = document.getElementById('btn-touch-ads');
    btnADS.addEventListener('click', () => {
      game.mouse.isADS = !game.mouse.isADS;
      btnADS.classList.toggle('active', game.mouse.isADS);
      document.getElementById('ads-vignette').classList.toggle('active', game.mouse.isADS);
    });

    const btnFire = document.getElementById('btn-touch-fire');
    const startFire = (e) => { e.preventDefault(); game.mouse.isShooting = true; };
    const endFire = (e) => { e.preventDefault(); game.mouse.isShooting = false; };
    btnFire.addEventListener('mousedown', startFire);
    btnFire.addEventListener('mouseup', endFire);
    btnFire.addEventListener('touchstart', startFire);
    btnFire.addEventListener('touchend', endFire);

    document.getElementById('btn-touch-reload').addEventListener('click', () => {
      if (game.matchActive && !game.player.isReloading) {
        game.reloadPlayerWeapon();
      }
    });

    // Initialize Virtual Touch Joystick
    initVirtualJoystick();
  }
};

// =========================================================
// VIRTUAL TOUCH JOYSTICK CONTROLLER
// =========================================================
let joystickInput = { x: 0, y: 0 };
let isJoystickActive = false;

function initVirtualJoystick() {
  const zone = document.getElementById('joystick-zone');
  const base = document.getElementById('joystick-base');
  const knob = document.getElementById('joystick-knob');
  if (!zone || !base || !knob) return;

  const maxRadius = 40; // Max knob displacement
  let startX = 0;
  let startY = 0;

  const handlePointerDown = (clientX, clientY) => {
    isJoystickActive = true;
    base.classList.add('active');
    const rect = base.getBoundingClientRect();
    startX = rect.left + rect.width / 2;
    startY = rect.top + rect.height / 2;
    handlePointerMove(clientX, clientY);
  };

  const handlePointerMove = (clientX, clientY) => {
    if (!isJoystickActive) return;
    const dx = clientX - startX;
    const dy = clientY - startY;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    knob.style.transform = `translate(${knobX}px, ${knobY}px)`;

    // Normalized input (-1 to 1)
    joystickInput.x = knobX / maxRadius;
    joystickInput.y = knobY / maxRadius;
  };

  const handlePointerUp = () => {
    isJoystickActive = false;
    base.classList.remove('active');
    knob.style.transform = 'translate(0px, 0px)';
    joystickInput.x = 0;
    joystickInput.y = 0;
  };

  // Touch Events
  zone.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handlePointerDown(touch.clientX, touch.clientY);
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    if (!isJoystickActive) return;
    e.preventDefault();
    const touch = e.touches[0];
    handlePointerMove(touch.clientX, touch.clientY);
  }, { passive: false });

  window.addEventListener('touchend', handlePointerUp);
  window.addEventListener('touchcancel', handlePointerUp);

  // Mouse Events for Desktop Drag
  zone.addEventListener('mousedown', (e) => {
    e.preventDefault();
    handlePointerDown(e.clientX, e.clientY);
  });

  window.addEventListener('mousemove', (e) => {
    if (!isJoystickActive) return;
    handlePointerMove(e.clientX, e.clientY);
  });

  window.addEventListener('mouseup', () => {
    if (isJoystickActive) handlePointerUp();
  });
}

// =========================================================
// 4. REALISTIC HUMAN 3D CHARACTER BUILDER
// =========================================================
function createRealisticHumanSoldier(customSkin = null, isPlayer = false) {
  const root = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.6 }); // Caucasian / Natural human skin
  const shirtMat = new THREE.MeshStandardMaterial({ color: customSkin?.shirtColor || 0x1e293b, roughness: 0.7 });
  const vestMat = new THREE.MeshStandardMaterial({ color: customSkin?.vestColor || 0x0f172a, roughness: 0.5, metalness: 0.2 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: customSkin?.pantsColor || 0x334155, roughness: 0.8 });
  const helmetMat = new THREE.MeshStandardMaterial({ color: customSkin?.vestColor || 0x1e293b, roughness: 0.4, metalness: 0.3 });
  const bootMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.5 });
  const gloveMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.6 });
  const accentMat = new THREE.MeshStandardMaterial({ color: customSkin?.accentColor || 0xFFD400, roughness: 0.3 });

  // 1. Torso & Molle Plate Carrier Vest
  const torsoGroup = new THREE.Group();
  
  // Upper body chest
  const chestMesh = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.75, 0.38), shirtMat);
  chestMesh.position.y = 1.25;
  chestMesh.castShadow = true;
  torsoGroup.add(chestMesh);

  // Heavy Tactical Plate Carrier Vest
  const vestMesh = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.60, 0.44), vestMat);
  vestMesh.position.y = 1.25;
  vestMesh.castShadow = true;
  torsoGroup.add(vestMesh);

  // Molle Mag Pouches on Chest
  for (let i = -1; i <= 1; i++) {
    const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.22, 0.12), vestMat);
    pouch.position.set(i * 0.18, 1.15, 0.26);
    pouch.castShadow = true;
    torsoGroup.add(pouch);
  }

  // Tactical Harness Straps
  const strap = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.62, 0.46), accentMat);
  strap.position.set(0.18, 1.25, 0);
  torsoGroup.add(strap);

  // Tactical Backpack on Back
  const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.55, 0.24), vestMat);
  backpack.position.set(0, 1.25, -0.30);
  backpack.castShadow = true;
  torsoGroup.add(backpack);

  root.add(torsoGroup);
  root.torsoGroup = torsoGroup;

  // 2. Head, Face & Ballistic Helmet
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.68, 0);

  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.18, 8), skinMat);
  neck.position.y = 0.08;
  headGroup.add(neck);

  // Human Head / Face Shape
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.36, 0.34), skinMat);
  face.position.y = 0.25;
  face.castShadow = true;
  headGroup.add(face);

  // Tactical Balaclava / Visor
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.08), accentMat);
  visor.position.set(0, 0.28, 0.16);
  headGroup.add(visor);

  // FAST Ballistic Tactical Helmet
  const helmet = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.22, 0.40), helmetMat);
  helmet.position.set(0, 0.36, -0.02);
  helmet.castShadow = true;
  headGroup.add(helmet);

  // Night Vision Goggles Mount on Front
  const nvgMount = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.10, 0.08), bootMat);
  nvgMount.position.set(0, 0.40, 0.19);
  headGroup.add(nvgMount);

  // Comms Headset / Earmuffs
  const earL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.12), bootMat);
  earL.position.set(-0.19, 0.28, 0);
  const earR = earL.clone();
  earR.position.x = 0.19;
  headGroup.add(earL);
  headGroup.add(earR);

  root.add(headGroup);
  root.headGroup = headGroup;

  // 3. Articulated Arms & Gloved Hands
  // Left Arm (Shoulder, Arm, Glove)
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.42, 1.55, 0);
  const leftUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.38, 8), shirtMat);
  leftUpper.position.y = -0.19;
  leftUpper.castShadow = true;
  leftArm.add(leftUpper);
  const leftGlove = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.14), gloveMat);
  leftGlove.position.set(0.15, -0.36, 0.32);
  leftArm.add(leftGlove);
  root.add(leftArm);
  root.leftArm = leftArm;

  // Right Arm (Weapon holding trigger arm)
  const rightArm = new THREE.Group();
  rightArm.position.set(0.42, 1.55, 0);
  const rightUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.38, 8), shirtMat);
  rightUpper.position.y = -0.19;
  rightUpper.castShadow = true;
  rightArm.add(rightUpper);
  const rightGlove = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.14), gloveMat);
  rightGlove.position.set(-0.05, -0.32, 0.26);
  rightArm.add(rightGlove);
  root.add(rightArm);
  root.rightArm = rightArm;

  // 4. M4A1 Tactical Rifle attached to right hand
  const gunMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.85, roughness: 0.3 });
  const gunGroup = new THREE.Group();
  const gunBody = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.18, 1.15), gunMat);
  gunBody.position.set(0.24, 1.28, 0.45);
  gunBody.castShadow = true;
  gunGroup.add(gunBody);

  // Gun Mag
  const gunMag = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.14), bootMat);
  gunMag.position.set(0.24, 1.15, 0.38);
  gunGroup.add(gunMag);

  // Gun Scope / Red Dot Optic
  const gunScope = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.10, 0.22), accentMat);
  gunScope.position.set(0.24, 1.40, 0.35);
  gunGroup.add(gunScope);

  root.add(gunGroup);
  root.gunGroup = gunGroup;

  // 5. Hips, Pelvis & Utility Belt
  const hips = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.22, 0.34), pantsMat);
  hips.position.y = 0.88;
  hips.castShadow = true;
  root.add(hips);

  // Sidearm Pistol Holster
  const holster = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.20, 0.14), bootMat);
  holster.position.set(0.34, 0.82, 0);
  root.add(holster);

  // 6. Left & Right Articulated Legs (Thighs, Knees, Combat Boots)
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.20, 0.82, 0);
  const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.44, 8), pantsMat);
  leftThigh.position.y = -0.22;
  leftThigh.castShadow = true;
  leftLeg.add(leftThigh);
  const leftKnee = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.08), bootMat);
  leftKnee.position.set(0, -0.42, 0.08);
  leftLeg.add(leftKnee);
  const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.36, 0.24), bootMat);
  leftBoot.position.set(0, -0.62, 0.04);
  leftBoot.castShadow = true;
  leftLeg.add(leftBoot);
  root.add(leftLeg);
  root.leftLeg = leftLeg;

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.20, 0.82, 0);
  const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.44, 8), pantsMat);
  rightThigh.position.y = -0.22;
  rightThigh.castShadow = true;
  rightLeg.add(rightThigh);
  const rightKnee = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.08), bootMat);
  rightKnee.position.set(0, -0.42, 0.08);
  rightLeg.add(rightKnee);
  const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.36, 0.24), bootMat);
  rightBoot.position.set(0, -0.62, 0.04);
  rightBoot.castShadow = true;
  rightLeg.add(rightBoot);
  root.add(rightLeg);
  root.rightLeg = rightLeg;

  root.stridePhase = 0;
  return root;
}

// =========================================================
// 5. 3D GAME ENGINE & PROGRESSIVE AI SYSTEM
// =========================================================
class ShadowIslandGame {
  constructor() {
    this.canvas = document.getElementById('three-canvas');
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    
    // Entities & Physics
    this.player = null;
    this.bots = [];
    this.obstacles = [];
    this.tracers = [];
    this.grenades = [];
    this.safeZone = null;
    
    // Match State
    this.matchActive = false;
    this.matchPhase = 'LOBBY';
    this.aliveCount = 50;
    this.playerKills = 0;
    this.matchDamage = 0;
    this.matchStartTime = 0;
    this.zoneRadius = 90;
    this.zoneTimeLeft = 105;
    this.maxActiveBots = 4;
    this.currentTierIndex = 1;

    // Controls
    this.keys = {};
    this.mouse = { x: 0, y: 0, isLocked: false, isADS: false, isShooting: false };
    this.cameraYaw = 0;
    this.cameraPitch = 0;

    this.init3DScene();
    this.initEventListeners();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  init3DScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xd97736);
    this.scene.fog = new THREE.FogExp2(0xc4682c, 0.012);

    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 5, 10);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.setupLighting();
    this.buildTacticalEnvironment();
    this.createSafeZone();
    this.createPlayerEntity();
  }

  setupLighting() {
    const ambient = new THREE.AmbientLight(0xffeedd, 0.65);
    this.scene.add(ambient);

    const sunLight = new THREE.DirectionalLight(0xffaa44, 1.4);
    sunLight.position.set(60, 80, -50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    this.scene.add(sunLight);

    const seaFill = new THREE.DirectionalLight(0x38bdf8, 0.35);
    seaFill.position.set(-50, 20, 50);
    this.scene.add(seaFill);
  }

  buildTacticalEnvironment() {
    const groundGeo = new THREE.PlaneGeometry(240, 240, 48, 48);
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = Math.sin(x * 0.05) * Math.cos(y * 0.05) * 1.8;
      pos.setZ(i, z);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({ color: 0x3d6628, roughness: 0.85, metalness: 0.1 });
    const terrain = new THREE.Mesh(groundGeo, groundMat);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    this.scene.add(terrain);

    const concreteGeo = new THREE.PlaneGeometry(70, 70);
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });
    const tarmac = new THREE.Mesh(concreteGeo, concreteMat);
    tarmac.rotation.x = -Math.PI / 2;
    tarmac.position.set(0, 0.05, 0);
    tarmac.receiveShadow = true;
    this.scene.add(tarmac);

    this.buildMilitaryHangar(18, 0, -25);
    this.buildWatchtower(-22, 0, 15);
    this.buildTacticalBunker(-20, 0, -18);

    this.createCoverBarrier(0, 0, -10, 8, 1.4, 0.8, 0);
    this.createCoverBarrier(-8, 0, 4, 6, 1.4, 0.8, Math.PI / 4);
    this.createCoverBarrier(10, 0, 8, 6, 1.4, 0.8, -Math.PI / 6);
    this.createCoverBarrier(0, 0, 16, 10, 1.4, 0.8, 0);

    this.createSupplyCrate(5, 0, -5, 0x1e3a8a);
    this.createSupplyCrate(-6, 0, -8, 0xb45309);
    this.createSupplyCrate(12, 0, 4, 0x065f46);
    this.createOilDrum(6.5, 0, -4.5);
    this.createOilDrum(7.2, 0, -4.8);

    for (let i = 0; i < 30; i++) {
      const tx = (Math.random() - 0.5) * 180;
      const tz = (Math.random() - 0.5) * 180;
      if (Math.hypot(tx, tz) > 28) {
        this.createPineTree(tx, 0, tz);
      }
    }
  }

  buildMilitaryHangar(x, y, z) {
    const group = new THREE.Group();
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5, metalness: 0.3 });

    const wall1 = new THREE.Mesh(new THREE.BoxGeometry(1, 7, 24), wallMat);
    wall1.position.set(-10, 3.5, 0);
    wall1.castShadow = true;
    group.add(wall1);

    const wall2 = new THREE.Mesh(new THREE.BoxGeometry(1, 7, 24), wallMat);
    wall2.position.set(10, 3.5, 0);
    wall2.castShadow = true;
    group.add(wall2);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(20, 7, 1), wallMat);
    backWall.position.set(0, 3.5, -12);
    backWall.castShadow = true;
    group.add(backWall);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(22, 1, 26), roofMat);
    roof.position.set(0, 7.5, 0);
    roof.castShadow = true;
    group.add(roof);

    group.position.set(x, y, z);
    this.scene.add(group);
    this.obstacles.push({ x, z, radius: 12 });
  }

  buildWatchtower(x, y, z) {
    const group = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 });
    for (let dx of [-2, 2]) {
      for (let dz of [-2, 2]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 10), metalMat);
        leg.position.set(dx, 5, dz);
        leg.castShadow = true;
        group.add(leg);
      }
    }
    const plat = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 6), metalMat);
    plat.position.set(0, 10, 0);
    plat.castShadow = true;
    group.add(plat);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 5), new THREE.MeshStandardMaterial({ color: 0x475569 }));
    cabin.position.set(0, 11.5, 0);
    cabin.castShadow = true;
    group.add(cabin);

    group.position.set(x, y, z);
    this.scene.add(group);
    this.obstacles.push({ x, z, radius: 4 });
  }

  buildTacticalBunker(x, y, z) {
    const mat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
    const bunker = new THREE.Mesh(new THREE.BoxGeometry(12, 4, 10), mat);
    bunker.position.set(x, 2, z);
    bunker.castShadow = true;
    this.scene.add(bunker);
    this.obstacles.push({ x, z, radius: 6 });
  }

  createCoverBarrier(x, y, z, w, h, d, rotY) {
    const mat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });
    const barrier = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    barrier.position.set(x, h / 2, z);
    barrier.rotation.y = rotY;
    barrier.castShadow = true;
    this.scene.add(barrier);
    this.obstacles.push({ x, z, radius: w / 2 });
  }

  createSupplyCrate(x, y, z, color) {
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.2 });
    const crate = new THREE.Mesh(new THREE.BoxGeometry(2, 1.8, 2), mat);
    crate.position.set(x, 0.9, z);
    crate.castShadow = true;
    this.scene.add(crate);
    this.obstacles.push({ x, z, radius: 1.5 });
  }

  createOilDrum(x, y, z) {
    const mat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.4, roughness: 0.4 });
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.6, 12), mat);
    drum.position.set(x, 0.8, z);
    drum.castShadow = true;
    this.scene.add(drum);
  }

  createPineTree(x, y, z) {
    const group = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 3, 8), trunkMat);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    group.add(trunk);

    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.8 });
    for (let i = 0; i < 3; i++) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(2.8 - i * 0.6, 2.5, 8), foliageMat);
      cone.position.y = 3.2 + i * 1.5;
      cone.castShadow = true;
      group.add(cone);
    }
    group.position.set(x, y, z);
    this.scene.add(group);
  }

  createSafeZone() {
    const zoneGeo = new THREE.CylinderGeometry(this.zoneRadius, this.zoneRadius, 60, 48, 1, true);
    const zoneMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide
    });
    this.safeZone = new THREE.Mesh(zoneGeo, zoneMat);
    this.safeZone.position.set(0, 30, 0);
    this.scene.add(this.safeZone);
  }

  createPlayerEntity() {
    const op = OPERATORS[currentOperator] || OPERATORS.raven;
    const humanMesh = createRealisticHumanSoldier(op, true);

    this.player = {
      mesh: humanMesh,
      position: new THREE.Vector3(0, 0, 18),
      velocity: new THREE.Vector3(),
      health: 100,
      maxHealth: 100,
      armor: 100,
      isGrounded: true,
      isCrouched: false,
      isSprinting: false,
      isJumping: false,
      verticalVelocity: 0,
      gravity: -22.0,
      jumpSpeed: 8.2,
      magazineAmmo: 30,
      reserveAmmo: 180,
      maxMag: 30,
      isReloading: false,
      nextFireTime: 0,
      fireRate: 0.088,
      isDead: false
    };

    this.player.mesh.position.copy(this.player.position);
    this.scene.add(this.player.mesh);
  }

  getThreatProfile() {
    if (this.playerKills < 4) {
      return {
        tier: 1,
        tierName: 'RECRUIT (TIER 1)',
        tierClass: 'text-success',
        icon: '🛡️',
        reactionDelay: 1.5,
        accuracy: 0.18,
        spread: 0.22,
        damagePerShot: 5,
        burstCooldown: 1.8,
        maxAttackers: 1
      };
    } else if (this.playerKills < 9) {
      return {
        tier: 2,
        tierName: 'VETERAN (TIER 2)',
        tierClass: 'text-yellow',
        icon: '⚔️',
        reactionDelay: 0.85,
        accuracy: 0.35,
        spread: 0.14,
        damagePerShot: 8,
        burstCooldown: 1.2,
        maxAttackers: 2
      };
    } else if (this.playerKills < 16) {
      return {
        tier: 3,
        tierName: 'SPECOPS (TIER 3)',
        tierClass: 'text-warning',
        icon: '🔥',
        reactionDelay: 0.5,
        accuracy: 0.55,
        spread: 0.08,
        damagePerShot: 12,
        burstCooldown: 0.7,
        maxAttackers: 2
      };
    } else {
      return {
        tier: 4,
        tierName: 'APEX ELITE (TIER 4)',
        tierClass: 'text-danger',
        icon: '💀',
        reactionDelay: 0.25,
        accuracy: 0.75,
        spread: 0.04,
        damagePerShot: 16,
        burstCooldown: 0.4,
        maxAttackers: 3
      };
    }
  }

  updateThreatBadge() {
    const profile = this.getThreatProfile();
    const threatEl = document.getElementById('hud-threat-level');
    const iconEl = document.getElementById('threat-icon');
    if (threatEl) {
      threatEl.textContent = profile.tierName;
      threatEl.className = profile.tierClass;
    }
    if (iconEl) iconEl.textContent = profile.icon;

    if (profile.tier > this.currentTierIndex) {
      this.currentTierIndex = profile.tier;
      audio.playZoneAlert();
      this.addKillFeedEntry('⚠️ WARNING', `THREAT ESCALATED TO ${profile.tierName}!`);
    }
  }

  spawnBot(x, z, botData = null) {
    const template = botData || BOT_ROSTER[Math.floor(Math.random() * BOT_ROSTER.length)];
    const humanMesh = createRealisticHumanSoldier(template, false);

    const bot = {
      mesh: humanMesh,
      position: new THREE.Vector3(x, 0, z),
      velocity: new THREE.Vector3(),
      health: 100,
      maxHealth: 100,
      armor: 100,
      isDead: false,
      state: 'PATROL',
      spotTimer: 0,
      nextDecisionTime: 0,
      nextFireTime: 0,
      strafeDir: (Math.random() > 0.5 ? 1 : -1),
      strafeTimer: Math.random() * 1.5,
      name: template.name
    };

    bot.mesh.position.copy(bot.position);
    this.scene.add(bot.mesh);
    this.bots.push(bot);
    return bot;
  }

  spawnInitialBotSquad() {
    this.bots.forEach(b => this.scene.remove(b.mesh));
    this.bots = [];
    this.currentTierIndex = 1;

    const spawnPoints = [...BOT_SPAWN_LOCATIONS].sort(() => 0.5 - Math.random());
    for (let i = 0; i < this.maxActiveBots; i++) {
      const pt = spawnPoints[i];
      const botInfo = BOT_ROSTER[i % BOT_ROSTER.length];
      this.spawnBot(pt.x, pt.z, botInfo);
    }
    this.updateThreatBadge();
  }

  scheduleBotReinforcement() {
    setTimeout(() => {
      if (!this.matchActive || this.player.isDead) return;
      const pt = BOT_SPAWN_LOCATIONS[Math.floor(Math.random() * BOT_SPAWN_LOCATIONS.length)];
      const rx = pt.x + (Math.random() - 0.5) * 10;
      const rz = pt.z + (Math.random() - 0.5) * 10;
      const newBot = this.spawnBot(rx, rz);
      this.addKillFeedEntry('AIR_COMMAND', `Reinforcement: ${newBot.name}`);
    }, 3000);
  }

  initEventListeners() {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
      handleResize();
      setTimeout(handleResize, 100);
      setTimeout(handleResize, 300);
    });

    // Mobile Touch Drag for Aiming (High sensitivity for fast, responsive phone camera rotation)
    let lookTouchId = null;
    let lastTouchX = 0;
    let lastTouchY = 0;
    const touchSensitivity = 0.0075; // Elevated mobile sensitivity

    window.addEventListener('touchstart', (e) => {
      if (!this.matchActive) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        // Only claim touch if on the right 65% of screen or not touching joystick/action buttons
        if (touch.clientX > window.innerWidth * 0.35 && lookTouchId === null) {
          const target = document.elementFromPoint(touch.clientX, touch.clientY);
          if (target && (target.closest('#joystick-zone') || target.closest('#hud-touch-actions button') || target.closest('.tactical-action-bar button'))) {
            continue;
          }
          lookTouchId = touch.identifier;
          lastTouchX = touch.clientX;
          lastTouchY = touch.clientY;
        }
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.matchActive || lookTouchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === lookTouchId) {
          const dx = touch.clientX - lastTouchX;
          const dy = touch.clientY - lastTouchY;
          lastTouchX = touch.clientX;
          lastTouchY = touch.clientY;

          const sens = this.mouse.isADS ? (touchSensitivity * 0.55) : touchSensitivity;
          this.cameraYaw -= dx * sens;
          this.cameraPitch -= dy * sens;
          this.cameraPitch = Math.max(-0.6, Math.min(1.0, this.cameraPitch));
          break;
        }
      }
    }, { passive: true });

    const handleTouchEnd = (e) => {
      if (lookTouchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === lookTouchId) {
          lookTouchId = null;
          break;
        }
      }
    };

    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'KeyR' && this.matchActive && !this.player.isReloading) {
        this.reloadPlayerWeapon();
      }
      if (e.code === 'KeyC' && this.matchActive) {
        this.player.isCrouched = !this.player.isCrouched;
        document.getElementById('btn-touch-crouch').classList.toggle('active', this.player.isCrouched);
      }
      if (e.code === 'Space' && this.matchActive) {
        triggerPlayerJump();
      }
      if (e.code === 'KeyT' && this.matchActive) {
        triggerTacticalShout();
      }
      if (e.code === 'KeyH' && this.matchActive) {
        triggerPlayerHeal();
      }
      if (e.code === 'KeyG' && this.matchActive) {
        triggerThrowGrenade();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    window.addEventListener('mousedown', (e) => {
      if (!this.matchActive) return;
      if (e.target.closest('#screen-game-hud button, #joystick-zone')) return;

      if (!this.mouse.isLocked && (this.matchPhase === 'COMBAT' || this.matchPhase === 'PARACHUTE')) {
        this.canvas.requestPointerLock();
      }

      if (e.button === 0) {
        this.mouse.isShooting = true;
      } else if (e.button === 2) {
        this.mouse.isADS = true;
        document.getElementById('ads-vignette').classList.add('active');
        document.getElementById('btn-touch-ads').classList.add('active');
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.mouse.isShooting = false;
      } else if (e.button === 2) {
        this.mouse.isADS = false;
        document.getElementById('ads-vignette').classList.remove('active');
        document.getElementById('btn-touch-ads').classList.remove('active');
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.mouse.isLocked = (document.pointerLockElement === this.canvas);
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.mouse.isLocked) return;
      const sens = this.mouse.isADS ? 0.0016 : 0.0028;
      this.cameraYaw -= e.movementX * sens;
      this.cameraPitch -= e.movementY * sens;
      this.cameraPitch = Math.max(-0.6, Math.min(1.0, this.cameraPitch));
    });

    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // =========================================================
  // 6. COMBAT & WEAPON ACTIONS
  // =========================================================
  firePlayerWeapon() {
    const now = performance.now() / 1000;
    if (this.player.isReloading || this.player.magazineAmmo <= 0 || now < this.player.nextFireTime) {
      if (this.player.magazineAmmo <= 0 && !this.player.isReloading) {
        this.reloadPlayerWeapon();
      }
      return;
    }

    this.player.nextFireTime = now + this.player.fireRate;
    this.player.magazineAmmo--;
    this.updateHUDAmmo();

    audio.playGunshot(true, 0);
    this.cameraPitch += (Math.random() * 0.012 + 0.008);
    this.cameraYaw += (Math.random() - 0.5) * 0.006;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

    const flash = new THREE.PointLight(0xffaa00, 4, 8);
    flash.position.copy(this.player.mesh.position).add(new THREE.Vector3(0.3, 1.4, 0.8));
    this.scene.add(flash);
    setTimeout(() => this.scene.remove(flash), 40);

    let closestHit = null;
    let closestDist = Infinity;
    let hitBot = null;
    let isHeadshotHit = false;

    for (let bot of this.bots) {
      if (bot.isDead) continue;

      const botMeshPos = bot.mesh.position;
      const rayOrigin = raycaster.ray.origin;
      const rayDir = raycaster.ray.direction;

      const distToBot = rayOrigin.distanceTo(botMeshPos);
      if (distToBot > 100) continue;

      const projPoint = new THREE.Vector3().copy(rayDir).multiplyScalar(distToBot).add(rayOrigin);
      const hitDist = projPoint.distanceTo(botMeshPos.clone().add(new THREE.Vector3(0, 1.2, 0)));

      if (hitDist < 1.2 && distToBot < closestDist) {
        closestDist = distToBot;
        closestHit = projPoint;
        hitBot = bot;
        isHeadshotHit = (projPoint.y > botMeshPos.y + 1.65);
      }
    }

    if (hitBot && closestHit) {
      const rawDamage = 34;
      const damage = isHeadshotHit ? rawDamage * 2.0 : rawDamage;
      this.damageBot(hitBot, damage, isHeadshotHit);
      this.spawnTracer(this.player.mesh.position.clone().add(new THREE.Vector3(0.3, 1.3, 0)), closestHit);
    } else {
      const endPoint = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(80));
      this.spawnTracer(this.player.mesh.position.clone().add(new THREE.Vector3(0.3, 1.3, 0)), endPoint);
    }
  }

  damageBot(bot, amount, isHeadshot) {
    if (bot.isDead) return;

    bot.health = Math.max(0, bot.health - amount);
    this.matchDamage += Math.round(amount);
    audio.playHitSound(isHeadshot);

    const marker = document.getElementById('hit-marker');
    marker.className = isHeadshot ? 'hitmarker-lines show headshot' : 'hitmarker-lines show';
    setTimeout(() => marker.classList.remove('show'), 120);

    bot.state = 'ENGAGE';
    bot.spotTimer = 2.0;

    if (bot.health <= 0) {
      this.eliminateBot(bot);
    }
  }

  eliminateBot(bot) {
    bot.isDead = true;
    this.scene.remove(bot.mesh);
    this.playerKills++;
    
    // Combat Survival Reward: +20 Armor & +10 HP per takedown
    this.player.armor = Math.min(100, this.player.armor + 20);
    this.player.health = Math.min(100, this.player.health + 10);
    this.updateHUDVitals();

    document.getElementById('hud-kill-count').textContent = this.playerKills;
    this.addKillFeedEntry('YOU', `${bot.name} (+100 XP)`);

    this.updateThreatBadge();

    const idx = this.bots.indexOf(bot);
    if (idx !== -1) this.bots.splice(idx, 1);

    this.scheduleBotReinforcement();
  }

  damagePlayer(amount) {
    if (this.player.isDead) return;

    if (this.player.armor > 0) {
      const absorbed = amount * 0.65;
      this.player.armor = Math.max(0, this.player.armor - absorbed);
      amount -= absorbed;
    }

    this.player.health = Math.max(0, this.player.health - amount);
    this.updateHUDVitals();

    const flash = document.getElementById('damage-vignette');
    flash.classList.add('flash');
    setTimeout(() => flash.classList.remove('flash'), 120);

    if (this.player.health <= 0) {
      this.player.isDead = true;
      this.finishMatch(false);
    }
  }

  reloadPlayerWeapon() {
    this.player.isReloading = true;
    document.getElementById('reload-spinner').style.display = 'block';
    audio.playReload();

    setTimeout(() => {
      const needed = this.player.maxMag - this.player.magazineAmmo;
      const add = Math.min(needed, this.player.reserveAmmo);
      this.player.magazineAmmo += add;
      this.player.reserveAmmo -= add;
      this.player.isReloading = false;
      document.getElementById('reload-spinner').style.display = 'none';
      this.updateHUDAmmo();
    }, 1800);
  }

  spawnTracer(start, end) {
    const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
    const mat = new THREE.LineBasicMaterial({ color: 0xffe066, linewidth: 2 });
    const line = new THREE.Line(geo, mat);
    this.scene.add(line);
    this.tracers.push({ line, life: 0.05 });
  }

  spawnExplosion(pos) {
    audio.playExplosion();

    const sphereGeo = new THREE.SphereGeometry(3.8, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0xff4500, transparent: true, opacity: 0.85 });
    const blast = new THREE.Mesh(sphereGeo, sphereMat);
    blast.position.copy(pos);
    this.scene.add(blast);

    for (let bot of this.bots) {
      if (bot.isDead) continue;
      const dist = pos.distanceTo(bot.mesh.position);
      if (dist < 8.5) {
        const dmg = Math.round((1.0 - (dist / 8.5)) * 130);
        this.damageBot(bot, dmg, false);
      }
    }

    let scale = 1.0;
    const interval = setInterval(() => {
      scale += 0.35;
      blast.scale.set(scale, scale, scale);
      blast.material.opacity -= 0.12;
      if (blast.material.opacity <= 0) {
        clearInterval(interval);
        this.scene.remove(blast);
      }
    }, 30);
  }

  addKillFeedEntry(killer, victim) {
    const feed = document.getElementById('kill-feed-container');
    const entry = document.createElement('div');
    entry.className = 'kill-entry';
    entry.innerHTML = `<span class="text-yellow">${killer}</span> [M4A1] ${victim}`;
    feed.prepend(entry);
    setTimeout(() => entry.remove(), 4500);
  }

  updateHUDVitals() {
    document.getElementById('hud-health-bar').style.width = this.player.health + '%';
    document.getElementById('hud-health-val').textContent = Math.round(this.player.health);
    document.getElementById('hud-armor-bar').style.width = this.player.armor + '%';
    document.getElementById('hud-armor-val').textContent = Math.round(this.player.armor);
  }

  updateHUDAmmo() {
    document.getElementById('hud-mag-ammo').textContent = this.player.magazineAmmo;
    document.getElementById('hud-res-ammo').textContent = this.player.reserveAmmo;
  }

  // =========================================================
  // 7. PROGRESSIVE MULTI-BOT AI & ANIMATION LOOP
  // =========================================================
  updateAI(dt) {
    if (this.matchPhase !== 'COMBAT') return;

    const now = performance.now() / 1000;
    const playerPos = this.player.mesh.position;
    const threat = this.getThreatProfile();

    let activeEngagers = 0;

    for (let bot of this.bots) {
      if (bot.isDead) continue;

      const botPos = bot.mesh.position;
      const distToPlayer = botPos.distanceTo(playerPos);

      // AI Decision Cycle
      if (now >= bot.nextDecisionTime) {
        bot.nextDecisionTime = now + 0.35;

        if (bot.health < 35 && bot.state !== 'HEAL') {
          bot.state = 'TAKE_COVER';
        } else if (distToPlayer < 65 && activeEngagers < threat.maxAttackers) {
          bot.state = 'ENGAGE';
          activeEngagers++;
        } else {
          bot.state = 'PATROL';
        }
      }

      let isMoving = false;

      // Execute State Behaviors
      if (bot.state === 'ENGAGE') {
        const lookDir = playerPos.clone().sub(botPos).setY(0).normalize();
        bot.mesh.rotation.y = Math.atan2(lookDir.x, lookDir.z);

        bot.spotTimer = (bot.spotTimer || 0) + dt;
        
        bot.strafeTimer += dt;
        if (bot.strafeTimer > 1.4) {
          bot.strafeTimer = 0;
          bot.strafeDir *= -1;
        }

        const strafeVec = new THREE.Vector3(-lookDir.z, 0, lookDir.x).multiplyScalar(bot.strafeDir * 3.2 * dt);
        if (distToPlayer > 30) strafeVec.add(lookDir.clone().multiplyScalar(2.2 * dt));
        botPos.add(strafeVec);
        isMoving = true;

        if (bot.spotTimer >= threat.reactionDelay && now >= bot.nextFireTime) {
          bot.nextFireTime = now + threat.burstCooldown;
          this.botShootAtPlayer(bot, distToPlayer, threat);
        }
      } else if (bot.state === 'TAKE_COVER') {
        bot.spotTimer = 0;
        const retreatDir = botPos.clone().sub(playerPos).setY(0).normalize();
        botPos.add(retreatDir.multiplyScalar(4.5 * dt));
        isMoving = true;

        if (distToPlayer > 30) {
          bot.state = 'HEAL';
          setTimeout(() => {
            if (!bot.isDead) {
              bot.health = Math.min(100, bot.health + 40);
              bot.state = 'ENGAGE';
            }
          }, 2200);
        }
      } else if (bot.state === 'PATROL') {
        bot.spotTimer = 0;
        const patrolDir = new THREE.Vector3(0, 0, 0).sub(botPos).setY(0).normalize();
        botPos.add(patrolDir.multiplyScalar(1.5 * dt));
        isMoving = true;
      }

      // Animate Bot Human Limb Strides
      this.animateHumanLimbs(bot.mesh, isMoving, 3.5, dt);
    }
  }

  animateHumanLimbs(humanMesh, isMoving, speed, dt) {
    if (!humanMesh) return;
    if (isMoving) {
      humanMesh.stridePhase = (humanMesh.stridePhase || 0) + dt * speed * 3.5;
      const angle = Math.sin(humanMesh.stridePhase) * 0.55;

      if (humanMesh.leftLeg) humanMesh.leftLeg.rotation.x = angle;
      if (humanMesh.rightLeg) humanMesh.rightLeg.rotation.x = -angle;
      if (humanMesh.leftArm) humanMesh.leftArm.rotation.x = -angle * 0.6;
    } else {
      // Return smoothly to idle stance
      if (humanMesh.leftLeg) humanMesh.leftLeg.rotation.x = THREE.MathUtils.lerp(humanMesh.leftLeg.rotation.x, 0, dt * 8);
      if (humanMesh.rightLeg) humanMesh.rightLeg.rotation.x = THREE.MathUtils.lerp(humanMesh.rightLeg.rotation.x, 0, dt * 8);
      if (humanMesh.leftArm) humanMesh.leftArm.rotation.x = THREE.MathUtils.lerp(humanMesh.leftArm.rotation.x, 0, dt * 8);
      
      // Idle Breathing Sway
      const breath = Math.sin(performance.now() * 0.0025) * 0.03;
      if (humanMesh.torsoGroup) humanMesh.torsoGroup.position.y = breath;
    }
  }

  botShootAtPlayer(bot, dist, threat) {
    audio.playGunshot(false, dist);

    const hitChance = Math.random();

    const startPos = bot.mesh.position.clone().add(new THREE.Vector3(0.3, 1.3, 0));
    let targetPos = this.player.mesh.position.clone().add(new THREE.Vector3(
      (Math.random() - 0.5) * threat.spread * dist,
      1.2 + (Math.random() - 0.5) * 0.4,
      (Math.random() - 0.5) * threat.spread * dist
    ));

    if (hitChance < threat.accuracy) {
      this.damagePlayer(threat.damagePerShot);
    }

    this.spawnTracer(startPos, targetPos);
  }

  // =========================================================
  // 8. MAIN GAME TICK ANIMATION LOOP
  // =========================================================
  animate() {
    requestAnimationFrame(this.animate);
    const dt = 0.016;

    if (this.matchActive && this.matchPhase === 'COMBAT') {
      this.updatePlayerMovement(dt);
      this.updateAI(dt);
      this.updateGrenades(dt);
      this.updateCamera();
      this.updateMinimap();
      this.updateSafeZone(dt);

      if (this.mouse.isShooting) {
        this.firePlayerWeapon();
      }
    } else if (this.matchPhase === 'PARACHUTE') {
      this.updateParachute(dt);
    } else if (this.matchPhase === 'AIRCRAFT') {
      this.updateAircraft();
    }

    for (let i = this.tracers.length - 1; i >= 0; i--) {
      this.tracers[i].life -= dt;
      if (this.tracers[i].life <= 0) {
        this.scene.remove(this.tracers[i].line);
        this.tracers.splice(i, 1);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  updatePlayerMovement(dt) {
    if (this.player.isDead) return;

    const forward = new THREE.Vector3(-Math.sin(this.cameraYaw), 0, -Math.cos(this.cameraYaw));
    const right = new THREE.Vector3(Math.cos(this.cameraYaw), 0, -Math.sin(this.cameraYaw));

    const moveVec = new THREE.Vector3();

    // 1. Keyboard Inputs
    if (this.keys['KeyW']) moveVec.add(forward);
    if (this.keys['KeyS']) moveVec.sub(forward);
    if (this.keys['KeyD']) moveVec.add(right);
    if (this.keys['KeyA']) moveVec.sub(right);

    // 2. Virtual Touch Joystick Inputs (Mobile phone 360° motion)
    if (isJoystickActive || Math.abs(joystickInput.x) > 0.05 || Math.abs(joystickInput.y) > 0.05) {
      // joystickInput.y < 0 is forward, > 0 is backward
      moveVec.add(forward.clone().multiplyScalar(-joystickInput.y));
      moveVec.add(right.clone().multiplyScalar(joystickInput.x));
    }

    const isRunning = this.player.isSprinting || !!this.keys['ShiftLeft'] || !!this.keys['ShiftRight'];
    const speed = this.player.isCrouched ? 2.8 : (isRunning && !this.mouse.isADS ? 8.5 : 4.6);
    const isMoving = moveVec.lengthSq() > 0.01;

    if (isMoving) {
      moveVec.normalize();
      this.player.position.add(moveVec.multiplyScalar(speed * dt));
      if (this.player.isGrounded && Math.random() < (isRunning ? 0.09 : 0.05)) {
        audio.playFootstep();
      }
    }

    // Animate Player Realistic Human Limbs
    this.animateHumanLimbs(this.player.mesh, isMoving, speed, dt);

    // Ballistic Jump & Gravity
    if (!this.player.isGrounded || this.player.verticalVelocity !== 0) {
      this.player.verticalVelocity += this.player.gravity * dt;
      this.player.position.y += this.player.verticalVelocity * dt;

      if (this.player.position.y <= 0) {
        this.player.position.y = 0;
        this.player.verticalVelocity = 0;
        this.player.isGrounded = true;
        this.player.isJumping = false;
      }
    }

    const targetScaleY = this.player.isCrouched ? 0.65 : 1.0;
    this.player.mesh.scale.y = THREE.MathUtils.lerp(this.player.mesh.scale.y, targetScaleY, dt * 10);

    this.player.mesh.position.copy(this.player.position);
    this.player.mesh.rotation.y = this.cameraYaw;
  }

  updateGrenades(dt) {
    for (let i = this.grenades.length - 1; i >= 0; i--) {
      const g = this.grenades[i];
      g.life -= dt;
      g.vel.y -= 18 * dt;
      g.mesh.position.add(g.vel.clone().multiplyScalar(dt));

      if (g.mesh.position.y <= 0.2) {
        g.mesh.position.y = 0.2;
        g.vel.y = -g.vel.y * 0.45;
        g.vel.x *= 0.7;
        g.vel.z *= 0.7;
      }

      if (g.life <= 0) {
        this.spawnExplosion(g.mesh.position);
        this.scene.remove(g.mesh);
        this.grenades.splice(i, 1);
      }
    }
  }

  updateCamera() {
    const isADS = this.mouse.isADS;
    const targetFOV = isADS ? 40 : 65;
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, 0.18);
    this.camera.updateProjectionMatrix();

    const shoulderOffset = isADS ? new THREE.Vector3(0.5, 1.6, -1.2) : new THREE.Vector3(0.8, 1.8, -3.2);
    
    const camPos = this.player.position.clone()
      .add(new THREE.Vector3(
        -Math.sin(this.cameraYaw) * shoulderOffset.z + Math.cos(this.cameraYaw) * shoulderOffset.x,
        shoulderOffset.y - Math.sin(this.cameraPitch) * 2.2,
        -Math.cos(this.cameraYaw) * shoulderOffset.z - Math.sin(this.cameraYaw) * shoulderOffset.x
      ));

    this.camera.position.copy(camPos);
    
    const lookTarget = this.player.position.clone().add(new THREE.Vector3(
      -Math.sin(this.cameraYaw) * 50,
      1.5 + Math.sin(this.cameraPitch) * 50,
      -Math.cos(this.cameraYaw) * 50
    ));
    this.camera.lookAt(lookTarget);
  }

  updateAircraft() {
    this.camera.position.set(0, 45, 60);
    this.camera.lookAt(0, 0, 0);
  }

  updateParachute(dt) {
    this.player.position.y = Math.max(0, this.player.position.y - 18 * dt);
    this.player.mesh.position.copy(this.player.position);
    
    document.getElementById('live-altitude').textContent = Math.round(this.player.position.y * 10);
    document.getElementById('altimeter-fill').style.height = (this.player.position.y / 50 * 100) + '%';

    if (this.player.position.y <= 0.1) {
      this.matchPhase = 'COMBAT';
      UI.showScreen('gameHud');
    }
  }

  updateSafeZone(dt) {
    this.zoneTimeLeft -= dt;
    const mins = Math.floor(Math.max(0, this.zoneTimeLeft) / 60);
    const secs = Math.floor(Math.max(0, this.zoneTimeLeft) % 60);
    document.getElementById('zone-countdown').textContent = 
      `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    if (this.zoneTimeLeft <= 0) {
      this.zoneRadius = Math.max(30, this.zoneRadius - 3 * dt);
      this.safeZone.scale.set(this.zoneRadius / 90, 1, this.zoneRadius / 90);

      const distFromCenter = Math.hypot(this.player.position.x, this.player.position.z);
      if (distFromCenter > this.zoneRadius) {
        this.damagePlayer(8 * dt);
      }
    }
  }

  updateMinimap() {
    const canvas = document.getElementById('minimap-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const scale = 0.7;

    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2;

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, this.zoneRadius * scale, 0, Math.PI * 2);
    ctx.stroke();

    for (let bot of this.bots) {
      if (bot.isDead) continue;
      const bx = centerX + (bot.mesh.position.x - this.player.position.x) * scale;
      const by = centerY + (bot.mesh.position.z - this.player.position.z) * scale;
      if (bx > 5 && bx < w - 5 && by > 5 && by < h - 5) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(-this.cameraYaw);
    ctx.fillStyle = '#FFD400';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(4, 5);
    ctx.lineTo(-4, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  finishMatch(isVictory) {
    this.matchActive = false;
    this.matchPhase = 'ENDED';
    document.exitPointerLock();

    const banner = document.getElementById('result-banner-title');
    const sub = document.getElementById('result-sub-badge');

    banner.textContent = 'FINAL STAND — ELIMINATED';
    banner.className = 'result-headline text-danger';
    sub.textContent = `HOSTILES DEFEATED: ${this.playerKills} • SURVIVAL COMPLETE`;

    const elapsed = Math.floor((performance.now() - this.matchStartTime) / 1000);
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;

    document.getElementById('res-stat-kills').textContent = this.playerKills;
    document.getElementById('res-stat-damage').textContent = this.matchDamage;
    document.getElementById('res-stat-time').textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    document.getElementById('res-stat-xp').textContent = `+${500 + this.playerKills * 250} XP`;

    UI.showScreen('result');
  }

  resetToLobby() {
    this.matchActive = false;
    this.matchPhase = 'LOBBY';
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 1.5, 0);
  }
}

// Instantiate Game Engine
const game = new ShadowIslandGame();
UI.initListeners();

// =========================================================
// 9. TACTICAL ACTION UTILITIES (Jump, Shout, Heal, Grenade)
// =========================================================
function triggerPlayerJump() {
  if (game.player.isGrounded && !game.player.isJumping) {
    game.player.isGrounded = false;
    game.player.isJumping = true;
    game.player.verticalVelocity = game.player.jumpSpeed;
    audio.playJump();
  }
}

function triggerTacticalShout() {
  const line = SHOUT_LINES[shoutIndex % SHOUT_LINES.length];
  shoutIndex++;

  audio.playRadioSquelch();

  const banner = document.getElementById('radio-shout-banner');
  const msgEl = document.getElementById('radio-shout-msg');
  msgEl.textContent = `"${line}"`;
  banner.classList.add('active');

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(line);
    utterance.rate = 1.15;
    utterance.pitch = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  for (let bot of game.bots) {
    if (!bot.isDead) {
      bot.state = 'ENGAGE';
      bot.spotTimer = 0.8;
    }
  }

  setTimeout(() => {
    banner.classList.remove('active');
  }, 3200);
}

function triggerPlayerHeal() {
  if (game.player.health >= 100) return;
  audio.playHeal();
  game.player.health = Math.min(100, game.player.health + 50);
  game.updateHUDVitals();
}

function triggerThrowGrenade() {
  audio.playClick(audio.ctx ? audio.ctx.currentTime : 0, 500, 0.05);

  const forward = new THREE.Vector3(-Math.sin(game.cameraYaw), 0.35, -Math.cos(game.cameraYaw)).normalize();
  const spawnPos = game.player.mesh.position.clone().add(new THREE.Vector3(0, 1.6, 0));

  const gMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x1e3a1e, roughness: 0.4 })
  );
  gMesh.position.copy(spawnPos);
  game.scene.add(gMesh);

  game.grenades.push({
    mesh: gMesh,
    vel: forward.multiplyScalar(22),
    life: 1.8
  });
}

// =========================================================
// 10. DROP & COMBAT TRANSITION SEQUENCER
// =========================================================
function startMatchDropSequence() {
  audio.init();
  game.matchActive = true;
  game.matchPhase = 'AIRCRAFT';
  game.player.health = 100;
  game.player.armor = 100;
  game.player.magazineAmmo = 30;
  game.player.reserveAmmo = 180;
  game.player.isDead = false;
  game.playerKills = 0;
  game.matchDamage = 0;
  game.aliveCount = 50;
  game.zoneRadius = 90;
  game.zoneTimeLeft = 105;
  game.matchStartTime = performance.now();

  game.player.position.set(0, 45, 0);
  game.player.mesh.position.copy(game.player.position);

  game.spawnInitialBotSquad();

  game.updateHUDVitals();
  game.updateHUDAmmo();
  document.getElementById('hud-kill-count').textContent = '0';

  UI.showScreen('aircraft');

  let dropTimer = 6;
  const timerEl = document.getElementById('autodrop-timer');
  const interval = setInterval(() => {
    dropTimer--;
    if (timerEl) timerEl.textContent = `00:0${dropTimer}`;
    if (dropTimer <= 0) {
      clearInterval(interval);
      if (game.matchPhase === 'AIRCRAFT') {
        executeAircraftJump();
      }
    }
  }, 1000);
}

function executeAircraftJump() {
  game.matchPhase = 'PARACHUTE';
  UI.showScreen('parachute');
  audio.playZoneAlert();
}
