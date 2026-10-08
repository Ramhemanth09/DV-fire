# SHADOW ISLAND — Phase 1 & 2 Unity 3D Setup Guide

This guide details how to set up and test **Phase 1 (Player Controller & Third-Person Camera)** and **Phase 2 (Weapons, Ballistics, Recoil, Damage & Lethal AI Bot)** inside Unity 2022.3+ / 2023.x (URP - Universal Render Pipeline).

---

## 📁 1. Project Folder Structure

```
Assets/
└── ShadowIsland/
    ├── Scripts/
    │   ├── Core/
    │   │   ├── HealthSystem.cs
    │   │   ├── HitboxReceiver.cs
    │   │   └── ShadowIslandGameManager.cs
    │   ├── Player/
    │   │   ├── PlayerController.cs
    │   │   └── ThirdPersonCameraController.cs
    │   ├── Weapons/
    │   │   ├── WeaponData.cs
    │   │   └── WeaponController.cs
    │   └── AI/
    │       ├── EnemyAIController.cs
    │       └── CoverPointManager.cs
    ├── ScriptableObjects/
    │   └── Weapons/
    │       └── M4A1_ShadowAR.asset
    ├── Prefabs/
    │   ├── Player_Tactical.prefab
    │   ├── Bot_Viper_AI.prefab
    │   ├── VFX_MuzzleFlash.prefab
    │   └── VFX_BulletTracer.prefab
    └── Scenes/
        └── ShadowIsland_Prototype.unity
```

---

## ⚙️ 2. Unity Editor Setup Steps

### Step 1: Layer Configuration
Open **Edit → Project Settings → Tags and Layers**:
- Add Layer 8: `Player`
- Add Layer 9: `Enemy`
- Add Layer 10: `Cover`
- Add Layer 11: `Obstacle`
- Add Layer 12: `Ground`

### Step 2: Player Setup
1. Create an empty GameObject `Player` and attach `CharacterController` and [`PlayerController.cs`](file:///C:/Users/RAM/.gemini/antigravity/scratch/shadow-island/Unity-Scripts/Player/PlayerController.cs).
2. Attach [`HealthSystem.cs`](file:///C:/Users/RAM/.gemini/antigravity/scratch/shadow-island/Unity-Scripts/Core/HealthSystem.cs).
3. Under Player, create child objects for `Head`, `Chest`, `Limbs` with Colliders and [`HitboxReceiver.cs`](file:///C:/Users/RAM/.gemini/antigravity/scratch/shadow-island/Unity-Scripts/Core/HitboxReceiver.cs) set to appropriate `HitboxType` (Head = 2.0x, Body = 1.0x, Limb = 0.75x).
4. Create a child GameObject for the weapon model `M4A1_Holder` and attach [`WeaponController.cs`](file:///C:/Users/RAM/.gemini/antigravity/scratch/shadow-island/Unity-Scripts/Weapons/WeaponController.cs).

### Step 3: Camera Setup
1. Create `Main Camera` and attach [`ThirdPersonCameraController.cs`](file:///C:/Users/RAM/.gemini/antigravity/scratch/shadow-island/Unity-Scripts/Player/ThirdPersonCameraController.cs).
2. Assign `Target` to the Player Transform.
3. Configure Shoulder Offset: `(X: 0.6, Y: 1.6, Z: 0.0)` for default view and `(X: 0.45, Y: 1.55, Z: 0.4)` for ADS.
4. Set Collision Layers to `Obstacle`, `Cover`, `Ground` to avoid camera wall clipping.

### Step 4: Weapon Data Asset
1. Right-click in Project view: **Create → ShadowIsland → Weapon Data**.
2. Name it `M4A1_ShadowAR`.
3. Set Stats:
   - Base Damage: `32`
   - Fire Rate RPM: `680`
   - Magazine Capacity: `30`
   - Max Reserve Ammo: `180`
   - Reload Duration: `2.2s`
   - Vertical Recoil: `1.2 - 1.8`
   - Horizontal Recoil: `-0.6 to +0.6`
4. Assign this asset to the Player's `WeaponController`.

### Step 5: AI Enemy Bot Setup
1. Create an empty GameObject `Bot_Viper` and attach `NavMeshAgent`.
2. Attach [`HealthSystem.cs`](file:///C:/Users/RAM/.gemini/antigravity/scratch/shadow-island/Unity-Scripts/Core/HealthSystem.cs) and [`EnemyAIController.cs`](file:///C:/Users/RAM/.gemini/antigravity/scratch/shadow-island/Unity-Scripts/AI/EnemyAIController.cs).
3. Add child Hitbox colliders (`Head`, `Chest`, `Limbs`) with [`HitboxReceiver.cs`](file:///C:/Users/RAM/.gemini/antigravity/scratch/shadow-island/Unity-Scripts/Core/HitboxReceiver.cs).
4. Attach a weapon holder with [`WeaponController.cs`](file:///C:/Users/RAM/.gemini/antigravity/scratch/shadow-island/Unity-Scripts/Weapons/WeaponController.cs).
5. Set Difficulty to `Hard` or `Extreme` in the Inspector.

### Step 6: NavMesh & Map Geometry
1. Add static terrain/planes and concrete obstacle cubes.
2. Select all static scene objects and check **Navigation Static**.
3. Open **Window → AI → Navigation (Obsolete)** or **NavMesh Surface component** and click **Bake**.

---

## 🧪 3. Phase 1 & 2 Test Checklist

- [x] **Locomotion**: WASD walk, Left Shift sprint, C crouch height lerp, Space jump.
- [x] **Camera & ADS**: Mouse look, smooth over-the-shoulder tracking, Right-Click ADS zoom and shoulder alignment.
- [x] **Ballistics & Firing**: Left-Click full auto fire, muzzle flash light burst, bullet tracers, screen recoil kick and recovery.
- [x] **Reloading**: Press `R` or empty clip triggers reload coroutine with magazine swap timer and audio events.
- [x] **Hit Detection**: Headshots register 2.0x critical damage; armor absorbs 35-50% body damage.
- [x] **AI Vision & Line-of-Sight**: Bot detects player within 75m vision cone without wallhack raycast bypass.
- [x] **AI Combat & Cover**: Bot strafes dynamically, fires bursts, seeks cover when HP < 40%, and heals.
