import './App.css'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { useMemo, useRef } from 'react'

function Planet({ radius = 1, color = '#88c', distance = 5, speed = 0.3, initialAngle = 0 }) {
  const ref = useRef()
  const angleRef = useRef(initialAngle)
  useMemo(() => { angleRef.current = initialAngle }, [initialAngle])
  useFrame(({ clock }) => {
    const dt = Math.min(clock.getDelta(), 0.033)
    angleRef.current += dt * speed
    const x = Math.cos(angleRef.current) * distance
    const z = Math.sin(angleRef.current) * distance
    if (ref.current) {
      ref.current.position.set(x, 0, z)
      ref.current.rotation.y += dt * 0.5
    }
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color={color} metalness={0.35} roughness={0.5} />
    </mesh>
  )
}

function Sun() {
  const ref = useRef()
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y += Math.min(clock.getDelta(), 0.033) * 0.15 })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2.8, 48, 48]} />
      <meshStandardMaterial color={0xffc34d} emissive={0xffa000} emissiveIntensity={0.5} metalness={0.2} roughness={0.4} />
    </mesh>
  )
}

function Scene() {
  const planets = [
    { radius: 0.9, color: '#58d5ff', distance: 6, speed: 0.3 },
    { radius: 1.0, color: '#ff7eb6', distance: 10.2, speed: 0.38 },
    { radius: 1.1, color: '#9dff7e', distance: 14.4, speed: 0.46 },
    { radius: 1.2, color: '#ffdf6d', distance: 18.6, speed: 0.54 },
  ]
  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[0,0,0]} intensity={2.0} distance={0} decay={2} color={0xfff0c8} />
      <Sun />
      {planets.map((p, i) => (
        <Planet key={i} radius={p.radius} color={p.color} distance={p.distance} speed={p.speed} initialAngle={Math.random()*Math.PI*2} />
      ))}
      <Stars radius={300} depth={60} count={isMobile() ? 700 : 1500} factor={2} fade speed={0.2} />
      <OrbitControls enablePan={false} />
    </>
  )
}

function isMobile() { return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) }

export default function App() {
  return (
    <div style={{ width:'100vw', height:'100vh' }}>
      <Canvas camera={{ position: [0, 6, 26], fov: 60, near: 0.1, far: 1000 }} dpr={[1, isMobile() ? 1.5 : 2]}>
        <Scene />
      </Canvas>
      <div style={{ position:'absolute', top: 12, left: 12 }}>
        <a href="/" style={{ color: 'white', textDecoration: 'none', background:'rgba(0,0,0,0.4)', padding:'8px 12px', borderRadius: 10 }}>Back</a>
      </div>
    </div>
  )
}

