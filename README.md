# Arrow Escape 🚀

A modern, responsive directional puzzle game built with React, TypeScript, Tailwind CSS, and Web Audio API.

Solve intricate directional networks, untangle multi-layered arrow blockers, and master spatial puzzles in both 2D and 3D Cube dimensions!

---

## ✨ Features

- **500 Progressive Levels across 5 Chapters**:
  - **Chapter 1 (Levels 1–100): *Neon Origins*** — Classic 2D directional puzzle mechanics, move-limit milestones, and interconnected blocking webs.
  - **Chapter 2 (Levels 101–200): *Cube Dimension*** — True 3D Cube with 6 independently rendered faces (Front, Right, Back, Left, Top, Bottom) and smooth 360° touch drag rotation.
  - **Chapter 3 (Levels 201–300): *Quantum Matrix*** — 5 special arrow mechanics:
    - 🌀 **Teleport Arrow (Violet Portal)**: Warps through designated wormholes to bypass blockers.
    - 💣 **Explosive Arrow (Orange Blast)**: Clears nearby eligible arrows upon launch.
    - ⚡ **Double Arrow (Cyan 2-Stage)**: Requires two sequenced charges to launch.
    - 🔄 **Rotating Arrow (Teal Compass)**: Ratchet rotation turns 90° clockwise on tap until clear.
    - 🔐 **Locked & Key Arrows (Red Padlock & Gold Key)**: Padlocks stay invulnerable until their key is cleared.
  - **Chapter 4 (Levels 301–400): *Hypercube Orbit*** — Advanced 3D spatial cube puzzles integrating special mechanics.
  - **Chapter 5 (Levels 401–500): *Master Singularity*** — Grandmaster multi-stage challenges.

- **100% Solvability Guarantee**: Every generated level is verified solvable using a forward topological solver algorithm.
- **60-Second Rush Mode**: Fast-paced blitz mode with combo multipliers (x2, x3, x5) and high score tracking.
- **Synthesized Web Audio**: Dynamic ambient background music, victory chimes, and original SFX synthesized completely via Web Audio API (no external copyrighted audio files).
- **Mobile-First & Responsive**: Hardware-accelerated CSS 3D transforms, low battery usage, touch drag deadzone (prevents accidental taps), and dark neon theme.
- **Local Persistence**: Saves completed levels, 3-star ratings, earned coins, daily streak rewards, and user audio preferences in `localStorage`.

---

## 🛠️ Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Audio**: Web Audio API (AudioContext, BiquadFilter, GainNode oscillators)
- **Icons**: Lucide React
- **Build Tool**: Vite

---

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or bun

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/vishvajeet9717kumar-cell/arrow-escape.git
   cd arrow-escape
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000` (or the port shown in your terminal).

### Production Build

```bash
npm run build
```

---

## 📄 License

MIT License. Free to use, modify, and distribute.
