# SHADOW ISLAND — Offline Tactical Battle Royale

[![Single-Player](https://img.shields.io/badge/Mode-Single--Player%20Offline-yellow.svg)](#)
[![Unity 3D](https://img.shields.io/badge/Engine-Unity%203D%20%7C%20Three.js-blue.svg)](#)
[![Theme](https://img.shields.io/badge/Theme-Dark%20Navy%20%26%20Yellow-black.svg)](#)

**SHADOW ISLAND** is a single-player, fully offline tactical battle royale shooter. The player drops into an island combat zone, loots armament, manages armor and resources, and engages in lethal, tactical combat against adaptive AI opponents.

---

## 🎮 Playable Web Engine & Localhost Version
The project includes a self-contained 3D WebGL tactical engine (Three.js) playable on desktop and mobile browsers.

### Features:
- **Full 9 UI Screens**:
  1. Home / Landing Screen
  2. Main Menu with live 3D preview, navigation, currency (Coins & Gems), and player profile
  3. Mission Configuration & Difficulty (Easy, Normal, Hard, Extreme)
  4. Operator Roster (Raven, Nova, Zayn, Titan, Arrow with unique stats & passives)
  5. Loadout & Backpack Grid (Primary, Secondary, Sidearm, Lv1-3 Helmets & Armor)
  6. Aerial Aircraft Drop with Cabin Counter & Trajectory
  7. Freefall & Parachute Deployment HUD
  8. In-Game Tactical HUD with 3D Radar Minimap, Compass, Crosshair with hitmarkers, ADS Scope Vignette, and Action Controls
  9. Match Results Screen (Final Stand, Kills, Damage, XP Progression)
- **🕹️ 360° Virtual Touch Joystick**: Mobile-friendly analog joystick for smooth directional movement, strafing, and sprint.
- **🪖 Anatomically Realistic Human Soldiers**: Articulated 3D models with ballistic FAST helmets, MOLLE plate carriers, comms headsets, and walking/running leg stride animations.
- **🔊 Procedural Tactical Audio**: Gunshots with spatial distance falloff, hit markers, radio squelch, synthesized voice callouts, and footstep sound effects via Web Audio API.
- **📈 Progressive Difficulty & Dynamic Threat Levels**:
  - `🛡️ TIER 1: RECRUIT (0-3 Kills)`: Slower reaction, low damage, forgiving early-game.
  - `⚔️ TIER 2: VETERAN (4-8 Kills)`: Moderate reaction & accuracy, tactical cover.
  - `🔥 TIER 3: SPECOPS (9-15 Kills)`: Fast reaction, high accuracy, flanking.
  - `💀 TIER 4: APEX ELITE (16+ Kills)`: Lethal precision, aggressive pushes.
- **♾️ Endless Multi-Bot Survival**: Continuous air-dropped bot reinforcements keep the island combat alive until the human player is eliminated.

---

## 📁 Repository Structure

```
├── Unity-Scripts/                  # Complete Unity 3D (URP) C# Architecture
│   ├── AI/
│   │   └── EnemyAIController.cs    # Utility AI & Behavior Tree state machine
│   ├── Core/
│   │   ├── HealthSystem.cs         # Armor Lv1-3 absorption & hitbox multipliers
│   │   ├── HitboxReceiver.cs       # Head / Body / Limb damage router
│   │   └── ShadowIslandGameManager.cs # Match loop & reinforcement spawner
│   ├── Player/
│   │   ├── PlayerController.cs     # Third-person CharacterController locomotion
│   │   └── ThirdPersonCameraController.cs # Over-shoulder orbital camera & ADS
│   ├── Weapons/
│   │   ├── WeaponData.cs           # ScriptableObject for weapon ballistics & recoil
│   │   └── WeaponController.cs     # Raycast shooting, recoil kick, and reload
│   └── SetupGuide.md               # Unity Editor setup guide (Layers, NavMesh, Prefabs)
├── web/
│   ├── public/
│   │   ├── index.html              # 9 UI screens, HUD, and WebGL canvas
│   │   ├── style.css               # Tactical dark navy & yellow styling system
│   │   └── app.js                  # 3D game engine, multi-bot AI, and audio synthesis
│   └── server.js                   # Node HTTP server
└── README.md
```

---

## 🚀 How to Run the Web Build Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Ramhemanth09/DV-fire.git
   cd DV-fire/web
   ```

2. **Start the local server**:
   ```bash
   node server.js
   ```

3. **Open in browser**:
   Navigate to `http://localhost:8080/`

---

## ⌨️ Controls

| Action | Keyboard / Mouse | Touch / On-Screen |
| :--- | :--- | :--- |
| **Move** | `W`, `A`, `S`, `D` | **Virtual Touch Joystick** |
| **Sprint / Run** | `Left Shift` | `⚡ SPRINT` Button |
| **Jump** | `Spacebar` | `🦘 JUMP` Button |
| **Crouch** | `C` | `🧎 CROUCH` Button |
| **Shoot / Fire** | `Left Mouse Button` | `🔥 FIRE` Button |
| **Aim Down Sights (ADS)** | `Right Mouse Button` | `🎯 AIM` Button |
| **Reload** | `R` | `🔄 RELOAD` Button |
| **Tactical Shout** | `T` | `📢 SHOUT` Button |
| **Use Medkit** | `H` | `💉 HEAL` Button |
| **Throw Frag Grenade** | `G` | `💣 FRAG` Button |
