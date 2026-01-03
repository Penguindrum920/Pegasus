/**
 * Music Search Integration
 * 
 * Uses public music sources that don't require API keys
 */

// Demo tracks with working URLs (no API needed)
const PUBLIC_TRACKS = [
  {
    id: 'demo-1',
    title: 'Electronic Energy',
    artist: 'SoundHelix',
    duration: 180,
    artwork: null,
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    genre: 'Electronic',
    playbackCount: 0,
  },
  {
    id: 'demo-2',
    title: 'Ambient Flow',
    artist: 'SoundHelix',
    duration: 200,
    artwork: null,
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    genre: 'Ambient',
    playbackCount: 0,
  },
  {
    id: 'demo-3',
    title: 'Bass Heavy',
    artist: 'SoundHelix',
    duration: 195,
    artwork: null,
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    genre: 'Bass',
    playbackCount: 0,
  },
  {
    id: 'demo-4',
    title: 'Upbeat Melody',
    artist: 'SoundHelix',
    duration: 210,
    artwork: null,
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    genre: 'Pop',
    playbackCount: 0,
  },
  {
    id: 'demo-5',
    title: 'Chill Vibes',
    artist: 'SoundHelix',
    duration: 190,
    artwork: null,
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    genre: 'Chill',
    playbackCount: 0,
  },
  {
    id: 'demo-6',
    title: 'Dynamic Rhythms',
    artist: 'SoundHelix',
    duration: 205,
    artwork: null,
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    genre: 'Electronic',
    playbackCount: 0,
  },
];

/**
 * Search for tracks (uses local demo tracks)
 * @param {string} query - Search query
 * @param {number} limit - Number of results (default 20)
 * @returns {Promise<Array>} Array of track objects
 */
export async function searchSoundCloudTracks(query, limit = 20) {
  if (!query || query.trim() === '') {
    return PUBLIC_TRACKS;
  }

  // Filter demo tracks based on query
  const filtered = PUBLIC_TRACKS.filter(track => 
    track.title.toLowerCase().includes(query.toLowerCase()) ||
    track.artist.toLowerCase().includes(query.toLowerCase()) ||
    track.genre.toLowerCase().includes(query.toLowerCase())
  );

  return filtered.length > 0 ? filtered : PUBLIC_TRACKS;
}

/**
 * Get actual stream URL (not needed for demo tracks)
 * @param {string} url - Stream URL
 * @returns {Promise<string>} Direct stream URL
 */
export async function getStreamUrl(url) {
  // For demo tracks, URL is already direct
  return url;
}
