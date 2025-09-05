import React, { useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'

// Simple individual planet component
function SimplePlanet({ member, index, onClick, isSelected }) {
  const meshRef = useRef()
  const angleRef = useRef(Math.random() * Math.PI * 2)
  const speed = 0.05 + index * 0.01 // Slower, more controlled rotation
  const texture = useLoader(TextureLoader, '/textures/planet.jpg')

  useFrame((state, delta) => {
    if (meshRef.current && !member.isSun) {
      angleRef.current += delta * speed
      const x = Math.cos(angleRef.current) * member.distance
      const z = Math.sin(angleRef.current) * member.distance
      meshRef.current.position.set(x, 0, z) // Keep on same plane for circular orbit
      meshRef.current.rotation.y += delta * 0.1
    } else if (meshRef.current && member.isSun) {
      meshRef.current.rotation.y += delta * 0.05
    }
  })

  const handleClick = (event) => {
    event.stopPropagation()
    console.log('Planet clicked:', member.name, 'index:', index)
    onClick(index)
  }

  if (member.isSun) {
    return (
      <>
        {/* Sun with realistic lighting */}
        <mesh
          ref={meshRef}
          scale={isSelected ? 1.2 : 1}
        >
          <sphereGeometry args={[member.size, 32, 32]} />
          <meshStandardMaterial 
            color={member.color}
            emissive={member.color}
            emissiveIntensity={2.0}
          />
        </mesh>
        
        {/* Point light to illuminate the solar system */}
        <pointLight 
          position={[0, 0, 0]} 
          intensity={30000} 
          color={'rgb(255, 207, 55)'}
          distance={200}
          decay={2}
        />
      </>
    )
  }

  return (
    <mesh
      ref={meshRef}
      onClick={handleClick}
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

// Simple planets component
const SimpleMembersPlanets = ({ members, onPlanetClick, selectedMember }) => {
  return (
    <>
      {members.map((member, index) => (
        <SimplePlanet
          key={index}
          member={member}
          index={index}
          onClick={onPlanetClick}
          isSelected={selectedMember === index}
        />
      ))}
    </>
  )
}

export default SimpleMembersPlanets