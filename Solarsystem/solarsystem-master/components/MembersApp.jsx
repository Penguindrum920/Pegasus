import React, { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree, useLoader, extend } from '@react-three/fiber'
import { OrbitControls, Html, shaderMaterial } from '@react-three/drei'
import { Vector3, TextureLoader, Color } from 'three'
import noise from '../shaders/noise.glsl'

// Member data
const members = [
  { name: 'Savitha G', role: 'Teacher Coordinator', color: '#ff6b35', size: 3, distance: 0, isSun: true },
  { name: 'Kavish Narendra Raut', role: 'Club Head', color: '#4ecdc4', size: 1.2, distance: 8 },
  { name: 'Hrudai Nirmal', role: 'Vice President', color: '#45b7d1', size: 1.1, distance: 12 },
  { name: 'Bhavani Krupakara', role: 'Vice President', color: '#96ceb4', size: 1.1, distance: 16 },
  { name: 'Shivam', role: 'Technical Head', color: '#feca57', size: 1.0, distance: 20 },
  { name: 'Ayush Kumar', role: 'Technical Head', color: '#ff9ff3', size: 1.0, distance: 24 },
  { name: 'Aditya Kaushik', role: 'Design Head', color: '#54a0ff', size: 0.9, distance: 28 },
  { name: 'Rethash Reddy', role: 'Core Member', color: '#5f27cd', size: 0.8, distance: 32 },
  { name: 'Bhuvan', role: 'Core Member', color: '#00d2d3', size: 0.8, distance: 36 },
  { name: 'Bhargav', role: 'Core Member', color: '#ff6348', size: 0.8, distance: 40 },
  { name: 'Tejas NG', role: 'Core Member', color: '#2ed573', size: 0.8, distance: 44 },
]

// Custom shader material for the sun
const SunShaderMaterial = shaderMaterial(
  { emissiveIntensity: 1.0, time: 0 },
  // Vertex Shader
  `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // Fragment Shader
  `
  uniform float time;
  uniform float emissiveIntensity;
  varying vec2 vUv;
  varying vec3 vPosition;

  ${noise}

  void main() {
      float noiseValue = noise(vPosition + time);

      vec3 color = mix(vec3(1.0, 0.1, 0.0), vec3(1.0, 0.2, 0.0), noiseValue);
      float intensity = (noiseValue * 0.5 + 0.5) * emissiveIntensity;

      gl_FragColor = vec4(color * intensity, 1.0);
  }
  `
)

extend({ SunShaderMaterial })

function Planet({ member, index, onClick, isSelected }) {
  const meshRef = useRef()
  const angleRef = useRef(Math.random() * Math.PI * 2)
  const speed = 0.1 + index * 0.02 // Much slower rotation
  const texture = useLoader(TextureLoader, '/textures/planet.jpg')

  useFrame((state, delta) => {
    if (meshRef.current && !member.isSun) {
      angleRef.current += delta * speed
      const x = Math.cos(angleRef.current) * member.distance
      const z = Math.sin(angleRef.current) * member.distance
      meshRef.current.position.set(x, 0, z)
      meshRef.current.rotation.y += delta * 0.1 // Slower self-rotation
    } else if (meshRef.current && member.isSun) {
      meshRef.current.rotation.y += delta * 0.05 // Slower sun rotation
    }
  })

  if (member.isSun) {
    return (
      <mesh
        ref={meshRef}
        onClick={() => onClick(index)}
        scale={isSelected ? 1.2 : 1}
      >
        <sphereGeometry args={[member.size, 32, 32]} />
        <sunShaderMaterial emissiveIntensity={5} time={0} />
      </mesh>
    )
  }

  return (
    <mesh
      ref={meshRef}
      onClick={() => onClick(index)}
      scale={isSelected ? 1.2 : 1}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[member.size, 32, 32]} />
      <meshStandardMaterial 
        map={texture}
        color={member.color}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  )
}

function MemberOverlay({ member, onClose, isVisible, onPrevious, onNext, currentIndex, totalMembers }) {
  if (!isVisible || !member) return null

  return (
    <Html center>
      <div style={{
        background: 'rgba(0,0,0,0.9)',
        padding: '25px',
        borderRadius: '15px',
        color: 'white',
        textAlign: 'center',
        minWidth: '350px',
        border: '2px solid ' + member.color,
        boxShadow: '0 0 30px ' + member.color,
        position: 'relative'
      }}>
        <h2 style={{ color: member.color, margin: '0 0 10px 0', fontSize: '24px' }}>{member.name}</h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '18px' }}>{member.role}</p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <button 
            onClick={onPrevious}
            style={{
              background: member.color,
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '18px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ←
          </button>
          
          <span style={{ fontSize: '14px', opacity: 0.7 }}>
            {currentIndex + 1} of {totalMembers}
          </span>
          
          <button 
            onClick={onNext}
            style={{
              background: member.color,
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '18px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            →
          </button>
        </div>
        
        <button 
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Close
        </button>
      </div>
    </Html>
  )
}

function Scene({ onPlanetClick, selectedMember, onCloseMember, onPreviousMember, onNextMember }) {
  const { camera } = useThree()
  const [focusedIndex, setFocusedIndex] = useState(0)

  // Scroll navigation
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault()
      const direction = e.deltaY > 0 ? 1 : -1
      setFocusedIndex(prev => {
        const newIndex = (prev + direction + members.length) % members.length
        const member = members[newIndex]
        if (member && !member.isSun) {
          const targetPos = new Vector3(
            Math.cos(0) * member.distance,
            5,
            Math.sin(0) * member.distance + 20
          )
          camera.position.lerp(targetPos, 0.1)
          camera.lookAt(0, 0, 0)
        }
        return newIndex
      })
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [camera])

  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 0, 0]} intensity={50000} distance={0} decay={2} color="rgb(255, 207, 55)" />
      <directionalLight position={[10, 10, 5]} intensity={0.5} castShadow />
      
      {members.map((member, index) => (
        <Planet
          key={index}
          member={member}
          index={index}
          onClick={onPlanetClick}
          isSelected={selectedMember === index}
        />
      ))}

      <MemberOverlay 
        member={selectedMember !== null ? members[selectedMember] : null}
        onClose={onCloseMember}
        onPrevious={onPreviousMember}
        onNext={onNextMember}
        currentIndex={selectedMember}
        totalMembers={members.length}
        isVisible={selectedMember !== null}
      />
    </>
  )
}

function MembersApp() {
  const [selectedMember, setSelectedMember] = useState(null)

  const handlePlanetClick = (index) => {
    setSelectedMember(index)
  }

  const handleCloseMember = () => {
    setSelectedMember(null)
  }

  const handlePreviousMember = () => {
    if (selectedMember !== null) {
      const newIndex = (selectedMember - 1 + members.length) % members.length
      setSelectedMember(newIndex)
    }
  }

  const handleNextMember = () => {
    if (selectedMember !== null) {
      const newIndex = (selectedMember + 1) % members.length
      setSelectedMember(newIndex)
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
      <Canvas camera={{ position: [0, 20, 50], fov: 60 }}>
        <Scene 
          onPlanetClick={handlePlanetClick}
          selectedMember={selectedMember}
          onCloseMember={handleCloseMember}
          onPreviousMember={handlePreviousMember}
          onNextMember={handleNextMember}
        />
        <OrbitControls 
          enablePan={false}
          maxDistance={200}
          minDistance={20}
          enableZoom={true}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>
      
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        background: 'rgba(0,0,0,0.5)',
        padding: '10px',
        borderRadius: '8px'
      }}>
        <a href="/" style={{ color: 'white', textDecoration: 'none' }}>← Back to Home</a>
      </div>
      
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'white',
        background: 'rgba(0,0,0,0.5)',
        padding: '10px 20px',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        Click planets or scroll to navigate • Teacher Coordinator is the Sun
      </div>
    </div>
  )
}

export default MembersApp
