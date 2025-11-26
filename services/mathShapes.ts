import { ShapeType } from '../types';
import * as THREE from 'three';

export const generateShape = (type: ShapeType, count: number, aiPoints?: Float32Array | null): Float32Array => {
  if (type === ShapeType.AI_GENERATED && aiPoints) {
    // If we have AI points, we might need to pad or trim them to match 'count'
    // For simplicity, we just return them or fill the buffer.
    const buffer = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const srcIndex = i % (aiPoints.length / 3);
      buffer[i * 3] = aiPoints[srcIndex * 3];
      buffer[i * 3 + 1] = aiPoints[srcIndex * 3 + 1];
      buffer[i * 3 + 2] = aiPoints[srcIndex * 3 + 2];
    }
    return buffer;
  }

  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    let x = 0, y = 0, z = 0;
    
    // Normalized parameters
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const u = Math.random();
    const v = Math.random();

    switch (type) {
      case ShapeType.HEART:
        // Heart formula
        // x = 16sin^3(t)
        // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
        // z = variation for depth
        const t = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()); // distribute internally
        x = 16 * Math.pow(Math.sin(t), 3);
        y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        z = (Math.random() - 0.5) * 10 * r; 
        
        // Scale down
        x *= 0.1; y *= 0.1; z *= 0.1;
        break;

      case ShapeType.SATURN:
        // Planet + Ring
        if (Math.random() > 0.4) {
          // Ring
          const angle = Math.random() * Math.PI * 2;
          const radius = 2.5 + Math.random() * 1.5;
          x = Math.cos(angle) * radius;
          z = Math.sin(angle) * radius;
          y = (Math.random() - 0.5) * 0.2; // Thin disk
        } else {
          // Sphere
          const rad = 1.5 * Math.cbrt(Math.random());
          x = rad * Math.sin(phi) * Math.cos(theta);
          y = rad * Math.sin(phi) * Math.sin(theta);
          z = rad * Math.cos(phi);
        }
        break;

      case ShapeType.FLOWER:
        // Rose curve / Spherical harmonicsish
        const k = 5; // petals
        const rFlower = Math.cos(k * theta) + 2;
        const radF = rFlower * Math.random(); 
        x = radF * Math.cos(theta) * Math.sin(phi);
        z = radF * Math.sin(theta) * Math.sin(phi);
        y = (Math.cos(phi * 2) + 1) * 0.5; // Cup shape
        break;

      case ShapeType.MEDITATION:
        // Approximate a sitting figure with spheres/blobs
        const rand = Math.random();
        if (rand < 0.2) {
           // Head
           const rH = 0.6 * Math.cbrt(Math.random());
           x = rH * Math.sin(phi) * Math.cos(theta);
           y = rH * Math.sin(phi) * Math.sin(theta) + 2.2;
           z = rH * Math.cos(phi);
        } else if (rand < 0.6) {
           // Body (Oval)
           const rB = 1.0 * Math.cbrt(Math.random());
           x = rB * Math.sin(phi) * Math.cos(theta) * 1.2;
           y = rB * Math.sin(phi) * Math.sin(theta) * 1.5 + 0.5;
           z = rB * Math.cos(phi) * 0.8;
        } else {
           // Legs/Base (Flattened Sphere/Torus approximation)
           const angle = Math.random() * Math.PI * 2;
           const radL = 1.5 + Math.random();
           x = radL * Math.cos(angle);
           z = radL * Math.sin(angle);
           y = (Math.random() - 0.5) * 0.8 - 1.0;
        }
        break;

      case ShapeType.FIREWORKS:
        // Explosion sphere
        const rFire = 4 * Math.cbrt(Math.random());
        x = rFire * Math.sin(phi) * Math.cos(theta);
        y = rFire * Math.sin(phi) * Math.sin(theta);
        z = rFire * Math.cos(phi);
        break;
        
      default: // Cube default
        x = (Math.random() - 0.5) * 4;
        y = (Math.random() - 0.5) * 4;
        z = (Math.random() - 0.5) * 4;
    }

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
  }

  return positions;
};
