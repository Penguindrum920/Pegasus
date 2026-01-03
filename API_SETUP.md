# Music Streaming API Setup Guide

This guide covers how to integrate music streaming services into your audio visualizer.

## 🎵 No API Keys Required (Current Setup)

Your current implementation uses:
- **Local MP3 files** - No API needed, works immediately
- **Direct MP3 URLs** - SoundHelix demo tracks (free, no authentication)

This is the simplest approach and **requires no setup**.

---

## 🌐 Adding Music Streaming APIs (Optional)

If you want to search and play tracks from major streaming services, here's what you need:

### 1. Spotify Web API

**Best For:** Largest music catalog, 30-second previews  
**Complexity:** Medium (requires backend for token refresh)

#### Setup Steps:
1. Go to https://developer.spotify.com/dashboard
2. Create a new app
3. Note your **Client ID** and **Client Secret**
4. Add redirect URI: `http://localhost:5175/callback`

#### Installation:
```bash
npm install spotify-web-api-js
```

#### Implementation:
```javascript
import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();

// Get access token (requires backend or PKCE flow)
const getSpotifyToken = async () => {
  // Using PKCE (recommended for client-side)
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=streaming`;
  window.location = authUrl;
};

// Search for tracks
const searchTracks = async (query) => {
  const results = await spotifyApi.searchTracks(query, { limit: 10 });
  return results.tracks.items.map(track => ({
    id: track.id,
    title: track.name,
    artist: track.artists[0].name,
    previewUrl: track.preview_url, // 30-second preview
    albumArt: track.album.images[0]?.url,
  }));
};
```

**Limitations:**
- Only 30-second previews available
- Requires user authentication
- Rate limits apply

---

### 2. SoundCloud API

**Best For:** Independent artists, full track streaming  
**Complexity:** Low (direct client integration)

#### Setup Steps:
1. Go to https://soundcloud.com/you/apps/new
2. Create a new app
3. Note your **Client ID**

#### Installation:
```bash
npm install soundcloud
```

#### Implementation:
```javascript
import SC from 'soundcloud';

// Initialize with your client ID
SC.initialize({
  client_id: 'YOUR_CLIENT_ID'
});

// Search for tracks
const searchTracks = async (query) => {
  const tracks = await SC.get('/tracks', {
    q: query,
    limit: 10
  });
  
  return tracks.map(track => ({
    id: track.id,
    title: track.title,
    artist: track.user.username,
    streamUrl: `${track.stream_url}?client_id=${CLIENT_ID}`,
    waveformUrl: track.waveform_url,
    duration: track.duration,
  }));
};
```

**Limitations:**
- Some tracks may not be streamable
- CORS issues may require backend proxy

---

### 3. YouTube Data API v3

**Best For:** Widest availability, music videos  
**Complexity:** Medium (requires backend for audio extraction)

#### Setup Steps:
1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable "YouTube Data API v3"
4. Create credentials → API Key
5. Restrict key to your domain

#### Installation:
```bash
npm install axios
```

#### Implementation:
```javascript
import axios from 'axios';

const YOUTUBE_API_KEY = 'YOUR_API_KEY';

// Search for music videos
const searchYouTube = async (query) => {
  const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
    params: {
      part: 'snippet',
      q: query + ' music',
      type: 'video',
      videoCategoryId: '10', // Music category
      maxResults: 10,
      key: YOUTUBE_API_KEY,
    }
  });
  
  return response.data.items.map(item => ({
    id: item.id.videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.medium.url,
    // Note: Requires backend to extract audio stream
  }));
};
```

**Important Notes:**
- Cannot directly stream audio (requires backend with ytdl-core or similar)
- Rate limits: 10,000 units/day (search costs 100 units)
- Terms of Service restrict audio extraction

---

### 4. Free Music Archive (FMA)

**Best For:** Royalty-free music, no authentication  
**Complexity:** Low (direct downloads)

No API key needed! Visit https://freemusicarchive.org/

```javascript
// Example track URLs (can download and use freely)
const fmaTracks = [
  {
    title: "Epic Adventure",
    artist: "FMA Artist",
    streamUrl: "https://freemusicarchive.org/track/XXXXX/stream",
  }
];
```

---

## 🔧 Recommended Approach for Your Project

Since you want immediate functionality without API complexity:

### Option 1: Local MP3 Files (Current - No Setup Required)
✅ **Pros:** Works immediately, no rate limits, no authentication  
❌ **Cons:** Limited catalog, manual file management

### Option 2: SoundCloud (Easiest API)
✅ **Pros:** Simple setup, full streaming, large catalog  
❌ **Cons:** Requires API key, some CORS issues

### Option 3: Spotify (Best Catalog)
✅ **Pros:** Huge catalog, great metadata  
❌ **Cons:** Only 30s previews, complex auth, needs backend

---

## 🚀 Current Working Demo

Your app already works with these sources:

1. **Default Track:** `/audio/default-track.mp3` (Fallen Rosemary Theme)
2. **Demo Tracks:** SoundHelix MP3s (no API needed)
   - Electronic Energy
   - Ambient Flow  
   - Bass Heavy

These play immediately with full Web Audio API analysis. **No additional setup required.**

---

## 🔐 Environment Variables (If Using APIs)

Create `.env` file in project root:

```env
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_SOUNDCLOUD_CLIENT_ID=your_client_id_here
VITE_YOUTUBE_API_KEY=your_api_key_here
```

Access in code:
```javascript
const spotifyClientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
```

---

## 📊 Rate Limits Summary

| Service | Free Tier | Limits |
|---------|-----------|--------|
| Spotify | ✅ Yes | 30s previews, auth required |
| SoundCloud | ✅ Yes | 15,000 requests/day |
| YouTube | ✅ Yes | 10,000 units/day |
| Local Files | ✅ Yes | Unlimited |

---

## 🎯 Quick Start Recommendation

**For immediate use without APIs:**

1. Add more MP3 files to `d:\pegasus\public\audio\`
2. Update `MusicSearch.jsx` with local track references:

```javascript
const localTracks = [
  {
    id: '1',
    title: 'Fallen Rosemary Theme',
    artist: 'Local',
    streamUrl: '/audio/default-track.mp3',
  },
  {
    id: '2',
    title: 'Your Track 2',
    artist: 'Local',
    streamUrl: '/audio/track2.mp3',
  },
];
```

This requires **zero setup** and works instantly!

---

## ❓ Need Help?

- Spotify API Docs: https://developer.spotify.com/documentation/web-api
- SoundCloud API Docs: https://developers.soundcloud.com/docs/api
- YouTube API Docs: https://developers.google.com/youtube/v3

Choose the approach that matches your needs and technical requirements.
