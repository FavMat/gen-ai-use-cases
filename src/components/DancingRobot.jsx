import React, { useEffect, useState } from 'react';
import './DancingRobot.css';

export default function DancingRobot() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        // We multiply by a factor (e.g. 5) so the robot loops its dance multiple times as you scroll
        setScrollProgress((window.scrollY / totalScroll) * 5); 
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // init
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="robot-container">
      <div className="mecha-robot" style={{ '--scroll': scrollProgress }}>
        <div className="mecha-aura"></div>
        
        {/* Head */}
        <div className="mecha-head">
          <div className="visor-glow"></div>
        </div>
        
        {/* Torso */}
        <div className="mecha-torso">
          <div className="chest-plate"></div>
          <div className="core-reactor"></div>
          <div className="ab-plate"></div>
        </div>
        
        {/* Arms */}
        <div className="mecha-arm left">
          <div className="shoulder-armor"></div>
          <div className="upper-arm"></div>
          <div className="elbow-joint"></div>
          <div className="lower-arm">
            <div className="blade"></div>
          </div>
        </div>
        
        <div className="mecha-arm right">
          <div className="shoulder-armor"></div>
          <div className="upper-arm"></div>
          <div className="elbow-joint"></div>
          <div className="lower-arm">
            <div className="blade"></div>
          </div>
        </div>
        
        {/* Legs */}
        <div className="mecha-leg left">
          <div className="hip-joint"></div>
          <div className="thigh-armor"></div>
          <div className="knee-joint"></div>
          <div className="shin-armor"></div>
          <div className="mecha-foot"></div>
        </div>
        
        <div className="mecha-leg right">
          <div className="hip-joint"></div>
          <div className="thigh-armor"></div>
          <div className="knee-joint"></div>
          <div className="shin-armor"></div>
          <div className="mecha-foot"></div>
        </div>
      </div>
    </div>
  );
}
