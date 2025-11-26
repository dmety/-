import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ShapeType } from '../types';
import { generateShape } from '../services/mathShapes';

interface ParticlesProps {
  shapeType: ShapeType;
  color: string;
  count: number;
  handDistance: number; // 0 to 1
  isHandDetected: boolean;
  aiPoints: Float32Array | null;
}

const Particles: React.FC<ParticlesProps> = ({ shapeType, color, count, handDistance, isHandDetected, aiPoints }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Store current and target positions for interpolation
  const currentPositions = useMemo(() => new Float32Array(count * 3), [count]);
  
  // Target positions change when shape changes
  const targetPositions = useMemo(() => {
    return generateShape(shapeType, count, aiPoints);
  }, [shapeType, count, aiPoints]);

  // Initial random positions
  useEffect(() => {
    if (pointsRef.current) {
      const geo = pointsRef.current.geometry;
      const positions = geo.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i++) {
        currentPositions[i] = (Math.random() - 0.5) * 10; // Start exploded
      }
    }
  }, [count, currentPositions]);

  // Use a custom shader or simple points material?
  // Standard PointsMaterial is faster to implement correctly in one go.
  // We manipulate geometry attributes in useFrame for the "Explosion/Breathing" effect.
  
  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const geo = pointsRef.current.geometry;
    const positions = geo.attributes.position.array as Float32Array;

    // Interaction Logic:
    // If hand detected:
    //   Scale factor = 1 + (handDistance * 2).
    //   We lerp positions towards target * scale.
    // If not detected:
    //   Idling breathing animation.

    const time = state.clock.getElapsedTime();
    const lerpSpeed = 3.0 * delta; // Smooth transition
    
    // Calculate global modifier based on hands
    let expansion = 1.0;
    let noiseAmplitude = 0.05;

    if (isHandDetected) {
      // Hand control overrides idle animation
      // handDistance 0 (pinch) -> small/condensed
      // handDistance 1 (spread) -> large/exploded
      expansion = 0.5 + (handDistance * 3.5); 
      noiseAmplitude = 0.02 + (handDistance * 0.1);
    } else {
      // Idle animation
      expansion = 1.0 + Math.sin(time * 0.8) * 0.2;
    }

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Target Coordinates
      const tx = targetPositions[i3];
      const ty = targetPositions[i3 + 1];
      const tz = targetPositions[i3 + 2];

      // Apply expansion
      const targetX = tx * expansion;
      const targetY = ty * expansion;
      const targetZ = tz * expansion;

      // Add some noise/jitter for "Energy" look
      const noiseX = (Math.random() - 0.5) * noiseAmplitude;
      const noiseY = (Math.random() - 0.5) * noiseAmplitude;
      const noiseZ = (Math.random() - 0.5) * noiseAmplitude;

      // Lerp current to target
      positions[i3] += (targetX + noiseX - positions[i3]) * lerpSpeed;
      positions[i3 + 1] += (targetY + noiseY - positions[i3 + 1]) * lerpSpeed;
      positions[i3 + 2] += (targetZ + noiseZ - positions[i3 + 2]) * lerpSpeed;
    }

    geo.attributes.position.needsUpdate = true;
    
    // Rotate the whole system slowly if hands not interacting strongly
    if (!isHandDetected) {
      pointsRef.current.rotation.y += 0.1 * delta;
    } else {
       // Gentle follow or stabilize
       pointsRef.current.rotation.y += 0.02 * delta;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={currentPositions} // Initial buffer
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={color}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default Particles;
