# 🎵 Audio Troubleshooting Guide

## Quick Audio Check

After clicking "Click to Enter", open your browser console (F12) and look for these messages:

```
[App] 🎵 User clicked - initializing audio system...
[App] ✅ AudioContext initialized
[App] ✅ Audio file loaded - Duration: XX.XX seconds
[App] ▶️ Starting playback...
[App] 🔊 AUDIO IS NOW PLAYING!
```

If you see all these messages, audio **should** be working!

---

## Common Issues & Solutions

### 1. ❌ No Sound at All

**Check:**
- **Volume Control:** Look for the volume slider on the page after clicking "Enter"
- **System Volume:** Check Windows volume mixer (right-click speaker icon in taskbar)
- **Browser Volume:** Check if the browser tab is muted (look for speaker icon on tab)
- **Headphones/Speakers:** Ensure they're plugged in and set as default audio device

**Test:**
```
Open browser console (F12) and type:
document.querySelector('audio')?.volume
```
Should return `0.7`. If it returns `0`, that's your problem!

---

### 2. 🔇 "Audio is Playing" but Can't Hear It

**Solution A - Check Browser Permissions:**
1. Click the padlock/info icon in the address bar
2. Ensure "Sound" is set to "Allow"
3. Refresh the page

**Solution B - AudioContext Suspended:**
Open console and check:
```javascript
// Should show "running", not "suspended"
audioManager.audioContext.state
```

If "suspended", the browser blocked it. Try:
1. Refresh the page
2. Click "Enter" again
3. Check for browser notifications asking for permission

---

### 3. ⚠️ Console Shows Audio Errors

**Error: "Failed to load audio"**
- Check file exists: `http://localhost:5175/audio/default-track.mp3`
- Visit that URL directly in your browser
- If 404: The file isn't in the right location

**Error: "CORS policy"**
- The `crossOrigin="anonymous"` should handle this
- If using external URLs, the server must allow CORS

**Error: "NotAllowedError: play() failed"**
- Browser autoplay policy blocked it
- You MUST click "Enter" button first
- Some browsers are stricter than others

---

### 4. 🎛️ Adjusting Volume

**From the UI:**
- Look for the volume slider below the music search
- Drag it to increase/decrease volume

**From Console:**
```javascript
// Set to 100% volume
audioManager.setVolume(1.0);

// Set to 50% volume
audioManager.setVolume(0.5);
```

---

### 5. 🔄 Audio Not Looping

The default track is set to loop automatically. If it stops:

```javascript
// From console:
audioManager.audioElement.loop = true;
audioManager.play();
```

---

## Testing Different Browsers

Audio support varies by browser:

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Excellent | Requires user interaction |
| Edge | ✅ Excellent | Same as Chrome (Chromium) |
| Firefox | ✅ Good | May need permissions |
| Safari | ⚠️ Partial | Stricter autoplay policies |

**Recommendation:** Use Chrome or Edge for best experience.

---

## Manual Audio Test

If automatic playback fails, try playing manually:

1. After clicking "Enter", open console (F12)
2. Type:
```javascript
audioManager.audioElement.play()
```
3. Press Enter

If you hear sound now, the issue is with automatic playback in your browser.

---

## Verify Particles Are Reacting

Even if you can't hear audio, particles should still animate. Look for:

- **No Music:** Particles are static/slowly drifting
- **With Music:** Particles pulse, scale, and move dramatically

To test particle reactivity without audio issues:
```javascript
// Simulate audio data
setInterval(() => {
  audioManager.frequencyData = {
    low: Math.random(),
    mid: Math.random(),
    high: Math.random()
  };
}, 50);
```

---

## Audio File Format Check

Your default track should be:
- **Format:** MP3
- **Location:** `d:\pegasus\public\audio\default-track.mp3`
- **Size:** ~5MB (valid)
- **Accessible at:** `http://localhost:5175/audio/default-track.mp3`

To verify:
1. Open: `http://localhost:5175/audio/default-track.mp3` in browser
2. Should download or play directly
3. If 404: File is not in public folder

---

## Advanced Debugging

**Check AudioContext State:**
```javascript
console.log("AudioContext:", audioManager.audioContext.state);
console.log("Sample Rate:", audioManager.audioContext.sampleRate);
console.log("Current Time:", audioManager.audioContext.currentTime);
```

**Check Audio Element State:**
```javascript
const audio = audioManager.audioElement;
console.log("Paused:", audio.paused);
console.log("Current Time:", audio.currentTime);
console.log("Duration:", audio.duration);
console.log("Volume:", audio.volume);
console.log("Muted:", audio.muted);
console.log("Ready State:", audio.readyState);
```

**Check Frequency Data:**
```javascript
// Should show real-time audio analysis
setInterval(() => {
  console.log(audioManager.getFrequencyData());
}, 1000);
```

---

## Still No Sound?

### Last Resort Solutions:

1. **Hard Refresh:**
   - Press `Ctrl + Shift + R` (Windows/Linux)
   - Press `Cmd + Shift + R` (Mac)

2. **Clear Browser Cache:**
   - `Ctrl + Shift + Delete`
   - Clear "Cached files"
   - Reload page

3. **Try Incognito/Private Mode:**
   - Extensions might be blocking audio
   - `Ctrl + Shift + N` (Chrome/Edge)

4. **Check Windows Sound Settings:**
   - Open "Sound Settings"
   - Ensure browser isn't muted in Volume Mixer
   - Check "App volume and device preferences"

5. **Test with Demo Tracks:**
   - After clicking "Enter", search for tracks
   - Try playing "Electronic Energy" or "Ambient Flow"
   - These are external URLs (might have better success)

---

## Expected Console Output (Success)

```
[App] 🎵 User clicked - initializing audio system...
[AudioManager] Initialized successfully
[AudioManager] Sample Rate: 48000Hz
[AudioManager] FFT Size: 1024
[AudioManager] Frequency Bins: 512
[App] ✅ AudioContext initialized
[AudioManager] Audio loaded and connected
[App] 🎵 Loading audio into AudioManager...
[App] ▶️ Starting playback...
[App] ✅ Audio file loaded - Duration: 123.45 seconds
[AudioManager] Playback started
[App] 🔊 AUDIO IS NOW PLAYING!
[App] === AUDIO STATUS CHECK ===
  Volume: 0.7
  Paused: false
  Current Time: 1.23
  Duration: 123.45
  AudioContext State: running
  Is Playing: true
=============================
[App] ✅ Setup complete!
```

---

## Contact & Support

If you've tried everything and still no sound:

1. Check console output carefully
2. Note any error messages
3. Try different audio file
4. Test in different browser

The audio system is working correctly in code - most issues are browser/system configuration related.

---

## Quick Fixes Summary

| Issue | Fix |
|-------|-----|
| No sound | Check volume slider + system volume |
| Audio suspended | Click "Enter" button |
| File not found | Check `public/audio/` folder |
| CORS error | Should not happen with local files |
| Autoplay blocked | User interaction required (already implemented) |

**Most Common Fix:** Just increase the volume slider! 🔊
