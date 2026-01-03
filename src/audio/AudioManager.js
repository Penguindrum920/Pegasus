/**
 * AudioManager - Core Audio Analysis System
 * 
 * PURPOSE:
 * Manages Web Audio API integration, frequency analysis, and real-time audio data extraction.
 * This class bridges the gap between raw audio data and visual parameters for the particle system.
 * 
 * DATA FLOW:
 * 1. Audio Source (HTMLAudioElement/ArrayBuffer) → AudioContext
 * 2. AudioContext → AnalyserNode (performs FFT - Fast Fourier Transform)
 * 3. AnalyserNode → Frequency Data (Uint8Array with 0-255 values per frequency bin)
 * 4. Frequency Data → Band Analysis (Low/Mid/High frequency extraction)
 * 5. Normalized Bands → Visual System (amplitude, color, movement parameters)
 * 
 * WHY THIS APPROACH:
 * - AnalyserNode provides real-time frequency data without affecting playback
 * - FFT size of 1024 balances frequency resolution vs performance
 * - Frequency bands (bass/mid/treble) map naturally to different visual properties
 * - Normalization (0-1 range) makes it easy to drive shader uniforms and animations
 */

export default class AudioManager {
  constructor() {
    // Audio context - the central hub for all Web Audio operations
    this.audioContext = null
    
    // Source node - wraps the actual audio element
    this.audioSource = null
    
    // Analyser node - performs FFT and provides frequency/time-domain data
    this.analyserNode = null
    
    // The HTML audio element that actually plays the sound
    this.audioElement = null
    
    // Raw frequency data from FFT (Uint8Array with values 0-255)
    this.frequencyArray = null
    
    // Processed frequency bands (normalized 0-1)
    this.frequencyData = {
      low: 0,    // Bass frequencies (20Hz - 250Hz) - drives amplitude/scale
      mid: 0,    // Mid frequencies (250Hz - 2000Hz) - drives offset/movement
      high: 0,   // Treble frequencies (2000Hz - 20000Hz) - drives color/brightness
    }
    
    // Smoothed values for more organic visual transitions
    this.smoothedData = {
      low: 0,
      mid: 0,
      high: 0,
    }
    
    // Smoothing factor (0-1): higher = more smoothing, less responsive
    this.smoothingFactor = 0.7
    
    // Frequency range boundaries (in Hz)
    this.lowFrequency = 20      // 20Hz - 250Hz (bass/kick/sub-bass)
    this.midFrequency = 250     // 250Hz - 2000Hz (vocals/snare/instruments)
    this.highFrequency = 2000   // 2000Hz - 20000Hz (hi-hats/cymbals/brightness)
    
    // FFT size - must be power of 2 (256, 512, 1024, 2048, etc.)
    // Larger = better frequency resolution but more CPU intensive
    this.fftSize = 1024
    
    // Playing state
    this.isPlaying = false
    this.isInitialized = false
    
    // Overall audio energy (sum of all frequencies)
    this.totalEnergy = 0
  }

  /**
   * Initialize Web Audio API
   * WHY: AudioContext must be created after user interaction (browser security)
   * This sets up the audio routing: HTMLAudioElement → AudioContext → AnalyserNode
   */
  async initialize() {
    if (this.isInitialized) return
    
    try {
      // Create AudioContext - the central processing hub
      // WHY: All Web Audio processing must go through AudioContext
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      // Create AnalyserNode for frequency analysis
      // WHY: AnalyserNode performs FFT without affecting audio playback
      this.analyserNode = this.audioContext.createAnalyser()
      this.analyserNode.fftSize = this.fftSize
      this.analyserNode.smoothingTimeConstant = 0.8 // Built-in smoothing (0-1)
      
      // bufferLength = half of fftSize (Nyquist theorem)
      // WHY: FFT output is symmetric, so we only need half the bins
      this.bufferLength = this.analyserNode.frequencyBinCount
      
      // Allocate typed array for frequency data
      // WHY: Typed arrays are more efficient than regular arrays for audio data
      this.frequencyArray = new Uint8Array(this.bufferLength)
      
      this.isInitialized = true
      console.log('[AudioManager] Initialized successfully')
      console.log(`[AudioManager] Sample Rate: ${this.audioContext.sampleRate}Hz`)
      console.log(`[AudioManager] FFT Size: ${this.fftSize}`)
      console.log(`[AudioManager] Frequency Bins: ${this.bufferLength}`)
      
    } catch (error) {
      console.error('[AudioManager] Initialization failed:', error)
      throw error
    }
  }

  /**
   * Load and connect an audio element to the Web Audio API
   * 
   * @param {HTMLAudioElement} audioElement - The audio element to analyze
   * 
   * WHY THIS APPROACH:
   * - Using HTMLAudioElement allows easy integration with streaming services
   * - MediaElementSourceNode bridges DOM audio with Web Audio API
   * - We can analyze audio without interrupting normal playback
   */
  loadAudio(audioElement) {
    if (!this.isInitialized) {
      throw new Error('[AudioManager] Must call initialize() first')
    }
    
    try {
      // Disconnect previous source if it exists
      if (this.audioSource) {
        this.audioSource.disconnect()
      }
      
      this.audioElement = audioElement
      
      // Create source from media element
      // WHY: This creates a node that outputs the audio from the HTML element
      this.audioSource = this.audioContext.createMediaElementSource(audioElement)
      
      // Connect the routing chain:
      // AudioSource → AnalyserNode → Destination (speakers)
      // WHY: AnalyserNode is a pass-through node - it analyzes but doesn't modify audio
      this.audioSource.connect(this.analyserNode)
      this.analyserNode.connect(this.audioContext.destination)
      
      console.log('[AudioManager] Audio loaded and connected')
      
    } catch (error) {
      console.error('[AudioManager] Failed to load audio:', error)
      throw error
    }
  }

  /**
   * Play the loaded audio
   * WHY: Wraps audio element play with proper error handling
   */
  async play() {
    if (!this.audioElement) {
      throw new Error('[AudioManager] No audio loaded')
    }
    
    try {
      // Resume AudioContext if suspended (can happen on mobile)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }
      
      await this.audioElement.play()
      this.isPlaying = true
      console.log('[AudioManager] Playback started')
      
    } catch (error) {
      console.error('[AudioManager] Playback failed:', error)
      throw error
    }
  }

  /**
   * Pause the audio
   */
  pause() {
    if (this.audioElement) {
      this.audioElement.pause()
      this.isPlaying = false
      console.log('[AudioManager] Playback paused')
    }
  }

  /**
   * Get current playback time
   */
  getCurrentTime() {
    return this.audioElement?.currentTime || 0
  }

  /**
   * Get total duration
   */
  getDuration() {
    return this.audioElement?.duration || 0
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume) {
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, volume))
    }
  }

  /**
   * Collect raw frequency data from the AnalyserNode
   * 
   * WHY:
   * - getByteFrequencyData() fills the array with current frequency magnitudes
   * - Each index represents a frequency bin
   * - Values are 0-255 (8-bit unsigned integers)
   * - Called every frame in the animation loop
   */
  collectFrequencyData() {
    if (!this.analyserNode || !this.frequencyArray) return
    
    // This fills frequencyArray with current frequency data
    // WHY: We call this every frame to get real-time audio analysis
    this.analyserNode.getByteFrequencyData(this.frequencyArray)
  }

  /**
   * Analyze frequency data and extract meaningful bands
   * 
   * HOW IT WORKS:
   * 1. Calculate which array indices correspond to our Hz ranges
   * 2. Average the values in each range
   * 3. Normalize to 0-1 range
   * 4. Apply smoothing for organic transitions
   * 
   * WHY FREQUENCY BANDS:
   * - Bass (low): Physical, impactful - drives particle scale/amplitude
   * - Mid: Where most musical content lives - drives movement/offset
   * - Treble (high): Detail, brightness - drives color/opacity
   * 
   * FREQUENCY MAPPING MATH:
   * - Each bin represents: sampleRate / fftSize Hz
   * - For 44100Hz sample rate and 1024 FFT: 44100/1024 ≈ 43Hz per bin
   * - To get 250Hz: 250/43 ≈ bin 5
   */
  analyzeFrequency() {
    if (!this.audioContext || !this.frequencyArray) return
    
    // Calculate Hz per frequency bin
    // WHY: This tells us which array indices map to which frequencies
    const hzPerBin = this.audioContext.sampleRate / this.fftSize
    
    // Convert Hz boundaries to array indices
    const lowStart = Math.floor(this.lowFrequency / hzPerBin)
    const lowEnd = Math.floor(this.midFrequency / hzPerBin)
    const midStart = lowEnd
    const midEnd = Math.floor(this.highFrequency / hzPerBin)
    const highStart = midEnd
    const highEnd = this.bufferLength - 1
    
    // Calculate average magnitude for each frequency band
    const lowAvg = this.calculateAverage(this.frequencyArray, lowStart, lowEnd)
    const midAvg = this.calculateAverage(this.frequencyArray, midStart, midEnd)
    const highAvg = this.calculateAverage(this.frequencyArray, highStart, highEnd)
    
    // Normalize to 0-1 range
    // WHY: Makes it easy to use as multipliers for visual properties
    const lowNorm = this.normalize(lowAvg)
    const midNorm = this.normalize(midAvg)
    const highNorm = this.normalize(highAvg)
    
    // Apply exponential smoothing for organic transitions
    // WHY: Raw FFT data is jittery; smoothing makes visuals more pleasant
    // Formula: smoothed = smoothed * factor + new * (1 - factor)
    this.smoothedData.low = this.smoothedData.low * this.smoothingFactor + lowNorm * (1 - this.smoothingFactor)
    this.smoothedData.mid = this.smoothedData.mid * this.smoothingFactor + midNorm * (1 - this.smoothingFactor)
    this.smoothedData.high = this.smoothedData.high * this.smoothingFactor + highNorm * (1 - this.smoothingFactor)
    
    // Update main frequency data
    this.frequencyData = { ...this.smoothedData }
    
    // Calculate total energy (useful for global effects)
    this.totalEnergy = (this.frequencyData.low + this.frequencyData.mid + this.frequencyData.high) / 3
  }

  /**
   * Calculate average value in a range of the frequency array
   * 
   * @param {Uint8Array} array - The frequency data array
   * @param {number} start - Start index
   * @param {number} end - End index
   * @returns {number} Average value
   */
  calculateAverage(array, start, end) {
    let sum = 0
    const count = end - start + 1
    
    for (let i = start; i <= end; i++) {
      sum += array[i]
    }
    
    return sum / count
  }

  /**
   * Normalize value from 0-255 range to 0-1 range
   * 
   * @param {number} value - Value to normalize (0-255)
   * @returns {number} Normalized value (0-1)
   */
  normalize(value) {
    return value / 255
  }

  /**
   * Main update function - call this every frame
   * 
   * WHY:
   * - Collects fresh frequency data from AnalyserNode
   * - Analyzes it into meaningful bands
   * - Called from animation loop to keep visuals in sync with audio
   */
  update() {
    if (!this.isPlaying) return
    
    this.collectFrequencyData()
    this.analyzeFrequency()
  }

  /**
   * Get the current frequency data
   * @returns {{low: number, mid: number, high: number, total: number}}
   */
  getFrequencyData() {
    return {
      ...this.frequencyData,
      total: this.totalEnergy,
    }
  }

  /**
   * Get raw frequency array for custom analysis
   * @returns {Uint8Array}
   */
  getRawFrequencyArray() {
    return this.frequencyArray
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.pause()
    
    if (this.audioSource) {
      this.audioSource.disconnect()
    }
    
    if (this.analyserNode) {
      this.analyserNode.disconnect()
    }
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
    }
    
    this.isInitialized = false
    console.log('[AudioManager] Disposed')
  }
}
