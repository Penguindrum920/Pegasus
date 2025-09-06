// src/App.jsx

import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience.jsx';

export default function App() {
    const aboutRef = useRef(null);
    const [isClicked, setIsClicked] = useState(false);

    const handleAboutClick = () => {
        setIsClicked(true);
        if (aboutRef.current) {
            aboutRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div style={{
            position: 'relative',
            height: '200vh',
            overflowY: 'scroll',
            scrollSnapType: 'y mandatory'
        }}>
            <div style={{ height: '100vh', position: 'relative', scrollSnapAlign: 'start' }}>
                <Canvas
                    camera={{
                        fov: 45,
                        near: 0.1,
                        far: 200,
                        position: [4, -2, 6]
                    }}
                >
                    <Experience onAboutClick={handleAboutClick} isClicked={isClicked} />
                </Canvas>
            </div>
            
            <section
                id="about-us-section"
                ref={aboutRef}
                style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgb(4, 5, 14)',
                    color: 'white',
                    textAlign: 'center',
                    padding: '2rem',
                    scrollSnapAlign: 'start'
                }}
            >
                <div style={{ maxWidth: '800px', opacity: isClicked ? 1 : 0, transition: 'opacity 1s ease-in-out 1s' }}>
                    <h2 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Our Motto</h2>
                    <p style={{ fontSize: '1.5rem', lineHeight: '1.6' }}>
                        Innovating the future, one byte at a time.
                    </p>
                </div>
            </section>
        </div>
    );
}