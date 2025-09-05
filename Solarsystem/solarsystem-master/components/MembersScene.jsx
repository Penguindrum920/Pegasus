import React, { useState, useRef, useEffect } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'

import { CameraProvider } from '../context/Camera'
import { ExplosionProvider } from '../context/Explosions'
import { TrailProvider } from '../context/Trails'

import Stars from './Stars'
import SimpleMembersPlanets from './SimpleMembersPlanets'

// Member data - using correct web paths and fixed names
const members = [
  { name: 'Savitha G', role: 'Teacher Coordinator', color: '#ff6b35', size: 3, distance: 0, isSun: true, image: 'Pegasus\public\savitha.jpg' },
  { name: 'Kavish Narendra Raut', role: 'Club Head', color: '#4ecdc4', size: 1.2, distance: 25, image: 'Pegasus\public\kavish.jpg' },
  { name: 'Hrudai Nirmal', role: 'Vice President', color: '#45b7d1', size: 1.1, distance: 35, image: 'Pegasus\public\hrudai.jpg' },
  { name: 'Bhavani Krupakara', role: 'Vice President', color: '#96ceb4', size: 1.1, distance: 45, image: 'Pegasus\public\bhavani.jpg' },
  { name: 'Shivam', role: 'Technical Head', color: '#feca57', size: 1.0, distance: 55, image: 'Pegasus\public\shivam.jpg' },
  { name: 'Ayush Kumar', role: 'Technical Head', color: '#ff9ff3', size: 1.0, distance: 65, image: 'Pegasus\public\ayush.jpg' },
  { name: 'Aditya Kaushik', role: 'Design Head', color: '#54a0ff', size: 0.9, distance: 75, image: 'Pegasus\public\aditya.jpg' },
  { name: 'Retash Reddy', role: 'Core Member', color: '#5f27cd', size: 0.8, distance: 85, image: 'Pegasus\public\retash.jpg' },
  { name: 'Bhuvan', role: 'Core Member', color: '#00d2d3', size: 0.8, distance: 95, image: 'Pegasus\public\bhuvan.jpg' },
  { name: 'Bhargav', role: 'Core Member', color: '#ff6348', size: 0.8, distance: 105, image: 'Pegasus\public\bhargav.jpg' },
  { name: 'Tejas NG', role: 'Core Member', color: '#2ed573', size: 0.8, distance: 115, image: 'Pegasus\public\tejas.jpg' },
]

function MemberOverlay({ member, onClose, isVisible, onPrevious, onNext, currentIndex, totalMembers }) {
  if (!isVisible || !member) return null

  return (
    <Html center>
      <div style={{
        background: 'rgba(0,0,0,0.9)',
        padding: '30px',
        borderRadius: '20px',
        color: 'white',
        textAlign: 'center',
        width: '80vw',
        maxWidth: '500px',
        minWidth: '350px',
        border: '2px solid ' + member.color,
        boxShadow: '0 0 30px ' + member.color,
        position: 'relative'
      }}>
        {/* Member Image - Bigger for mobile */}
        <div style={{
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          margin: '0 auto 25px auto',
          border: '4px solid ' + member.color,
          boxShadow: '0 0 25px ' + member.color + '44',
          overflow: 'hidden',
          background: 'linear-gradient(45deg, ' + member.color + ', ' + member.color + '88)'
        }}>
          <img 
            src={member.image} 
            alt={member.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
            onError={(e) => {
              console.log('Image failed to load:', member.image, 'Error:', e)
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', member.image)
            }}
          />
          <div style={{
            width: '100%',
            height: '100%',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(45deg, ' + member.color + ', ' + member.color + '88)'
          }}>
            <span style={{ fontSize: '16px', opacity: 0.7 }}>Upload Image</span>
          </div>
        </div>
        
        <h2 style={{ color: member.color, margin: '0 0 15px 0', fontSize: '28px' }}>{member.name}</h2>
        <p style={{ margin: '0 0 25px 0', fontSize: '20px' }}>{member.role}</p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button 
            onClick={onPrevious}
            style={{
              background: member.color,
              color: 'white',
              border: 'none',
              padding: '12px 16px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '20px',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ←
          </button>
          
          <span style={{ fontSize: '16px', opacity: 0.7 }}>
            {currentIndex + 1} of {totalMembers}
          </span>
          
          <button 
            onClick={onNext}
            style={{
              background: member.color,
              color: 'white',
              border: 'none',
              padding: '12px 16px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '20px',
              width: '50px',
              height: '50px',
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
            padding: '12px 25px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Close
        </button>
      </div>
    </Html>
  )
}

// MembersScene component
const MembersScene = () => {
  const [selectedMember, setSelectedMember] = useState(null)
  const [focusedIndex, setFocusedIndex] = useState(0)

  const handlePlanetClick = (index) => {
    console.log('Member clicked:', members[index].name, 'index:', index)
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

  // Scroll navigation
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault()
      const direction = e.deltaY > 0 ? 1 : -1
      setFocusedIndex(prev => {
        const newIndex = (prev + direction + members.length) % members.length
        return newIndex
      })
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [])

  return (
    <CameraProvider>
      <ExplosionProvider>
        <TrailProvider>
          {/* Removed original Sun component - using sun from SimpleMembersPlanets */}
          <SimpleMembersPlanets 
            members={members}
            onPlanetClick={handlePlanetClick}
            selectedMember={selectedMember}
          />
          <Stars count={5000} />

          <MemberOverlay 
            member={selectedMember !== null ? members[selectedMember] : null}
            onClose={handleCloseMember}
            onPrevious={handlePreviousMember}
            onNext={handleNextMember}
            currentIndex={selectedMember}
            totalMembers={members.length}
            isVisible={selectedMember !== null}
          />

          {/* Instruction note - moved further down */}
          <Html position={[0, -120, 0]} center>
            <div style={{
              color: 'white',
              textAlign: 'center',
              fontSize: '16px',
              background: 'rgba(0,0,0,0.6)',
              padding: '12px 30px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              minWidth: '400px',
              whiteSpace: 'nowrap'
            }}>
              Click on the planets to learn more about the members
            </div>
          </Html>
        </TrailProvider>
      </ExplosionProvider>
    </CameraProvider>
  )
}

export default MembersScene