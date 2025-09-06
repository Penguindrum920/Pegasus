// src/Experience.jsx

import { useMatcapTexture, Center, Text3D, OrbitControls } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const geometries = [
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.SphereGeometry(1, 32, 16),
  new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
  new THREE.TorusGeometry(1, 0.6, 16, 32),
  new THREE.IcosahedronGeometry(1, 0)
];

const material = new THREE.MeshMatcapMaterial()

export default function Experience({ onAboutClick, isClicked }) {
    const objects = useRef([]);
    const { gl } = useThree();

    const [matcapTexture] = useMatcapTexture('8CAEBC_3A4443_506463_DAEFEF', 256)

    useFrame((state, delta) => {
        if (isClicked) {
            for (const object of objects.current) {
                if (object) {
                    object.position.x += (object.position.x > 0 ? 1 : -1) * delta * 2;
                    object.position.y += (object.position.y > 0 ? 1 : -1) * delta * 2;
                    object.position.z += (object.position.z > 0 ? 1 : -1) * delta * 2;
                    
                    object.scale.x = Math.max(0, object.scale.x - delta * 0.5);
                    object.scale.y = Math.max(0, object.scale.y - delta * 0.5);
                    object.scale.z = Math.max(0, object.scale.z - delta * 0.5);
                }
            }
        } else {
            for (const object of objects.current) {
                if (object) {
                    object.rotation.y += delta * 0.2
                }
            }
        }
    })

    useEffect(() => {
        matcapTexture.colorSpace = THREE.SRGBColorSpace
        matcapTexture.needsUpdate = true
        material.matcap = matcapTexture
        material.needsUpdate = true
    }, [matcapTexture])

    const handlePointerOver = () => {
        gl.domElement.style.cursor = 'pointer';
    };

    const handlePointerOut = () => {
        gl.domElement.style.cursor = 'auto';
    };

    return (
        <>
            <Perf position="top-left" />
            <OrbitControls makeDefault />

            <Center>
                <Text3D
                    material={material}
                    font="./fonts/helvetiker_regular.typeface.json"
                    size={0.75}
                    height={0.2}
                    curveSegments={12}
                    bevelEnabled
                    bevelThickness={0.02}
                    bevelSize={0.02}
                    bevelOffset={0}
                    bevelSegments={5}
                    onClick={onAboutClick}
                    onPointerOver={handlePointerOver}
                    onPointerOut={handlePointerOut}
                >
                    ABOUT US
                </Text3D>
            </Center>

            {[...Array(100)].map((value, index) => {
                const randomGeometry = geometries[Math.floor(Math.random() * geometries.length)];
                return (
                    <mesh
                        ref={(element) => objects.current[index] = element}
                        key={index}
                        geometry={randomGeometry}
                        material={material}
                        position={[
                            (Math.random() - 0.5) * 10,
                            (Math.random() - 0.5) * 10,
                            (Math.random() - 0.5) * 10
                        ]}
                        scale={0.2 + Math.random() * 0.2}
                        rotation={[
                            Math.random() * Math.PI,
                            Math.random() * Math.PI,
                            0
                        ]}
                    />
                );
            })}
        </>
    );
}