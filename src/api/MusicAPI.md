/**
 * MUSIC API INTEGRATION GUIDE
 * 
 * ============================================
 * API OPTIONS & COMPARISON
 * ============================================
 * 
 * 1. SPOTIFY WEB API (RECOMMENDED)
 *    Pros:
 *    - Largest music catalog (80+ million tracks)
 *    - 30-second preview URLs for all tracks
 *    - Well-documented REST API
 *    - Official SDK available
 *    - Free tier available
 *    
 *    Cons:
 *    - Preview URLs only (30s clips)
 *    - Full playback requires Spotify Premium + Web Playback SDK
 *    - CORS restrictions require backend proxy
 *    
 *    Best for: Preview-based visualizer with option for full playback
 * 
 * 2. SOUNDCLOUD API
 *    Pros:
 *    - Many user-uploaded tracks
 *    - Stream URLs available
 *    - Good for independent artists
 *    
 *    Cons:
 *    - API access limited (registration closed)
 *    - Unofficial APIs unreliable
 *    - CORS issues
 *    
 *    Best for: If you have existing API access
 * 
 * 3. YOUTUBE DATA API
 *    Pros:
 *    - Massive library
 *    - Free API access
 *    - YouTube Player API for playback
 *    
 *    Cons:
 *    - Video focus (audio-only harder)
 *    - Terms of Service restrictions on audio extraction
 *    - Player controls limited
 *    
 *    Best for: Video-based content
 * 
 * 4. DEEZER API
 *    Pros:
 *    - Large catalog
 *    - Preview URLs (30s)
 *    - No authentication for search
 *    
 *    Cons:
 *    - Geographic restrictions
 *    - Preview only for most regions
 *    
 *    Best for: European markets
 * 
 * 5. JAMENDO API
 *    Pros:
 *    - Full track streaming
 *    - Creative Commons music
 *    - No authentication needed
 *    
 *    Cons:
 *    - Smaller catalog
 *    - Limited mainstream content
 *    
 *    Best for: Open-source projects, CC music
 * 
 * ============================================
 * RECOMMENDED APPROACH: SPOTIFY WEB API
 * ============================================
 */

// ============================================
// BACKEND SETUP (Node.js + Express)
// ============================================

/**
 * Install dependencies:
 * npm install express cors axios dotenv
 * 
 * Create .env file:
 * SPOTIFY_CLIENT_ID=your_client_id
 * SPOTIFY_CLIENT_SECRET=your_client_secret
 */

/**
 * server.js - Backend API proxy for Spotify
 * 
 * WHY BACKEND NEEDED:
 * - Spotify API requires authentication
 * - Client secret must not be exposed in frontend
 * - CORS restrictions on Spotify endpoints
 * - Backend acts as secure proxy
 */

/*
const express = require('express')
const cors = require('cors')
const axios = require('axios')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

// Spotify credentials
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

// In-memory token cache
let accessToken = null
let tokenExpiry = 0

// Get Spotify access token
async function getSpotifyToken() {
  // Return cached token if still valid
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken
  }
  
  // Request new token
  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    'grant_type=client_credentials',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
      }
    }
  )
  
  accessToken = response.data.access_token
  tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000 // Refresh 1 min early
  
  return accessToken
}

// Search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query
    
    if (!q || q.trim().length < 2) {
      return res.json({ tracks: [] })
    }
    
    const token = await getSpotifyToken()
    
    const response = await axios.get('https://api.spotify.com/v1/search', {
      params: {
        q: q,
        type: 'track',
        limit: 20
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    // Transform Spotify response to our format
    const tracks = response.data.tracks.items.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      album: track.album.name,
      duration: Math.floor(track.duration_ms / 1000),
      artwork: track.album.images[0]?.url || null,
      previewUrl: track.preview_url, // 30-second preview MP3
      spotifyUrl: track.external_urls.spotify,
    }))
    
    res.json({ tracks })
    
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ error: 'Search failed' })
  }
})

// Get track details
app.get('/api/track/:id', async (req, res) => {
  try {
    const { id } = req.params
    const token = await getSpotifyToken()
    
    const response = await axios.get(`https://api.spotify.com/v1/tracks/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const track = response.data
    
    res.json({
      id: track.id,
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      album: track.album.name,
      duration: Math.floor(track.duration_ms / 1000),
      artwork: track.album.images[0]?.url || null,
      previewUrl: track.preview_url,
      spotifyUrl: track.external_urls.spotify,
    })
    
  } catch (error) {
    console.error('Track fetch error:', error)
    res.status(500).json({ error: 'Track fetch failed' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`)
})
*/

// ============================================
// FRONTEND INTEGRATION
// ============================================

/**
 * API client for frontend
 * Replace the mock searchMusicAPI function with this
 */

export class MusicAPIClient {
  constructor(baseURL = 'http://localhost:3001/api') {
    this.baseURL = baseURL
  }
  
  /**
   * Search for tracks
   */
  async search(query) {
    try {
      const response = await fetch(`${this.baseURL}/search?q=${encodeURIComponent(query)}`)
      
      if (!response.ok) {
        throw new Error('Search failed')
      }
      
      const data = await response.json()
      return data.tracks
      
    } catch (error) {
      console.error('[MusicAPI] Search error:', error)
      return []
    }
  }
  
  /**
   * Get track details by ID
   */
  async getTrack(id) {
    try {
      const response = await fetch(`${this.baseURL}/track/${id}`)
      
      if (!response.ok) {
        throw new Error('Track fetch failed')
      }
      
      return await response.json()
      
    } catch (error) {
      console.error('[MusicAPI] Track fetch error:', error)
      return null
    }
  }
}

// ============================================
// ALTERNATIVE: CLIENT-ONLY (JAMENDO API)
// ============================================

/**
 * No backend needed - public API
 * Free, open music, full streaming
 */

export class JamendoAPIClient {
  constructor() {
    this.baseURL = 'https://api.jamendo.com/v3.0'
    this.clientId = 'your_jamendo_client_id' // Get free at https://devportal.jamendo.com/
  }
  
  async search(query) {
    try {
      const response = await fetch(
        `${this.baseURL}/tracks/?client_id=${this.clientId}&format=json&limit=20&search=${encodeURIComponent(query)}&include=musicinfo+licenses`
      )
      
      const data = await response.json()
      
      return data.results.map(track => ({
        id: track.id,
        title: track.name,
        artist: track.artist_name,
        duration: track.duration,
        artwork: track.album_image,
        streamUrl: track.audio, // Full track streaming!
        previewUrl: track.audiodownload_allowed ? track.audio : null,
      }))
      
    } catch (error) {
      console.error('[Jamendo] Search error:', error)
      return []
    }
  }
}

// ============================================
// CORS & SECURITY CONSIDERATIONS
// ============================================

/**
 * ISSUES:
 * 1. CORS: Many APIs block requests from browsers
 * 2. API Keys: Must not be exposed in frontend code
 * 3. Rate Limiting: Need to cache/throttle requests
 * 4. DRM: Some services protect audio streams
 * 
 * SOLUTIONS:
 * 1. Backend Proxy: Route API calls through your server
 * 2. Environment Variables: Store secrets securely
 * 3. Caching: Store tokens and reduce API calls
 * 4. Use preview URLs: Most services allow these
 */

// ============================================
// MOBILE & BROWSER CONSIDERATIONS
// ============================================

/**
 * AUTOPLAY POLICY:
 * - Modern browsers block autoplay until user interaction
 * - Audio must start from user gesture (click, tap)
 * - Solution: Show "Click to start" overlay
 * 
 * IOS SAFARI:
 * - Requires user interaction for AudioContext
 * - Must call audioContext.resume() on gesture
 * - Some APIs don't work (check compatibility)
 * 
 * EXAMPLE:
 */

export function requireUserInteraction(onInteraction) {
  const overlay = document.createElement('div')
  overlay.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.8); display: flex; align-items: center; 
                justify-content: center; z-index: 10000; cursor: pointer;">
      <div style="text-align: center; color: white;">
        <h2>Click to Start</h2>
        <p>Audio requires user interaction</p>
      </div>
    </div>
  `
  
  overlay.addEventListener('click', () => {
    document.body.removeChild(overlay)
    onInteraction()
  })
  
  document.body.appendChild(overlay)
}

// ============================================
// USAGE EXAMPLE
// ============================================

/*
// In your main component:

import { MusicAPIClient } from './api/MusicAPI'
import AudioManager from './audio/AudioManager'
import ParticleVisualizer from './components/ParticleVisualizer'
import MusicSearch from './components/MusicSearch'

function App() {
  const [audioManager] = useState(() => new AudioManager())
  const [musicAPI] = useState(() => new MusicAPIClient())
  const [isReady, setIsReady] = useState(false)
  
  const handleUserInteraction = async () => {
    await audioManager.initialize()
    setIsReady(true)
  }
  
  const handleTrackSelect = async (track) => {
    // Create audio element
    const audio = new Audio(track.previewUrl || track.streamUrl)
    audio.crossOrigin = 'anonymous' // Required for CORS
    audio.loop = true
    
    // Load into audio manager
    audioManager.loadAudio(audio)
    
    // Start playback
    await audioManager.play()
  }
  
  useEffect(() => {
    requireUserInteraction(handleUserInteraction)
  }, [])
  
  return (
    <>
      {isReady && <ParticleVisualizer audioManager={audioManager} />}
      <MusicSearch 
        onTrackSelect={handleTrackSelect}
        audioManager={audioManager}
        apiClient={musicAPI}
      />
    </>
  )
}
*/
