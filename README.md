# Pegasus RVITM - Web Dev Club Website

This is the official website for the Pegasus Web Development Club at RVITM.

## 🚀 Live Demo

Visit: [Your Vercel URL will appear here after deployment]

## ✨ Features

- **Interactive Audio Visualizer** - WebGL-based particle system that reacts to music
- **3D Sphere Gallery** - Interactive dome gallery with gesture controls
- **Animated Navbar** - GSAP-powered staggered menu with smooth transitions
- **Team Showcase** - Animated card swapping display of team members
- **Event Timeline** - ChromaGrid display of club events and workshops
- **Splash Cursor Effect** - WebGL fluid simulation cursor trail
- **StarBorder Effects** - Animated border effects on key sections
- **Default Music Tracks** - 9 curated tracks with unique color schemes
- **Music Search** - Integration with SoundCloud for custom tracks
- 🎬 Full-screen video hero section with interactive transitions
- ✨ Animated loading screen
- 🎯 GSAP animations and scroll effects
- 📱 Responsive design

## 🛠️ Tech Stack

- **React 18** with Vite
- **Three.js** - 3D graphics and WebGL
- **GSAP** - Advanced animations
- **Framer Motion** - React animations
- **Tailwind CSS** - Styling
- **Lenis** - Smooth scrolling
- **Web Audio API** - Audio analysis and visualization

## Getting Started

### Install dependencies

```bash
# Clone the repository
git clone https://github.com/Penguindrum920/Pegasus.git
cd Pegasus

# Install dependencies
npm install
```

### Run development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## 🌐 Deploy to Vercel

### Option 1: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository: `Penguindrum920/Pegasus`
4. Vercel will auto-detect Vite configuration
5. Click "Deploy"

### Option 2: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Configuration

The project includes a `vercel.json` configuration file optimized for Vite.

## 🎵 Audio Tracks

The project includes 9 default tracks with unique color schemes:
- Fallen Rosemary's Nocturne Theme
- A Dramatic Irony
- ManiFesto
- Renegade
- Samudrartha
- Operation Blade
- Wildfire
- CC#10 Operation Ashring
- CC#11 Operation Fake Wave

Each track automatically changes the particle visualizer colors!

## 📁 Project Structure

```
pegasus/
├── src/
│   ├── components/         # React components
│   ├── audio/             # Audio management
│   ├── api/               # API integrations
│   ├── shaders/           # WebGL shaders
│   └── App.jsx
├── public/
│   ├── audio/             # Music tracks
│   ├── gallery/           # Gallery images
│   ├── events/            # Event images
│   ├── members/           # Team photos
│   └── videos/            # Hero videos
└── vercel.json           # Vercel configuration
```

## Required Assets

All required assets are included in the repository:
- `/public/videos/` - Hero background videos
- `/public/audio/` - Default music tracks
- `/public/fonts/` - Custom fonts
- `/public/gallery/` - Gallery images
- `/public/events/` - Event photos
- `/public/members/` - Team member photos
- `/public/logo/` - Club logo

## 📄 License

MIT License - feel free to use this for your own club website!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

- Instagram: [@pegasusrvitm](https://www.instagram.com/pegasusrvitm/)
- GitHub: [Penguindrum920](https://github.com/Penguindrum920)

---

Made with ❤️ by Pegasus Web Dev Club @ RVITM
