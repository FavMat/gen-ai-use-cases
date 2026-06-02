import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './HolographicRobot.css';

export default function HolographicRobot() {
  const containerRef = useRef(null);
  
  // Track scroll exactly from top to bottom of the page
  const { scrollYProgress } = useScroll();

  // Create 30+ dynamic transforms mapped exactly to scroll
  // We'll map the scroll progress (0 to 1) to various translation and rotation values
  
  // Main float & zoom effect
  const mainScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.2, 0.9]);
  const mainY = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const mainRotate = useTransform(scrollYProgress, [0, 1], [0, 15]);

  // Slicing the hyper-realistic robot image into 30 distinct armor plates
  // using CSS clip-path polygons, and driving them independently.
  
  const createSlice = (clipPath, moveX, moveY, rotateZ, scale, delayStr = "0") => {
    return {
      clipPath,
      x: useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, moveX * 1.5, moveX, 0]),
      y: useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, moveY * 1.5, moveY, 0]),
      rotate: useTransform(scrollYProgress, [0, 0.4, 0.8, 1], [0, rotateZ, rotateZ * 0.5, 0]),
      scale: useTransform(scrollYProgress, [0, 0.5, 1], [1, scale, 1]),
    };
  };

  // Define 30 distinct slices of the image
  const slices = [
    // Head / Face
    createSlice('polygon(30% 0%, 70% 0%, 60% 20%, 40% 20%)', 0, -100, 5, 1.1), // Forehead crown
    createSlice('polygon(40% 20%, 60% 20%, 65% 40%, 35% 40%)', 0, -50, -5, 1.05), // Upper brow
    createSlice('polygon(35% 40%, 48% 40%, 48% 50%, 30% 50%)', -80, -20, -15, 1.2), // Left Eye plate
    createSlice('polygon(52% 40%, 65% 40%, 70% 50%, 52% 50%)', 80, -20, 15, 1.2), // Right Eye plate
    createSlice('polygon(48% 40%, 52% 40%, 52% 60%, 48% 60%)', 0, 0, 0, 1.5), // Nose bridge / Center Scanner
    createSlice('polygon(30% 50%, 48% 50%, 45% 65%, 25% 65%)', -120, 30, -20, 1.1), // Left Cheek
    createSlice('polygon(52% 50%, 70% 50%, 75% 65%, 55% 65%)', 120, 30, 20, 1.1), // Right Cheek
    createSlice('polygon(45% 65%, 55% 65%, 60% 80%, 40% 80%)', 0, 80, 0, 1.2), // Mouth / Respirator
    createSlice('polygon(40% 80%, 60% 80%, 55% 95%, 45% 95%)', 0, 150, 5, 1.1), // Jaw / Chin

    // Shoulders & Armor (Left)
    createSlice('polygon(0% 0%, 30% 0%, 25% 25%, 0% 30%)', -200, -150, -30, 1.3), // Far Left Shoulder Top
    createSlice('polygon(0% 30%, 25% 25%, 30% 50%, 0% 60%)', -250, -50, -45, 1.2), // Far Left Shoulder Mid
    createSlice('polygon(0% 60%, 30% 50%, 25% 80%, 0% 100%)', -220, 100, -20, 1.1), // Far Left Shoulder Low
    createSlice('polygon(25% 25%, 35% 40%, 25% 65%, 15% 45%)', -150, 0, -10, 1.4), // Inner Left Armor
    
    // Shoulders & Armor (Right)
    createSlice('polygon(70% 0%, 100% 0%, 100% 30%, 75% 25%)', 200, -150, 30, 1.3), // Far Right Shoulder Top
    createSlice('polygon(75% 25%, 100% 30%, 100% 60%, 70% 50%)', 250, -50, 45, 1.2), // Far Right Shoulder Mid
    createSlice('polygon(70% 50%, 100% 60%, 100% 100%, 75% 80%)', 220, 100, 20, 1.1), // Far Right Shoulder Low
    createSlice('polygon(65% 40%, 75% 25%, 85% 45%, 75% 65%)', 150, 0, 10, 1.4), // Inner Right Armor

    // Neck & Torso Cables
    createSlice('polygon(35% 40%, 25% 25%, 30% 0%, 40% 20%)', -100, -120, -15, 1.1), // Left Temple
    createSlice('polygon(65% 40%, 75% 25%, 70% 0%, 60% 20%)', 100, -120, 15, 1.1), // Right Temple
    createSlice('polygon(25% 65%, 45% 65%, 40% 80%, 20% 80%)', -100, 90, -15, 1.15), // Left Neck Cable
    createSlice('polygon(55% 65%, 75% 65%, 80% 80%, 60% 80%)', 100, 90, 15, 1.15), // Right Neck Cable
    createSlice('polygon(20% 80%, 40% 80%, 45% 100%, 10% 100%)', -150, 200, -25, 1.2), // Left Chest Plate
    createSlice('polygon(60% 80%, 80% 80%, 90% 100%, 55% 100%)', 150, 200, 25, 1.2), // Right Chest Plate
    createSlice('polygon(45% 95%, 55% 95%, 55% 100%, 45% 100%)', 0, 250, 0, 1.4), // Center Core Base

    // Floating Edge Details (Holographic glitches)
    createSlice('polygon(5% 10%, 10% 10%, 10% 15%, 5% 15%)', -300, -200, 180, 2.0),
    createSlice('polygon(90% 15%, 95% 15%, 95% 20%, 90% 20%)', 300, -250, -180, 2.0),
    createSlice('polygon(8% 80%, 12% 80%, 12% 85%, 8% 85%)', -250, 200, 90, 2.5),
    createSlice('polygon(88% 75%, 92% 75%, 92% 80%, 88% 80%)', 280, 180, -90, 2.5),
    createSlice('polygon(15% 5%, 20% 5%, 20% 8%, 15% 8%)', -150, -300, 45, 3.0),
    createSlice('polygon(80% 8%, 85% 8%, 85% 12%, 80% 12%)', 150, -280, -45, 3.0),
  ];

  // Dynamic Neon Glow driven by scroll
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.8, 0.4]);
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.5, 1.1]);

  return (
    <div className="holographic-container" ref={containerRef}>
      
      {/* Background Neon Aura */}
      <motion.div 
        className="neon-aura"
        style={{ opacity: glowOpacity, scale: glowScale }}
      ></motion.div>

      {/* The Sliced Robot Container */}
      <motion.div 
        className="robot-assembly"
        style={{ 
          scale: mainScale, 
          y: mainY, 
          rotateZ: mainRotate 
        }}
      >
        {slices.map((slice, i) => (
          <motion.div
            key={i}
            className="robot-slice"
            style={{
              clipPath: slice.clipPath,
              WebkitClipPath: slice.clipPath,
              x: slice.x,
              y: slice.y,
              rotateZ: slice.rotate,
              scale: slice.scale,
              backgroundImage: 'url(/hyper-robot.png)',
            }}
          />
        ))}
      </motion.div>
      
      {/* Subtle Scanline Overlay */}
      <div className="scanlines"></div>
      
      {/* Dark gradient to blend the bottom */}
      <div className="hologram-fade"></div>
    </div>
  );
}
