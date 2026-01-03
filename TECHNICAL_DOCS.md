# Audio-Reactive Particle Visualizer - Complete Technical Documentation

## 📋 Table of Contents
1. [System Architecture](#system-architecture)
2. [Data Flow](#data-flow)
3. [Component Breakdown](#component-breakdown)
4. [Audio Analysis Deep Dive](#audio-analysis-deep-dive)
5. [Visual Mapping](#visual-mapping)
6. [Performance Optimizations](#performance-optimizations)
7. [Browser Compatibility](#browser-compatibility)
8. [Troubleshooting](#troubleshooting)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interaction                        │
│           (Click → Initialize AudioContext)                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   Music Selection UI                         │
│     ┌─────────────┬────────────┬──────────────────┐        │
│     │   Search    │  Results   │   Track Select   │        │
│     └──────┬──────┴─────┬──────┴────────┬─────────┘        │
└────────────┼────────────┼───────────────┼──────────────────┘
             │            │               │
             │            │               │ Load Track
             │            │               ▼
             │            │      ┌─────────────────────┐
             │            │      │  HTMLAudioElement   │
             │            │      └──────────┬──────────┘
             │            │                 │
             │            │                 │ Connect to
             │            │                 ▼
┌────────────▼────────────▼────────────────────────────────────┐
│                    AudioManager                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Web Audio API                            │   │
│  │  ┌──────────────┐  ┌────────────────┐                │   │
│  │  │ AudioContext │→ │  AnalyserNode  │                │   │
│  │  └──────────────┘  └────────┬───────┘                │   │
│  │                              │ FFT                    │   │
│  │                              ▼                        │   │
│  │                    ┌──────────────────┐              │   │
│  │                    │ Frequency Data   │              │   │
│  │                    │  (Uint8Array)    │              │   │
│  │                    └────────┬─────────┘              │   │
│  │                             │                        │   │
│  │          ┌──────────────────┴──────────────────┐    │   │
│  │          │    Band Analysis & Normalization     │    │   │
│  │          └──────────────────┬──────────────────┘    │   │
│  │                             │                        │   │
│  │   ┌─────────────────────────┴─────────────────┐    │   │
│  │   │  low: 0-1  │  mid: 0-1  │  high: 0-1      │    │   │
│  │   └─────────────┬────────────┬────────────────┘    │   │
│  └─────────────────┼────────────┼─────────────────────┘   │
└───────────────────┼────────────┼─────────────────────────┘
                    │            │
                    │ Every Frame (60fps)
                    │            │
┌───────────────────▼────────────▼─────────────────────────────┐
│              ParticleVisualizer (Three.js)                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                Animation Loop                           │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  1. Get frequency data from AudioManager         │  │ │
│  │  │  2. Map to shader uniforms:                      │  │ │
│  │  │     - high → amplitude (particle displacement)   │  │ │
│  │  │     - mid → offsetGain (depth pulsing)          │  │ │
│  │  │     - low → time increment (speed)              │  │ │
│  │  │  3. Update uniforms                              │  │ │
│  │  │  4. Render frame                                 │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                             │                           │ │
│  │                             ▼                           │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │          GPU Shader Processing                    │  │ │
│  │  │  ┌──────────────────┬───────────────────────┐    │  │ │
│  │  │  │ Vertex Shader    │  Fragment Shader      │    │  │ │
│  │  │  │ (Position/Size)  │  (Color/Opacity)      │    │  │ │
│  │  │  └──────────┬───────┴──────┬────────────────┘    │  │ │
│  │  └─────────────┼──────────────┼──────────────────────┘  │ │
│  └────────────────┼──────────────┼─────────────────────────┘ │
└───────────────────┼──────────────┼───────────────────────────┘
                    │              │
                    └──────┬───────┘
                           │
                    ┌──────▼────────┐
                    │  Rendered to  │
                    │    Screen     │
                    └───────────────┘
```

---

## 🔄 Data Flow: Audio → Visuals

### Step-by-Step Breakdown

#### 1. **Audio Input**
```
HTMLAudioElement (MP3/Stream)
    ↓
Audio waveform (continuous signal)
```

#### 2. **Web Audio API Processing**
```javascript
// Create audio routing chain
audioSource = audioContext.createMediaElementSource(audioElement)
analyserNode = audioContext.createAnalyser()
analyserNode.fftSize = 1024

// Connect: Source → Analyser → Destination (speakers)
audioSource.connect(analyserNode)
analyserNode.connect(audioContext.destination)
```

**What happens:**
- Audio flows through `AnalyserNode` without modification
- `AnalyserNode` performs **FFT** (Fast Fourier Transform)
- FFT converts time-domain signal → frequency-domain data

#### 3. **FFT (Fast Fourier Transform)**
```
Time Domain:              Frequency Domain:
Amplitude vs Time    →    Magnitude vs Frequency

[Waveform]           →    [Spectrum Bars]
     /\                         |||||||||||||||
    /  \                        |||||||||||||||
   /    \                       |||||||||||||||
  /      \                      |||||||||||||||
```

**FFT Output:**
- Array of frequency bins (512 bins for fftSize=1024)
- Each bin represents a frequency range
- Values: 0-255 (8-bit unsigned integers)
- Index 0 = 0Hz, Index 511 = Nyquist frequency (sampleRate/2)

#### 4. **Frequency Band Extraction**
```javascript
// Calculate which array indices correspond to Hz ranges
const hzPerBin = sampleRate / fftSize  // e.g., 44100/1024 ≈ 43 Hz/bin

// Low: 20-250 Hz (bass, kick drum, sub-bass)
lowStart = Math.floor(20 / hzPerBin)    // ≈ bin 0
lowEnd   = Math.floor(250 / hzPerBin)   // ≈ bin 5

// Mid: 250-2000 Hz (vocals, snare, instruments)
midStart = bin 5
midEnd   = Math.floor(2000 / hzPerBin)  // ≈ bin 46

// High: 2000-22050 Hz (hi-hats, cymbals, detail)
highStart = bin 46
highEnd   = bin 511
```

#### 5. **Band Analysis**
```javascript
// Average values in each range
lowAvg  = average(frequencyArray, lowStart, lowEnd)
midAvg  = average(frequencyArray, midStart, midEnd)
highAvg = average(frequencyArray, highStart, highEnd)

// Normalize to 0-1 range
low  = lowAvg / 255   // e.g., 0.65
mid  = midAvg / 255   // e.g., 0.42
high = highAvg / 255  // e.g., 0.18
```

#### 6. **Smoothing (Optional but Recommended)**
```javascript
// Exponential moving average
smoothed = previous * 0.7 + current * 0.3

// WHY: Raw FFT is jittery
// Before: 0.2 → 0.8 → 0.3 → 0.9  (jarring)
// After:  0.2 → 0.38 → 0.36 → 0.52 (smooth)
```

#### 7. **Visual Mapping**
```javascript
// Map audio data to shader uniforms
uniforms.amplitude.value = 0.8 + high * 0.4  // 0.8 - 1.2
uniforms.offsetGain.value = mid * 0.6         // 0.0 - 0.6
timeIncrement = low * 0.5                     // Animation speed
```

#### 8. **GPU Rendering**
```glsl
// Vertex Shader: Calculate particle position
vec3 displacement = curl(position * frequency) * amplitude
newPosition = position + displacement

// Fragment Shader: Calculate color
color = mix(startColor, endColor, displacement_amount)
```

---

## 🎵 Audio Analysis Deep Dive

### Understanding FFT

**What is FFT?**
- Algorithm that converts time-domain signal to frequency-domain
- Identifies which frequencies are present and their amplitudes
- Named "Fast" because it's optimized (O(n log n) vs O(n²))

**FFT Size:**
```javascript
fftSize = 1024  // Must be power of 2: 256, 512, 1024, 2048, 4096

Output bins = fftSize / 2  // 512 bins

// Each bin represents:
Hz per bin = sampleRate / fftSize
           = 44100 / 1024
           = 43.066 Hz per bin
```

**Trade-offs:**
- **Larger FFT:**
  - ✅ Better frequency resolution
  - ❌ More CPU intensive
  - ❌ Slower response time

- **Smaller FFT:**
  - ✅ Faster processing
  - ✅ More responsive
  - ❌ Lower frequency resolution

### Frequency Bands Explained

#### Low Frequencies (20-250 Hz) - BASS
**What's in this range:**
- Kick drum: 50-100 Hz
- Sub-bass: 20-60 Hz
- Bass guitar: 40-250 Hz

**Perceptual qualities:**
- Physical/visceral feeling
- "Punch" and "impact"
- Room-shaking energy

**Visual mapping:**
- **BEST FOR:** Scale, amplitude, overall energy
- **WHY:** Low frequencies = power → big movements feel natural

**Example mapping:**
```javascript
// Particle scale multiplier
scale = 1.0 + low * 0.5  // 1.0x - 1.5x size when bass hits

// Camera shake
cameraShake = low * 0.1

// Background brightness
brightness = 0.5 + low * 0.5
```

#### Mid Frequencies (250-2000 Hz) - BODY
**What's in this range:**
- Vocals: 300-3000 Hz
- Snare drum: 200-400 Hz (fundamental), 1-5 kHz (snap)
- Most musical instruments
- Speech intelligibility

**Perceptual qualities:**
- Where most musical content lives
- Emotional/melodic content
- "Warmth" of sound

**Visual mapping:**
- **BEST FOR:** Movement, flow, position offsets
- **WHY:** Mids have detail → good for organic motion

**Example mapping:**
```javascript
// Particle depth pulsing
zOffset = sin(time) * mid * 0.2

// Color transitions
colorMix = mid  // Smoothly shift between colors

// Rotation speed
rotationSpeed = mid * 0.05
```

#### High Frequencies (2000-20000 Hz) - DETAIL
**What's in this range:**
- Hi-hats: 5-12 kHz
- Cymbals: 1-20 kHz
- "Air" and "brightness": 10-20 kHz
- Sibilance (S sounds): 4-8 kHz

**Perceptual qualities:**
- Crispness and clarity
- Attack and transients
- "Sparkle" and "shine"

**Visual mapping:**
- **BEST FOR:** Particle displacement, brightness, detail
- **WHY:** Highs = detail → drives complex movement patterns

**Example mapping:**
```javascript
// Curl noise amplitude (particle displacement)
amplitude = 0.8 + high * 0.4  // More treble = more movement

// Particle brightness
brightness = 0.5 + high * 0.5

// Detail level
noiseFrequency = 2.0 + high * 2.0  // More detail when trebly
```

---

## 🎨 Visual Mapping Philosophy

### The Art of Audio-Visual Correspondence

**Core Principle:** 
*Different frequency bands should drive visually distinct parameters*

**Why?**
- Creates synesthesia-like experience
- Different music genres feel unique
- User can "see" the music structure

### Genre-Specific Behavior

#### Bass-Heavy Music (EDM, Hip-Hop, Dubstep)
```javascript
Features:
- Low: 0.8-1.0 (very high)
- Mid: 0.3-0.5 (moderate)
- High: 0.2-0.4 (low)

Visual result:
- LARGE scale changes (impactful)
- Moderate movement (flow)
- Subtle detail (smooth surfaces)
- Feels: POWERFUL, PHYSICAL
```

#### Vocal/Acoustic (Pop, Folk, Singer-Songwriter)
```javascript
Features:
- Low: 0.2-0.4 (low)
- Mid: 0.6-0.9 (very high)
- High: 0.3-0.5 (moderate)

Visual result:
- Subtle scale (gentle)
- FLUID movement (expressive)
- Moderate detail
- Feels: EMOTIONAL, ORGANIC
```

#### Electronic/Ambient (Techno, Trance, Ambient)
```javascript
Features:
- Low: 0.5-0.7 (moderate-high)
- Mid: 0.4-0.6 (moderate)
- High: 0.6-0.9 (very high)

Visual result:
- Moderate scale
- Smooth movement
- HIGHLY DETAILED (complex patterns)
- Feels: INTRICATE, SPACEY
```

---

## ⚡ Performance Optimizations

### 1. **GPU Acceleration**
```javascript
// ✅ GOOD: Shader-based animation (GPU)
- All particles updated in parallel on GPU
- Can handle 100,000+ particles at 60fps

// ❌ BAD: CPU-based animation
- Each particle updated individually
- Limited to ~1,000 particles before lag
```

### 2. **Memory Management**
```javascript
// Always dispose Three.js resources
cleanup() {
  geometry.dispose()
  material.dispose()
  renderer.dispose()
}
```

### 3. **Avoid Unnecessary Updates**
```javascript
// Only update uniforms when needed
if (audioManager.isPlaying) {
  material.uniforms.amplitude.value = calculateAmplitude()
}
```

### 4. **Throttle Heavy Operations**
```javascript
// Don't recreate geometry every frame
// Store and reuse when possible
```

### 5. **Adaptive Quality**
```javascript
// Reduce particle count on mobile
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent)
const particleCount = isMobile ? 20000 : 50000
```

---

## 🌐 Browser Compatibility

### Web Audio API Support
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support (with caveats)
- ❌ IE: Not supported

### Safari/iOS Specific Issues

**1. AudioContext Autoplay Policy**
```javascript
// iOS requires user gesture to start AudioContext
const handleUserClick = async () => {
  if (audioContext.state === 'suspended') {
    await audioContext.resume()
  }
}
```

**2. CORS with Audio**
```javascript
// Must set crossOrigin before setting src
audio.crossOrigin = 'anonymous'
audio.src = trackUrl
```

**3. Mobile Limitations**
- Lower sample rate (often 44.1kHz → 48kHz)
- Performance constraints
- Battery considerations

---

## 🐛 Troubleshooting

### Issue: No visualization appearing
**Causes:**
1. AudioContext not initialized (requires user gesture)
2. CORS blocking audio analysis
3. Audio element not connected

**Solutions:**
```javascript
// 1. Check AudioContext state
console.log(audioContext.state)  // Should be 'running'

// 2. Add crossOrigin attribute
audio.crossOrigin = 'anonymous'

// 3. Verify connection chain
console.log(audioSource.numberOfOutputs)  // Should be > 0
```

### Issue: Particles not reacting to audio
**Causes:**
1. Audio not playing
2. Animation loop not running
3. Uniforms not updating

**Debug:**
```javascript
// Check if audio data is flowing
console.log(audioManager.getFrequencyData())
// Should show changing values

// Check if uniforms update
console.log(material.uniforms.amplitude.value)
// Should change with music
```

### Issue: Performance problems
**Solutions:**
1. Reduce particle count
2. Lower FFT size
3. Disable anti-aliasing
4. Use simpler geometry

---

## 📁 Project Structure

```
d:\pegasus\
├── src/
│   ├── audio/
│   │   └── AudioManager.js          # Core audio analysis
│   ├── api/
│   │   └── MusicAPI.md              # API integration guide
│   ├── components/
│   │   ├── Hero.jsx                 # Landing section
│   │   ├── ParticleVisualizer.jsx   # Three.js visualizer
│   │   ├── MusicSearch.jsx          # Search UI
│   │   ├── Button.jsx               # Reusable button
│   │   └── VideoPreview.jsx         # Video component
│   ├── shaders/
│   │   ├── particles.vert.js        # Vertex shader
│   │   └── particles.frag.js        # Fragment shader
│   ├── App.jsx                      # Main app component
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Global styles
├── public/
│   ├── videos/                      # Video assets
│   └── fonts/                       # Custom fonts
└── package.json
```

---

## 🎓 Key Takeaways

1. **Audio → Visuals Pipeline:**
   - Audio → Web Audio API → FFT → Frequency Bands → Visual Parameters

2. **Frequency Band Mapping:**
   - Low → Scale/Power
   - Mid → Movement/Flow
   - High → Detail/Brightness

3. **Performance:**
   - Use GPU (shaders) not CPU
   - Dispose resources properly
   - Adapt to device capabilities

4. **Browser Constraints:**
   - Always require user interaction for audio
   - Handle CORS properly
   - Test on mobile Safari

5. **Production Ready:**
   - Modular, documented code
   - Error handling
   - Performance monitoring
   - Graceful degradation

---

Generated: January 3, 2026
