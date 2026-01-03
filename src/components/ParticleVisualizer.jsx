/**
 * ParticleVisualizer - Exact implementation from Tympanus project
 * Adapted for React but maintains the original logic
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import vertexShader from '../shaders/particles.vert.js'
import fragmentShader from '../shaders/particles.frag.js'

export default function ParticleVisualizer({ audioManager, startColor = 0xff00ff, endColor = 0x00ffff }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const holderRef = useRef(null)
  const holderObjectsRef = useRef(null)
  const pointsMeshRef = useRef(null)
  const materialRef = useRef(null)
  const geometryRef = useRef(null)
  const animationIdRef = useRef(null)
  const timeRef = useRef(0)
  const propertiesRef = useRef({
    startColor: startColor,
    endColor: endColor,
    autoMix: true,
    autoRotate: true,
  })
  
  // Update colors when props change
  useEffect(() => {
    if (materialRef.current) {
      gsap.to(materialRef.current.uniforms.startColor.value, {
        r: new THREE.Color(startColor).r,
        g: new THREE.Color(startColor).g,
        b: new THREE.Color(startColor).b,
        duration: 1.5,
        ease: 'power2.inOut'
      })
      gsap.to(materialRef.current.uniforms.endColor.value, {
        r: new THREE.Color(endColor).r,
        g: new THREE.Color(endColor).g,
        b: new THREE.Color(endColor).b,
        duration: 1.5,
        ease: 'power2.inOut'
      })
    }
    propertiesRef.current.startColor = startColor
    propertiesRef.current.endColor = endColor
  }, [startColor, endColor])
  
  useEffect(() => {
    if (!containerRef.current) return
    
    // Setup scene
    const scene = new THREE.Scene()
    sceneRef.current = scene
    
    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    )
    camera.position.z = 12
    camera.frustumCulled = false
    cameraRef.current = camera
    
    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    renderer.setClearColor(0x000000, 0)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.autoClear = false
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer
    
    // Setup holder (like App.holder in original)
    const holder = new THREE.Object3D()
    holder.name = 'holder'
    holder.sortObjects = false
    scene.add(holder)
    holderRef.current = holder
    
    // Setup holder objects
    const holderObjects = new THREE.Object3D()
    holderObjectsRef.current = holderObjects
    
    // Setup material (like in ReactiveParticles.init())
    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        time: { value: 0 },
        offsetSize: { value: 2 },
        size: { value: 1.1 },
        frequency: { value: 2 },
        amplitude: { value: 1 },
        offsetGain: { value: 0 },
        maxDistance: { value: 1.8 },
        startColor: { value: new THREE.Color(propertiesRef.current.startColor) },
        endColor: { value: new THREE.Color(propertiesRef.current.endColor) },
      },
    })
    materialRef.current = material
    
    // Add to holder
    holder.add(holderObjects)
    
    // Initial mesh creation
    resetMesh()
    
    // Auto-cycle shapes every 5-8 seconds (like original)
    const cycleInterval = setInterval(() => {
      resetMesh()
    }, THREE.MathUtils.randInt(5000, 8000)) // 5-8 seconds
    
    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      
      // Update particles (exact logic from ReactiveParticles.update())
      if (audioManager?.isPlaying && materialRef.current) {
        const frequencyData = audioManager.frequencyData
        
        // Exact mapping from original
        materialRef.current.uniforms.amplitude.value = 
          0.8 + THREE.MathUtils.mapLinear(frequencyData.high, 0, 0.6, -0.1, 0.2)
        
        materialRef.current.uniforms.offsetGain.value = frequencyData.mid * 0.6
        
        const t = THREE.MathUtils.mapLinear(frequencyData.low, 0.6, 1, 0.2, 0.5)
        timeRef.current += THREE.MathUtils.clamp(t, 0.2, 0.5)
      } else {
        // Default when not playing
        if (materialRef.current) {
          materialRef.current.uniforms.frequency.value = 0.8
          materialRef.current.uniforms.amplitude.value = 1
        }
        timeRef.current += 0.2
      }
      
      if (materialRef.current) {
        materialRef.current.uniforms.time.value = timeRef.current
      }
      
      renderer.render(scene, camera)
    }
    
    animate()
    
    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    
    window.addEventListener('resize', handleResize)
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      
      if (cycleInterval) {
        clearInterval(cycleInterval)
      }
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      
      destroyMesh()
      
      if (materialRef.current) {
        materialRef.current.dispose()
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose()
        containerRef.current?.removeChild(rendererRef.current.domElement)
      }
    }
  }, [audioManager])
  
  // Exact createBoxMesh from original
  const createBoxMesh = () => {
    const widthSeg = Math.floor(THREE.MathUtils.randInt(5, 20))
    const heightSeg = Math.floor(THREE.MathUtils.randInt(1, 40))
    const depthSeg = Math.floor(THREE.MathUtils.randInt(5, 80))
    
    const geometry = new THREE.BoxGeometry(1, 1, 1, widthSeg, heightSeg, depthSeg)
    geometryRef.current = geometry
    
    materialRef.current.uniforms.offsetSize.value = Math.floor(THREE.MathUtils.randInt(30, 60))
    materialRef.current.needsUpdate = true
    
    const pointsMeshContainer = new THREE.Object3D()
    pointsMeshContainer.rotateX(Math.PI / 2)
    holderObjectsRef.current.add(pointsMeshContainer)
    
    const pointsMesh = new THREE.Points(geometry, materialRef.current)
    pointsMeshContainer.add(pointsMesh)
    pointsMeshRef.current = pointsMeshContainer
    
    gsap.to(pointsMeshContainer.rotation, {
      duration: 3,
      x: Math.random() * Math.PI,
      z: Math.random() * Math.PI * 2,
      ease: 'none',
    })
    
    gsap.to(holderObjectsRef.current.position, {
      duration: 0.6,
      z: THREE.MathUtils.randInt(9, 11),
      ease: 'elastic.out(0.8)',
    })
  }
  
  // Exact createCylinderMesh from original
  const createCylinderMesh = () => {
    const radialSeg = Math.floor(THREE.MathUtils.randInt(1, 3))
    const heightSeg = Math.floor(THREE.MathUtils.randInt(1, 5))
    
    const geometry = new THREE.CylinderGeometry(1, 1, 4, 64 * radialSeg, 64 * heightSeg, true)
    geometryRef.current = geometry
    
    materialRef.current.uniforms.offsetSize.value = Math.floor(THREE.MathUtils.randInt(30, 60))
    materialRef.current.uniforms.size.value = 2
    materialRef.current.needsUpdate = true
    
    const pointsMesh = new THREE.Points(geometry, materialRef.current)
    pointsMesh.rotation.set(Math.PI / 2, 0, 0)
    holderObjectsRef.current.add(pointsMesh)
    pointsMeshRef.current = pointsMesh
    
    let rotY = 0
    let posZ = THREE.MathUtils.randInt(9, 11)
    
    if (Math.random() < 0.2) {
      rotY = Math.PI / 2
      posZ = THREE.MathUtils.randInt(10, 11.5)
    }
    
    gsap.to(holderObjectsRef.current.rotation, {
      duration: 0.2,
      y: rotY,
      ease: 'elastic.out(0.2)',
    })
    
    gsap.to(holderObjectsRef.current.position, {
      duration: 0.6,
      z: posZ,
      ease: 'elastic.out(0.8)',
    })
  }
  
  // Exact resetMesh from original
  const resetMesh = () => {
    if (propertiesRef.current.autoMix) {
      destroyMesh()
      
      if (Math.random() < 0.5) {
        createCylinderMesh()
      } else {
        createBoxMesh()
      }
      
      gsap.to(materialRef.current.uniforms.frequency, {
        duration: 2,
        value: THREE.MathUtils.randFloat(0.5, 3),
        ease: 'expo.inOut',
      })
    }
  }
  
  // Exact destroyMesh from original
  const destroyMesh = () => {
    if (pointsMeshRef.current && holderObjectsRef.current) {
      holderObjectsRef.current.remove(pointsMeshRef.current)
      
      if (geometryRef.current) {
        geometryRef.current.dispose()
      }
      
      pointsMeshRef.current = null
      geometryRef.current = null
    }
  }
  
  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  )
}
