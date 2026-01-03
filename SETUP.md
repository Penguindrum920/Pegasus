# 🚀 Audio-Reactive Particle System - Setup Guide

## ✅ What's Already Working

All the core files have been created and integrated. The particle visualizer will **only appear after the Hero section** once you click to start audio.

---

## 📁 File Structure

```
d:\pegasus\
├── src\
│   ├── audio\
│   │   └── AudioManager.js          ✅ Created - Web Audio API integration
│   ├── components\
│   │   ├── Hero.jsx                 ✅ Exists - Your hero section
│   │   ├── Button.jsx               ✅ Exists - Button component
│   │   ├── VideoPreview.jsx         ✅ Exists - Video preview
│   │   ├── ParticleVisualizer.jsx   ✅ Created - Three.js particle system
│   │   └── MusicSearch.jsx          ✅ Created - Music selection UI
│   ├── shaders\
│   │   ├── particles.vert.js        ✅ Created - Vertex shader (curl noise)
│   │   └── particles.frag.js        ✅ Created - Fragment shader (colors)
│   ├── App.jsx                      ✅ Updated - Main app with integration
│   ├── index.css                    ✅ Updated - Black background
│   └── main.jsx                     ✅ Exists
├── public\
│   ├── videos\                      ✅ Exists - Hero videos
│   └── fonts\                       ✅ Exists - Custom fonts
└── package.json                     ✅ Updated - All dependencies

```

---

## 📦 Required Dependencies (Already Installed)

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "three": "^0.160.0",          // ✅ For 3D rendering
    "gsap": "^3.12.5",            // ✅ For animations
    "@gsap/react": "^2.1.1",      // ✅ GSAP React integration
    "react-icons": "^5.3.0",      // ✅ For UI icons
    "clsx": "^2.1.1"              // ✅ For classNames
  }
}
```

---

## 🎯 How It Works

### 1. **Hero Section Loads First**
- Hero section displays with videos
- Black background everywhere

### 2. **User Clicks to Enter**
- AudioContext initializes (browser requirement)
- Audio system becomes ready

### 3. **Particle Visualizer Starts**
- **Only appears AFTER hero section**
- Positioned as fixed background (z-index: 0)
- Black background with particles on top

### 4. **Music Selection**
- User searches/selects demo track
- Audio feeds into visualizer
- Particles react to:
  - **Bass** → Animation speed
  - **Mids** → Depth pulsing
  - **Treble** → Particle displacement

---

## 🎨 Visual Flow

```
┌─────────────────────────────────────┐
│  Hero Section (videos, no particles)│
│  Background: As designed            │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  [Click to Enter prompt]            │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  Music Selection Section            │
│  Background: BLACK                  │
│  Particles: ACTIVE & REACTIVE       │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  Mission / Get Involved Sections    │
│  Background: BLACK                  │
│  Particles: ACTIVE & REACTIVE       │
└─────────────────────────────────────┘
```

---

## 🎵 Demo Tracks Included

The app comes with 3 working demo tracks:
- **Electronic Energy** - High energy
- **Ambient Flow** - Smooth ambient
- **Bass Heavy** - Strong bass

No API setup needed to test!

---

## 🔧 To Add Real Music API

### Option 1: Spotify (Best Catalog)
1. Create app at: https://developer.spotify.com
2. Get Client ID and Secret
3. Update `src/components/MusicSearch.jsx` search function

### Option 2: SoundCloud (Simpler)
1. Get API key at: https://developers.soundcloud.com
2. Update search endpoint

### Option 3: YouTube Music
1. Use YouTube Data API v3
2. Extract audio stream

---

## 🚀 Run the Project

```bash
cd d:\pegasus
npm run dev
```

Open: http://localhost:5175/

---

## 📍 Source Project Path

Original Tympanus visualizer:
```
C:\Users\Aditya Kaushik\Downloads\Interactive-Particles-Music-Visualizer-main\Interactive-Particles-Music-Visualizer-main
```

---

## 🎨 Color Scheme (Now Black Theme)

- **Background**: `#000000` (Black)
- **Primary**: `#ff00ff` (Magenta/Violet)
- **Secondary**: `#00ffff` (Cyan/Blue)
- **Accent**: `#ffff00` (Yellow)
- **Text**: White/Gray shades

---

## ⚡ Performance Notes

- **GPU-accelerated**: All particle animation on GPU via shaders
- **No CPU particle updates**: Efficient even with thousands of particles
- **Responsive**: Automatically adjusts to window size
- **Mobile-friendly**: Works on mobile (with user interaction)

---

## 🐛 Troubleshooting

### "Audio won't play"
- **Solution**: Click "Click to Enter" prompt (browser security requires user interaction)

### "No particles showing"
- **Solution**: Particles only appear AFTER hero section, after clicking to enter

### "Particles not reacting to music"
- **Solution**: Make sure you've selected a track and it's playing

### "Performance issues"
- **Solution**: Lower particle count by modifying geometry segments in ParticleVisualizer.jsx

---

## 🎯 Next Steps

1. ✅ All files created and integrated
2. ✅ Black backgrounds applied everywhere
3. ✅ Particle visualizer positioned after hero
4. ✅ Demo tracks working
5. 🔄 Optional: Add real music API
6. 🔄 Optional: Customize particle colors
7. 🔄 Optional: Add more geometries (sphere, torus, etc.)

---

## 📞 File Paths Reference

### Core System
- Audio: `src/audio/AudioManager.js`
- Particles: `src/components/ParticleVisualizer.jsx`
- Shaders: `src/shaders/particles.vert.js` & `particles.frag.js`

### UI Components
- Main App: `src/App.jsx`
- Search: `src/components/MusicSearch.jsx`
- Hero: `src/components/Hero.jsx`

### Styling
- CSS: `src/index.css`

---

🎉 **Everything is ready to go! Just run `npm run dev` and test!**
