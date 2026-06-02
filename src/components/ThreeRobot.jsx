import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Cylinder, Sphere, Torus, Float, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// --------------------------------------------------------
// A single robotic tentacle made of 4 hierarchical segments
// --------------------------------------------------------
const RoboticTentacle = ({ index, total, scrollRef, materials }) => {
  const seg1 = useRef();
  const seg2 = useRef();
  const seg3 = useRef();
  const seg4 = useRef();

  // Spread tentacles evenly in a circle
  const angle = (index / total) * Math.PI * 2;
  const phase = index * 0.5; // Offset the wave for each tentacle
  const smoothedProgress = useRef(0);

  useFrame((state, delta) => {
    if (!seg1.current) return;
    
    // Use a fixed-factor lerp instead of damp to completely prevent delta-jitter during scroll
    const safeProgress = Number.isFinite(scrollRef.current) ? Math.max(0, Math.min(1, scrollRef.current)) : 0;
    smoothedProgress.current = THREE.MathUtils.lerp(smoothedProgress.current, safeProgress, 0.05);
    
    // Pure organic idle time
    const t = state.clock.elapsedTime * 0.8;
    // Very subtle pose offset, no crazy spinning
    const scrollOffset = smoothedProgress.current * 0.5; 
    
    // The base joint
    seg1.current.rotation.y = angle + Math.sin(t * 0.5 + phase) * 0.2;
    seg1.current.rotation.x = Math.PI / 2.5 + Math.sin(t + phase) * 0.3 - scrollOffset;

    // Segment 2 (bend)
    seg2.current.rotation.x = -0.5 + Math.cos(t * 1.2 + phase) * 0.4;
    
    // Segment 3 (curl)
    seg3.current.rotation.x = -0.5 + Math.sin(t * 1.5 + phase) * 0.4;
    
    // Segment 4 (tip claw)
    seg4.current.rotation.x = -0.3 + Math.cos(t * 2.0 + phase) * 0.5;
    // Tip also twists slightly
    seg4.current.rotation.z = Math.sin(t * 2.5 + phase) * 0.3;
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Base Segment */}
      <group ref={seg1}>
        {/* Joint */}
        <Sphere args={[0.2, 16, 16]} material={materials.joint} />
        {/* Arm */}
        <Cylinder args={[0.15, 0.1, 1.2, 16]} position={[0, 0.6, 0]} material={materials.metalDark} />
        
        {/* Second Segment */}
        <group ref={seg2} position={[0, 1.2, 0]}>
          <Sphere args={[0.15, 16, 16]} material={materials.joint} />
          <Cylinder args={[0.1, 0.08, 1.0, 16]} position={[0, 0.5, 0]} material={materials.metalLight} />
          
          {/* Third Segment */}
          <group ref={seg3} position={[0, 1.0, 0]}>
            <Sphere args={[0.12, 16, 16]} material={materials.joint} />
            <Cylinder args={[0.08, 0.05, 0.8, 16]} position={[0, 0.4, 0]} material={materials.metalDark} />
            
            {/* Tip/Claw Segment */}
            <group ref={seg4} position={[0, 0.8, 0]}>
              <Sphere args={[0.08, 16, 16]} material={materials.joint} />
              <Cylinder args={[0.05, 0.01, 0.6, 16]} position={[0, 0.3, 0]} material={materials.metalLight} />
              {/* Glowing tip scanner */}
              <Sphere args={[0.04, 16, 16]} position={[0, 0.6, 0]} material={materials.neonCyan} />
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

// --------------------------------------------------------
// The Main Cybernetic Sentinel Core
// --------------------------------------------------------
const SentinelCore = ({ scrollRef }) => {
  const coreRef = useRef();
  const ring1 = useRef();
  const ring2 = useRef();
  const ring3 = useRef();

  const materials = useMemo(() => ({
    metalDark: new THREE.MeshStandardMaterial({ color: '#020617', metalness: 0.9, roughness: 0.2 }),
    metalLight: new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.8, roughness: 0.3 }),
    joint: new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 1.0, roughness: 0.4 }),
    neonCyan: new THREE.MeshStandardMaterial({ color: '#0ea5e9', emissive: '#0ea5e9', emissiveIntensity: 4, toneMapped: false }),
    neonPurple: new THREE.MeshStandardMaterial({ color: '#8b5cf6', emissive: '#8b5cf6', emissiveIntensity: 2, toneMapped: false }),
  }), []);

  const smoothedProgress = useRef(0);

  useFrame((state, delta) => {
    if (!coreRef.current || !ring1.current || !ring2.current || !ring3.current) return;
    
    // Fixed-factor lerp for absolute stability during scroll
    const safeProgress = Number.isFinite(scrollRef.current) ? Math.max(0, Math.min(1, scrollRef.current)) : 0;
    smoothedProgress.current = THREE.MathUtils.lerp(smoothedProgress.current, safeProgress, 0.05);
    
    const t = state.clock.elapsedTime * 0.5;

    // Organic floating + scroll pushes it slightly down and tilts it
    coreRef.current.position.y = Math.sin(t * 2) * 0.2 - smoothedProgress.current * 0.5;
    
    // Pure time-based rotation, NO scroll fast-forwarding!
    coreRef.current.rotation.y = t * 0.5;
    coreRef.current.rotation.x = smoothedProgress.current * 0.2; // Gentle tilt forward when scrolling down

    // Rings spin organically, completely ignoring scroll
    ring1.current.rotation.x = t * 1.5;
    ring1.current.rotation.y = t * 1.0;
    
    ring2.current.rotation.y = -t * 2.0;
    ring2.current.rotation.z = t * 1.2;
    
    ring3.current.rotation.x = -t * 0.8;
    ring3.current.rotation.z = -t * 1.5;
  });

  return (
    <group position={[0, 0.5, 0]} scale={0.85}>
      <group ref={coreRef}>
        
        {/* Main Central Eye/Brain */}
        <Sphere args={[0.8, 32, 32]} material={materials.neonCyan} />
        <Sphere args={[0.85, 16, 16]} material={materials.metalDark} wireframe />

        {/* Orbiting Armor Rings */}
        <group ref={ring1}>
          <Torus args={[1.2, 0.1, 16, 64]} material={materials.metalLight} />
          <Cylinder args={[0.05, 0.05, 2.8]} rotation={[Math.PI/2, 0, 0]} material={materials.neonPurple} />
        </group>
        <group ref={ring2}>
          <Torus args={[1.5, 0.15, 16, 64]} material={materials.metalDark} />
        </group>
        <group ref={ring3}>
          <Torus args={[1.8, 0.05, 16, 64]} material={materials.metalLight} />
        </group>

        {/* Generate 8 complex mechanical tentacles */}
        {[...Array(8)].map((_, i) => (
          <RoboticTentacle 
            key={i} 
            index={i} 
            total={8} 
            scrollRef={scrollRef} 
            materials={materials} 
          />
        ))}

      </group>
    </group>
  );
};

export default function ThreeRobot() {
  const scrollRef = useRef(0);

  useEffect(() => {
    let maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    
    const resizeObserver = new ResizeObserver(() => {
      maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    });
    resizeObserver.observe(document.body);

    const handleScroll = () => {
      if (maxScroll > 0) {
        scrollRef.current = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      } else {
        scrollRef.current = 0;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, backgroundColor: 'transparent', pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 1.5, 8], fov: 45 }} dpr={[1, 1.5]} performance={{ min: 0.5 }} raycaster={{ enabled: false }}>
        
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={2.5} color="#ffffff" />
        <directionalLight position={[-10, 5, -5]} intensity={2} color="#8b5cf6" />
        <pointLight position={[0, 0, 5]} intensity={2} color="#0ea5e9" distance={15} />
        
        <Environment preset="night" />
        
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
          <SentinelCore scrollRef={scrollRef} />
        </Float>
        
        {/* Baked shadow for massive performance gain, no need to recalculate every frame */}
        <ContactShadows position={[0, -3.5, 0]} opacity={0.6} scale={15} blur={3} far={10} resolution={256} frames={1} />

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={1} intensity={1.5} resolutionScale={0.5} />
        </EffectComposer>

      </Canvas>
      
    </div>
  );
}
