/**
 * Spotify API Integration
 * 
 * This module handles authentication and search with Spotify Web API
 */

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

let accessToken = null;
let tokenExpirationTime = null;

/**
 * Get Spotify access token using Client Credentials Flow
 * This is the simplest method but only provides 30-second previews
 */
async function getAccessToken() {
  // Return cached token if still valid
  if (accessToken && tokenExpirationTime && Date.now() < tokenExpirationTime) {
    return accessToken;
  }

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Spotify API credentials not configured. Check .env file.');
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET)
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new Error(`Spotify auth failed: ${response.status}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpirationTime = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min early

    console.log('[Spotify] Access token obtained');
    return accessToken;
  } catch (error) {
    console.error('[Spotify] Authentication error:', error);
    throw error;
  }
}

/**
 * Search for tracks on Spotify
 * @param {string} query - Search query
 * @param {number} limit - Number of results (default 20)
 * @returns {Promise<Array>} Array of track objects
 */
export async function searchSpotifyTracks(query, limit = 20) {
  if (!query || query.trim() === '') {
    return [];
  }

  try {
    const token = await getAccessToken();

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify search failed: ${response.status}`);
    }

    const data = await response.json();

    // Transform Spotify data to our format
    return data.tracks.items.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      album: track.album.name,
      duration: Math.floor(track.duration_ms / 1000),
      artwork: track.album.images[0]?.url || null,
      previewUrl: track.preview_url, // 30-second preview
      streamUrl: track.preview_url,  // Same as preview for free tier
      spotifyUrl: track.external_urls.spotify,
    })).filter(track => track.previewUrl); // Only include tracks with previews

  } catch (error) {
    console.error('[Spotify] Search error:', error);
    throw error;
  }
}

/**
 * Get track by ID
 * @param {string} trackId - Spotify track ID
 * @returns {Promise<Object>} Track object
 */
export async function getSpotifyTrack(trackId) {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `https://api.spotify.com/v1/tracks/${trackId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify track fetch failed: ${response.status}`);
    }

    const track = await response.json();

    return {
      id: track.id,
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      album: track.album.name,
      duration: Math.floor(track.duration_ms / 1000),
      artwork: track.album.images[0]?.url || null,
      previewUrl: track.preview_url,
      streamUrl: track.preview_url,
      spotifyUrl: track.external_urls.spotify,
    };

  } catch (error) {
    console.error('[Spotify] Track fetch error:', error);
    throw error;
  }
}
