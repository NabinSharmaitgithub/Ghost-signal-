import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, MeshDistortMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Extend JSX namespace to support React Three Fiber elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      group: any;
      mesh: any;
      dodecahedronGeometry: any;
      icosahedronGeometry: any;
      meshStandardMaterial: any;
    }
  }
}

const CyberCore = () => {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (outerRef.current) {
      outerRef.current.rotation.x = t * 0.1;
      outerRef.current.rotation.y = t * 0.15;
    }
    if (innerRef.current) {
        innerRef.current.rotation.x = -t * 0.2;
        innerRef.current.rotation.z = t * 0.1;
    }
  });

  return (
    <group>
      {/* Central Solid Core */}
      <Float speed={4} rotationIntensity={1} floatIntensity={1}>
        <mesh ref={innerRef}>
          <dodecahedronGeometry args={[1.2, 0]} />
          <meshStandardMaterial 
            color="#064e3b" // Deep emerald
            emissive="#10b981" // Bright emerald glow
            emissiveIntensity={0.5}
            roughness={0.1}
            metalness={1}
          />
        </mesh>
      </Float>

      {/* Outer Wireframe Shield */}
      <mesh ref={outerRef} scale={1.8}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#34d399"
          wireframe
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Glitchy Digital Particles */}
      <Sparkles 
        count={50} 
        scale={6} 
        size={4} 
        speed={0.4} 
        opacity={0.5} 
        color="#10b981"
      />
    </group>
  );
};

const ThreeHero: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[400px]">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#34d399" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#064e3b" />
          
          <CyberCore />
          
          {/* Allow user to rotate but disable zoom/pan to keep it strictly decorative */}
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
    </div>
  );
};

export default ThreeHero;