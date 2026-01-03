import { useState, useEffect } from "react";
import Hero from "./components/Hero";
import ParticleVisualizer from "./components/ParticleVisualizer";
import MusicSearch from "./components/MusicSearch";
import AudioManager from "./audio/AudioManager";
import ElectricBorder from "./components/ElectricBorder";
import TargetCursor from "./components/TargetCursor";
import SpotlightCard from "./components/SpotlightCard";
import CardSwap, { Card } from "./components/CardSwap";
import TextType from "./components/TextType";
import ChromaGrid from "./components/ChromaGrid";
import PerspectiveTransition from "./components/PerspectiveTransition";
import DomeGallery from "./components/DomeGallery";
import StaggeredMenu from "./components/StaggeredMenu";
import StarBorder from "./components/StarBorder";
import SplashCursor from "./components/SplashCursor";
import Lenis from 'lenis';

function App() {
  const [audioManager] = useState(() => new AudioManager());
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [showInteractionPrompt, setShowInteractionPrompt] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedVideos, setLoadedVideos] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [audioStarted, setAudioStarted] = useState(false);
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [particleColors, setParticleColors] = useState({ start: 0xff00ff, end: 0x00ffff });

  // Default tracks with color schemes
  const defaultTracks = [
    {
      id: 'fallen-rosemary',
      title: "Fallen Rosemary's Nocturne Theme",
      artist: 'Arknights OST',
      path: '/audio/default-track.mp3',
      colors: { start: 0xff00ff, end: 0x00ffff } // Purple to Cyan
    },
    {
      id: 'dramatic-irony',
      title: 'A Dramatic Irony',
      artist: 'Arknights OST',
      path: '/audio/A Dramatic Irony.mp3',
      colors: { start: 0xff4444, end: 0xffaa00 } // Red to Orange
    },
    {
      id: 'manifesto',
      title: 'ManiFesto',
      artist: 'Arknights EP',
      path: '/audio/Arknights EP - [ManiFesto_].mp3',
      colors: { start: 0x44ff44, end: 0x00ffff } // Green to Cyan
    },
    {
      id: 'renegade',
      title: 'Renegade',
      artist: 'Arknights EP',
      path: '/audio/Arknights EP - [Renegade].mp3',
      colors: { start: 0xff00ff, end: 0xff0000 } // Magenta to Red
    },
    {
      id: 'samudrartha',
      title: 'Samudrartha',
      artist: 'Honkai: Star Rail OST',
      path: '/audio/EP_ Samudrartha Honkai_ Star Rail.mp3',
      colors: { start: 0x00aaff, end: 0xaa00ff } // Blue to Purple
    },
    {
      id: 'operation-blade',
      title: 'Operation Blade',
      artist: 'Arknights OST',
      path: '/audio/Operation Blade.mp3',
      colors: { start: 0xffff00, end: 0xff00ff } // Yellow to Magenta
    },
    {
      id: 'wildfire',
      title: 'Wildfire',
      artist: 'Arknights OST',
      path: '/audio/Wildfire.mp3',
      colors: { start: 0xff6600, end: 0xffff00 } // Orange to Yellow
    },
    {
      id: 'ashring',
      title: 'CC#10 Operation Ashring',
      artist: 'Arknights OST',
      path: '/audio/[Arknights] CC#10 Operation Ashring OST (with LYRICS).mp3',
      colors: { start: 0x0088ff, end: 0x00ff88 } // Blue to Green
    },
    {
      id: 'fake-wave',
      title: 'CC#11 Operation Fake Wave',
      artist: 'Arknights OST',
      path: '/audio/[Arknights] CC#11 Operation Fake Wave OST (with LYRICS).mp3',
      colors: { start: 0xff0088, end: 0x8800ff } // Pink to Purple
    }
  ];

  // Team members data
  const teamMembers = [
    { name: "Savitha G", position: "Teacher Coordinator", initial: "SG", photo: "/members/savitha.jpg" },
    { name: "Kavish Narendra Raut", position: "Club Head", initial: "KR", photo: "/members/kavish.jpg" },
    { name: "Hrudai Nirmal", position: "Vice President", initial: "HN", photo: "/members/Hrudai.jpg" },
    { name: "Bhavani Krupakara", position: "Vice President", initial: "BK", photo: "/members/bhavani.jpg" },
    { name: "Shivam", position: "Technical Head", initial: "S", photo: "/members/shivam.jpg" },
    { name: "Ayush Kumar", position: "Technical Head", initial: "AK", photo: "/members/ayush.jpg" },
    { name: "Aditya Kaushik", position: "Design Head", initial: "AK", photo: "/members/aditya.jpg" },
    { name: "Rethash Reddy", position: "Core Member", initial: "RR", photo: "/members/retash.jpg" },
    { name: "Bhuvan", position: "Core Member", initial: "B", photo: "/members/bhuvan.jpg" },
    { name: "Bhargav", position: "Core Member", initial: "B", photo: "/members/bhargav.jpg" },
    { name: "Tejas NG", position: "Core Member", initial: "TN", photo: "/members/tejas.jpg" },
    { name: "Angil Jain", position: "Core Member", initial: "AJ", photo: "/members/angil.jpg" }
  ];

  // Preload videos
  useEffect(() => {
    const totalVideos = 4;
    let loaded = 0;
    
    for (let i = 1; i <= totalVideos; i++) {
      const video = document.createElement('video');
      video.src = `/videos/hero-${i}.mp4`;
      video.preload = 'auto';
      
      video.addEventListener('loadeddata', () => {
        loaded++;
        setLoadedVideos(loaded);
        
        if (loaded === totalVideos) {
          setTimeout(() => setIsLoading(false), 500);
        }
      });
      
      video.load();
    }
  }, []);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  /**
   * Initialize audio on user interaction
   * WHY: Browser security requires user gesture before AudioContext
   */
  const handleUserInteraction = async () => {
    try {
      console.log("[App] 🎵 User clicked - initializing audio system...");
      
      await audioManager.initialize();
      console.log("[App] ✅ AudioContext initialized");
      
      setIsAudioReady(true);
      setShowInteractionPrompt(false);
      
      // Load and play first default track
      const firstTrack = defaultTracks[0];
      const audio = new Audio(firstTrack.path);
      audio.crossOrigin = "anonymous";
      audio.loop = false; // Don't loop individual tracks, we'll rotate
      audio.volume = 0.7;
      
      // Set up track ended listener for auto-rotation
      audio.addEventListener('ended', () => {
        console.log('[App] 🔄 Track ended, loading next track...');
        playNextTrack();
      });
      
      // Debug event listeners
      audio.addEventListener('loadeddata', () => {
        console.log('[App] ✅ Audio file loaded - Duration:', audio.duration.toFixed(2), 'seconds');
      });
      
      audio.addEventListener('playing', () => {
        console.log('[App] 🔊 AUDIO IS NOW PLAYING!');
      });
      
      audio.addEventListener('pause', () => {
        console.log('[App] ⏸️ Audio paused');
      });
      
      audio.addEventListener('error', (e) => {
        console.error('[App] ❌ Audio error:', audio.error);
      });
      
      console.log("[App] 🎵 Loading audio into AudioManager...");
      audioManager.loadAudio(audio);
      
      console.log("[App] ▶️ Starting playback...");
      await audioManager.play();
      
      // Set particle colors for first track
      setParticleColors(firstTrack.colors);
      
      // Final status check
      setTimeout(() => {
        console.log("[App] === AUDIO STATUS CHECK ===");
        console.log("  Volume:", audio.volume);
        console.log("  Paused:", audio.paused);
        console.log("  Current Time:", audio.currentTime.toFixed(2));
        console.log("  Duration:", audio.duration.toFixed(2));
        console.log("  AudioContext State:", audioManager.audioContext.state);
        console.log("  Is Playing:", audioManager.isPlaying);
        console.log("=============================");
      }, 1000);
      
      setCurrentTrack(firstTrack);
      setCurrentTrackIndex(0);
      
      setAudioStarted(true);
      console.log("[App] ✅ Setup complete!");
    } catch (error) {
      console.error("[App] ❌ Audio initialization failed:", error);
      alert(`Audio Error: ${error.message}\nCheck browser console for details.`);
    }
  };

  /**
   * Play next track in rotation
   */
  const playNextTrack = async () => {
    try {
      const nextIndex = (currentTrackIndex + 1) % defaultTracks.length;
      const nextTrack = defaultTracks[nextIndex];
      
      console.log(`[App] 🎵 Loading next track: ${nextTrack.title}`);
      
      // Stop current audio if playing
      if (audioManager.isPlaying) {
        audioManager.pause();
      }
      
      // Create audio element for the next track
      const audio = new Audio(nextTrack.path);
      audio.crossOrigin = "anonymous";
      audio.loop = false;
      audio.volume = 0.7;
      
      // Set up track ended listener
      audio.addEventListener('ended', () => {
        console.log('[App] 🔄 Track ended, loading next track...');
        playNextTrack();
      });
      
      // Load into audio manager
      audioManager.loadAudio(audio);
      
      // Start playback
      await audioManager.play();
      
      // Update particle colors
      setParticleColors(nextTrack.colors);
      
      setCurrentTrack(nextTrack);
      setCurrentTrackIndex(nextIndex);
      
      console.log(`[App] ✅ Now playing: ${nextTrack.title}`);
    } catch (error) {
      console.error('[App] Failed to play next track:', error);
    }
  };

  /**
   * Handle track selection from MusicSearch
   */
  const handleTrackSelect = async (track) => {
    try {
      // Stop current audio if playing
      if (audioManager.isPlaying) {
        audioManager.pause();
      }
      
      // Check if this is a default track or external track
      const isDefaultTrack = defaultTracks.some(t => t.id === track.id);
      
      // Create audio element for the track
      const audio = new Audio(track.path || track.streamUrl || track.previewUrl);
      audio.crossOrigin = "anonymous";
      audio.loop = isDefaultTrack ? false : true; // Loop external tracks, rotate defaults
      audio.volume = 0.5;
      
      // If it's a default track, set up rotation
      if (isDefaultTrack) {
        audio.addEventListener('ended', () => {
          console.log('[App] 🔄 Track ended, loading next track...');
          playNextTrack();
        });
        
        // Update current index
        const trackIndex = defaultTracks.findIndex(t => t.id === track.id);
        setCurrentTrackIndex(trackIndex);
        
        // Update particle colors
        setParticleColors(track.colors);
      } else {
        // For external tracks, use random colors
        const randomColors = {
          start: Math.random() * 0xffffff,
          end: Math.random() * 0xffffff
        };
        setParticleColors(randomColors);
      }

      // Load into audio manager
      audioManager.loadAudio(audio);

      // Start playback
      await audioManager.play();

      setCurrentTrack(track);
      console.log("[App] Now playing:", track.title);
    } catch (error) {
      console.error("[App] Track playback failed:", error);
    }
  };

  /**
   * Animation loop - update audio analysis
   */
  useEffect(() => {
    if (!isAudioReady) return;

    let animationId;
    const update = () => {
      audioManager.update();
      animationId = requestAnimationFrame(update);
    };

    update();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isAudioReady, audioManager]);

  return (
    <main className="relative min-h-screen w-screen overflow-x-hidden">
      {/* Splash Cursor Effect */}
      <SplashCursor />

      {/* Staggered Menu Navigation */}
      <StaggeredMenu
        position="right"
        colors={['#7C3AED', '#5B21B6']}
        items={[
          { label: 'Home', link: '#hero', ariaLabel: 'Navigate to Home section' },
          { label: 'About', link: '#about', ariaLabel: 'Navigate to About section' },
          { label: 'Team', link: '#team', ariaLabel: 'Navigate to Team section' },
          { label: 'Events', link: '#events', ariaLabel: 'Navigate to Events section' },
          { label: 'Gallery', link: '#gallery', ariaLabel: 'Navigate to Gallery section' }
        ]}
        socialItems={[
          { label: 'Instagram', link: 'https://www.instagram.com/pegasusrvitm/' }
        ]}
        displaySocials={true}
        displayItemNumbering={true}
        logoUrl="/logo/logo.png"
        menuButtonColor="#fff"
        openMenuButtonColor="#000"
        accentColor="#7C3AED"
        changeMenuColorOnOpen={true}
        isFixed={true}
        closeOnClickAway={true}
      />

      {/* Loading Screen */}
      {isLoading && (
        <div className="flex-center fixed inset-0 z-[9999] h-screen w-screen overflow-hidden bg-violet-50">
          <div className="three-body">
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
          </div>
        </div>
      )}

      {/* User Interaction Prompt (required for audio) */}
      {showInteractionPrompt && !isLoading && (
        <div
          onClick={handleUserInteraction}
          className="fixed inset-0 z-[9999] bg-black backdrop-blur-sm flex items-center justify-center cursor-pointer"
        >
          <div className="text-center text-white">
            <div className="mb-6">
              <div className="inline-block animate-bounce">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="special-font text-4xl md:text-6xl font-black mb-4">
              Click to <b>Enter</b>
            </h2>
            <p className="text-lg text-gray-300 mb-2">
              Audio visualization requires interaction
            </p>
            <p className="text-sm text-gray-400 mb-1">
              Click anywhere to start the experience
            </p>
            <p className="text-sm text-gray-400">
              Click at center of screen to change the current video
            </p>
          </div>
        </div>
      )}

      <div id="hero">
        <Hero />
      </div>

      {/* Particle Background Visualizer - Visible background after Hero */}
      {isAudioReady && (
        <div className="fixed inset-0 z-[-1] bg-black">
          <ParticleVisualizer 
            audioManager={audioManager} 
            startColor={particleColors.start}
            endColor={particleColors.end}
          />
        </div>
      )}

      {/* Music Selection Section */}
      <section className="min-h-screen bg-transparent flex items-center justify-center relative z-10">
        <div className="text-center px-10 py-20 w-full">
          <h2 className="special-font text-5xl md:text-7xl font-black text-violet-300 mb-4">
            Before we begin<b> let's customise your experience</b>
          </h2>
          <p className="text-xl md:text-2xl font-robert-regular text-violet-300 max-w-3xl mx-auto mb-12">
            Select your music to drive the visual experience. The background
            will react to the rhythm, bass, and energy of your chosen track.
          </p>

          {/* Music Search Component */}
          <MusicSearch
            onTrackSelect={handleTrackSelect}
            audioManager={audioManager}
            defaultTracks={defaultTracks}
          />

          {/* Volume Control */}
          {audioStarted && (
            <div className="mt-8 max-w-md mx-auto bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-violet-300/20">
              <div className="flex items-center gap-3">
                <span className="text-violet-300/70 text-sm">Volume</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="50"
                  className="w-32"
                  onChange={(e) => {
                    const volume = e.target.value / 100;
                    audioManager.setVolume(volume);
                    console.log('[App] Volume set to:', volume);
                  }}
                />
                <button
                  onClick={() => {
                    if (audioManager.isPlaying) {
                      audioManager.pause();
                    } else {
                      audioManager.play();
                    }
                  }}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-violet-300 text-sm"
                >
                  {audioManager.isPlaying ? 'Pause' : 'Play'}
                </button>
              </div>
              {currentTrack && (
                <div className="mt-2 text-xs text-violet-300/50 text-center">
                  Now playing: {currentTrack.title}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* About Us Section */}
      <div id="about" className="about-us-section relative">
        <TargetCursor 
          targetSelector=".about-us-section .cursor-target"
          spinDuration={2}
          hideDefaultCursor={true}
          parallaxOn={true}
        />
        
        <section className="min-h-screen bg-transparent flex items-center justify-center relative z-10 px-4 py-20">
          <div className="max-w-6xl mx-auto w-full">
            <h2 className="special-font text-4xl md:text-6xl font-black text-yellow-300 mb-12 text-center">
              About <b>Us</b>
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              {/* Who Are We */}
              <StarBorder
                as="div"
                color="#facc15"
                speed="4s"
                thickness={2}
              >
                <SpotlightCard 
                  className="cursor-target bg-white/5 backdrop-blur-lg rounded-3xl p-6 border-2 border-violet-300/30 shadow-2xl shadow-violet-500/20 hover:border-violet-300/50 transition-all duration-500"
                  spotlightColor="rgba(167, 139, 250, 0.3)"
                >
                  <div className="mb-3">
                    <h3 className="special-font text-3xl md:text-4xl font-black text-yellow-300 mb-3">
                      Who <b>Are We</b>
                    </h3>
                    <div className="w-16 h-1 bg-gradient-to-r from-yellow-300 to-violet-300 rounded-full mb-4"></div>
                  </div>
                  <p className="text-lg md:text-xl font-robert-regular text-yellow-300 leading-relaxed mb-3">
                    We are RVITM's web dev club united by our love for web development.
                  </p>
                  <p className="text-lg md:text-xl font-robert-regular text-yellow-300 leading-relaxed">
                    We aim to provide a supportive environment where members can learn web technologies, 
                    build real-world projects, and connect with fellow developers to achieve their goals.
                  </p>
                </SpotlightCard>
              </StarBorder>

            {/* Club Logo */}
            <div className="cursor-target flex items-center justify-center">
              <ElectricBorder
                color="#7df9ff"
                speed={1}
                thickness={3}
              >
                <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl">
                  <img 
                    src="/logo/pegasus-logo.png" 
                    alt="Pegasus Web Dev Club Logo" 
                    className="w-full max-w-xs h-auto object-contain drop-shadow-2xl"
                  />
                </div>
              </ElectricBorder>
            </div>
          </div>
        </div>
        </section>
      </div>

      {/* Members Section */}
      <section id="team" className="h-screen bg-transparent flex flex-col items-center justify-center relative z-10 py-12 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="special-font text-4xl md:text-6xl font-black text-green-500 mb-12 text-center">
            Our <b>Team</b>
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Member Info - Left Side */}
            <div className="order-2 lg:order-1">
              <div className="space-y-8">
                <p className="text-lg md:text-xl font-robert-regular text-green-300 leading-relaxed">
                  Let's introduce you to our members.<br/>
                  Hover over the cards to stop the animation at a member.
                </p>
              </div>
            </div>

            {/* Card Swap - Right Side */}
            <div className="order-1 lg:order-2 flex justify-center items-center">
              <CardSwap
                width={350}
                height={450}
                cardDistance={40}
                verticalDistance={50}
                delay={3000}
                pauseOnHover={true}
                skewAmount={4}
                easing="elastic"
                maxVisibleCards={4}
                onCardChange={(index) => setCurrentMemberIndex(index)}
              >
                {teamMembers.map((member, index) => (
                  <Card key={index} className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg border-2 border-green-500/50">
                    <div className="w-full h-full flex flex-col items-center justify-center p-6">
                      <div className="w-48 h-48 rounded-full overflow-hidden mb-4 border-4 border-green-500">
                        <img 
                          src={member.photo} 
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="text-2xl font-black text-green-500 mt-4 text-center">{member.name}</h4>
                      <p className="text-lg text-green-400 text-center">{member.position}</p>
                    </div>
                  </Card>
                ))}
              </CardSwap>
            </div>
          </div>
        </div>
      </section>

      {/* Events and Gallery with Perspective Transition */}
      <PerspectiveTransition
        section1={
          <div id="events" className="w-full h-full bg-transparent flex flex-col items-center justify-center py-12 px-4">
            <StarBorder
              as="div"
              color="#f97316"
              speed="5s"
              thickness={2}
              className="w-full"
            >
              <div className="max-w-7xl mx-auto w-full">
                <h2 className="special-font text-5xl md:text-7xl font-black text-orange-500 mb-6 text-center">
                  Our <b>Events</b>
                </h2>
                <p className="text-base md:text-lg font-robert-regular text-orange-300 text-center mb-8 max-w-2xl mx-auto">
                  Explore our exciting events and workshops.
                </p>
                
                <ChromaGrid
                  columns={4}
                  rows={1}
                  radius={350}
                  items={[
                    {
                      image: '/events/phoenix hacks.jpg',
                      title: 'Phoenix Hacks',
                      subtitle: '24 Hour Hackathon',
                      borderColor: '#F97316',
                      gradient: 'linear-gradient(145deg, #F97316, #000)'
                    },
                    {
                      image: '/events/workshop.jpeg',
                      title: 'HTML/CSS Workshop',
                      subtitle: 'Hands on session on web design',
                      borderColor: '#FB923C',
                      gradient: 'linear-gradient(210deg, #FB923C, #000)'
                    },
                    {
                      image: '/events/2024 induction.webp',
                      title: '2024 Batch Induction',
                      subtitle: 'Intoducing the new batch to our club',
                      borderColor: '#FDBA74',
                      gradient: 'linear-gradient(165deg, #FDBA74, #000)'
                    },
                    {
                      image: '/events/2025 induction.webp',
                      title: '2025 Batch Induction',
                      subtitle: 'Intoducing the new batch to our club',
                      borderColor: '#FED7AA',
                      gradient: 'linear-gradient(195deg, #FED7AA, #000)'
                    }
                  ]}
                />
              </div>
            </StarBorder>
          </div>
        }
        section2={
          <div id="gallery" className="w-full h-screen bg-transparent">
            <DomeGallery
              images={[
                '/gallery/1.jpg',
                '/gallery/2.jpg',
                '/gallery/3.jpg',
                '/gallery/4.jpg',
                '/gallery/5.jpg',
                '/gallery/6.jpg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.40 PM.jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.41 PM.jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.42 PM (1).jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.42 PM.jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.45 PM.jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.46 PM (1).jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.46 PM (2).jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.46 PM.jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.47 PM (1).jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.47 PM (2).jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.47 PM.jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.48 PM.jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.51 PM (1).jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.51 PM.jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.52 PM (1).jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.52 PM (2).jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.52 PM.jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.53 PM (1).jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.53 PM (2).jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.53 PM.jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.54 PM (1).jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.54 PM (2).jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.54 PM.jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.55 PM (1).jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.55 PM (2).jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.55 PM.jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.56 PM (1).jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.56 PM (2).jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.56 PM.jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.57 PM (1).jpeg',
                '/gallery/WhatsApp Image 2026-01-03 at 2.30.57 PM.jpeg'
              ]}
            />
          </div>
        }
      />
    </main>
  );
}

export default App;
