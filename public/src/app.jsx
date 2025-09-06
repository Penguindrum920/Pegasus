// src/App.jsx

import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience.jsx';

export default function App() {
    const aboutRef = useRef(null);
    const [isClicked, setIsClicked] = useState(false);

    // Check for the URL parameter on initial load
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('view') === 'about-us') {
            setIsClicked(true);
            // Scroll to the content if it's already rendered
            if (aboutRef.current) {
                aboutRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, []);

    const handleAboutClick = () => {
        setIsClicked(true);
        if (aboutRef.current) {
            aboutRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div style={{ position: 'relative', height: '200vh' }}>
            <div style={{ height: '100vh', position: 'relative' }}>
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
                    padding: '2rem'
                }}
            >
                <div style={{ maxWidth: '800px' }}>
                    <h2 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Our Motto</h2>
                    <p style={{ fontSize: '1.5rem', lineHeight: '1.6' }}>
                        Innovating the future, one byte at a time.
                    </p>
                </div>
            </section>
        </div>
    );
}
