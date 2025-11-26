export enum ShapeType {
  HEART = 'HEART',
  FLOWER = 'FLOWER',
  SATURN = 'SATURN',
  MEDITATION = 'MEDITATION', // Approximating Buddha/Lotus
  FIREWORKS = 'FIREWORKS',
  AI_GENERATED = 'AI_GENERATED'
}

export interface ParticleState {
  targetShape: ShapeType;
  color: string;
  particleCount: number;
  handDistance: number; // 0 to 1, controlled by gesture
  isHandDetected: boolean;
  aiPrompt: string;
  aiPoints: Float32Array | null;
}

export interface HandLandmarkerResult {
  landmarks: { x: number; y: number; z: number }[][];
}
