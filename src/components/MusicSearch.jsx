/**
 * MusicSearch - Music Selection Interface
 * 
 * PURPOSE:
 * Provides UI for searching and selecting music tracks that will drive the visualizer.
 * Integrates with streaming APIs to access a wide variety of music.
 * 
 * FEATURES:
 * - Real-time search with debouncing
 * - Track preview playback
 * - Visual feedback for selected/playing tracks
 * - Mobile-responsive design
 * 
 * PROPS:
 * - onTrackSelect: Callback when user selects a track
 * - audioManager: Audio manager instance for preview playback
 */

import { useState, useEffect, useRef } from 'react'
import { FaSearch, FaPlay, FaPause, FaMusic } from 'react-icons/fa'
import { searchSoundCloudTracks, getStreamUrl } from '../api/soundcloud'

export default function MusicSearch({ onTrackSelect, audioManager, defaultTracks = [] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState(null)
  const [previewingTrack, setPreviewingTrack] = useState(null)
  const searchTimeoutRef = useRef(null)
  const [showDefaultTracks, setShowDefaultTracks] = useState(true)
  
  /**
   * Handle search input with debouncing
   * WHY: Prevents excessive API calls while user is typing
   */
  const handleSearchInput = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // Debounce: Wait 500ms after user stops typing
    if (query.trim().length > 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query)
      }, 500)
    } else {
      // Clear results when search is too short
      setSearchResults([])
    }
  }
  
  /**
   * Perform search via API
   * WHY: Fetch matching tracks from streaming service
   */
  const performSearch = async (query) => {
    if (!query || query.trim() === '') {
      setSearchResults([])
      setIsSearching(false)
      setShowDefaultTracks(true)
      return
    }

    setIsSearching(true)
    setShowDefaultTracks(false)
    
    try {
      // First, filter default tracks by query
      const filteredDefaults = defaultTracks.filter(track => 
        track.title.toLowerCase().includes(query.toLowerCase()) ||
        track.artist.toLowerCase().includes(query.toLowerCase())
      )
      
      // Search SoundCloud for tracks
      const scResults = await searchSoundCloudTracks(query, 20)
      
      // Combine results with default tracks first
      const combinedResults = [...filteredDefaults, ...scResults]
      
      setSearchResults(combinedResults)
      console.log('[MusicSearch] Found', combinedResults.length, 'tracks (', filteredDefaults.length, 'default,', scResults.length, 'SoundCloud)')
    } catch (error) {
      console.error('[MusicSearch] Search failed:', error)
      // Still show filtered default tracks on error
      const filteredDefaults = defaultTracks.filter(track => 
        track.title.toLowerCase().includes(query.toLowerCase()) ||
        track.artist.toLowerCase().includes(query.toLowerCase())
      )
      setSearchResults(filteredDefaults)
    } finally {
      setIsSearching(false)
    }
  }
  
  /**
   * Handle track selection
   * WHY: User commits to this track for full visualizer experience
   */
  const handleSelectTrack = async (track) => {
    setSelectedTrack(track)
    
    // Only get stream URL for external tracks (not default tracks)
    if (!track.path && track.streamUrl && !track.streamUrl.startsWith('http')) {
      try {
        const actualStreamUrl = await getStreamUrl(track.streamUrl);
        track.streamUrl = actualStreamUrl;
        track.previewUrl = actualStreamUrl;
      } catch (error) {
        console.error('[MusicSearch] Failed to get stream URL:', error);
      }
    }
    
    if (onTrackSelect) {
      onTrackSelect(track)
    }
  }
  
  /**
   * Preview track (short playback)
   * WHY: Let user hear track before committing
   */
  const handlePreviewTrack = async (track) => {
    if (previewingTrack?.id === track.id) {
      // Stop preview
      if (audioManager) {
        audioManager.pause()
      }
      setPreviewingTrack(null)
    } else {
      // Start preview
      setPreviewingTrack(track)
      // In real implementation, load preview URL
      console.log('[MusicSearch] Previewing:', track.title)
    }
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Search Input */}
      <div className="relative mb-6">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInput}
            placeholder="Search for music (artist, song, album)..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-md 
                     border-2 border-white/20 text-white placeholder-gray-300
                     focus:outline-none focus:border-violet-300 focus:bg-white/20
                     transition-all duration-300 text-lg"
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Default Tracks Section */}
      {showDefaultTracks && searchQuery.trim() === '' && (
        <div className="mb-6">
          <h3 className="text-violet-300 text-xl font-bold mb-3 text-left">Available Tracks</h3>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border-2 border-white/20 overflow-hidden">
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {defaultTracks.map((track) => (
                <div
                  key={track.id}
                  className={`flex items-center gap-4 p-4 hover:bg-white/10 transition-all duration-200 border-b border-white/10 last:border-b-0 cursor-pointer ${
                    selectedTrack?.id === track.id ? 'bg-violet-300/20' : ''
                  }`}
                  onClick={() => handleSelectTrack(track)}
                >
                  {/* Album Art */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-violet-300 to-blue-300 flex items-center justify-center">
                    <FaMusic className="text-white text-2xl" />
                  </div>
                  
                  {/* Track Info */}
                  <div className="flex-grow min-w-0">
                    <h3 className="text-white font-bold text-lg truncate">{track.title}</h3>
                    <p className="text-gray-300 text-sm truncate">{track.artist}</p>
                  </div>
                  
                  {/* Select Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectTrack(track)
                    }}
                    className={`px-6 py-2 rounded-full font-bold transition-all duration-200 ${
                      selectedTrack?.id === track.id
                        ? 'bg-violet-300 text-black'
                        : 'bg-white/20 hover:bg-white/30 text-white'
                    }`}
                  >
                    {selectedTrack?.id === track.id ? 'Playing' : 'Play'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border-2 border-white/20 overflow-hidden">
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {searchResults.map((track) => (
              <div
                key={track.id}
                className={`flex items-center gap-4 p-4 hover:bg-white/10 transition-all duration-200 border-b border-white/10 last:border-b-0 ${
                  selectedTrack?.id === track.id ? 'bg-violet-300/20' : ''
                }`}
              >
                {/* Album Art */}
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-violet-300 to-blue-300 flex items-center justify-center">
                  {track.artwork ? (
                    <img src={track.artwork} alt={track.title} className="w-full h-full object-cover" />
                  ) : (
                    <FaMusic className="text-white text-2xl" />
                  )}
                </div>
                
                {/* Track Info */}
                <div className="flex-grow min-w-0">
                  <h3 className="text-white font-bold text-lg truncate">{track.title}</h3>
                  <p className="text-gray-300 text-sm truncate">{track.artist}</p>
                  {track.duration && (
                    <p className="text-gray-400 text-xs mt-1">{formatDuration(track.duration)}</p>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  {/* Preview Button */}
                  {track.previewUrl && (
                    <button
                      onClick={() => handlePreviewTrack(track)}
                      className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200"
                      title="Preview"
                    >
                      {previewingTrack?.id === track.id ? (
                        <FaPause className="text-white text-sm" />
                      ) : (
                        <FaPlay className="text-white text-sm ml-0.5" />
                      )}
                    </button>
                  )}
                  
                  {/* Select Button */}
                  <button
                    onClick={() => handleSelectTrack(track)}
                    className={`px-6 py-2 rounded-full font-bold transition-all duration-200 ${
                      selectedTrack?.id === track.id
                        ? 'bg-violet-300 text-black'
                        : 'bg-white/20 hover:bg-white/30 text-white'
                    }`}
                  >
                    {selectedTrack?.id === track.id ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* No Results Message */}
      {searchQuery.length > 2 && !isSearching && searchResults.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <FaMusic className="text-4xl mx-auto mb-4 opacity-50" />
          <p>No results found for "{searchQuery}"</p>
        </div>
      )}
      
      {/* Selected Track Display */}
      {selectedTrack && (
        <div className="mt-6 p-6 bg-gradient-to-r from-violet-300/20 to-blue-300/20 backdrop-blur-md rounded-2xl border-2 border-violet-300/30">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-violet-300 to-blue-300 flex items-center justify-center">
              {selectedTrack.artwork ? (
                <img src={selectedTrack.artwork} alt={selectedTrack.title} className="w-full h-full object-cover" />
              ) : (
                <FaMusic className="text-white text-3xl" />
              )}
            </div>
            <div className="flex-grow">
              <p className="text-gray-300 text-sm mb-1">Now Playing</p>
              <h3 className="text-white font-bold text-xl">{selectedTrack.title}</h3>
              <p className="text-gray-300">{selectedTrack.artist}</p>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }
      `}</style>
    </div>
  )
}

/**
 * Format duration from seconds to MM:SS
 */
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Mock API search function
 * TODO: Replace with actual API integration
 */
async function searchMusicAPI(query) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Mock data
  return [
    {
      id: '1',
      title: 'Neon Dreams',
      artist: 'Synthwave Collective',
      duration: 245,
      artwork: null,
      streamUrl: 'https://example.com/track1.mp3',
      previewUrl: 'https://example.com/preview1.mp3',
    },
    {
      id: '2',
      title: 'Digital Horizons',
      artist: 'Future Beats',
      duration: 198,
      artwork: null,
      streamUrl: 'https://example.com/track2.mp3',
      previewUrl: 'https://example.com/preview2.mp3',
    },
    {
      id: '3',
      title: 'Cosmic Journey',
      artist: 'Space Odyssey',
      duration: 312,
      artwork: null,
      streamUrl: 'https://example.com/track3.mp3',
      previewUrl: 'https://example.com/preview3.mp3',
    },
  ].filter(track => 
    track.title.toLowerCase().includes(query.toLowerCase()) ||
    track.artist.toLowerCase().includes(query.toLowerCase())
  )
}
