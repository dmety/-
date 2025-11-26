import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Particles from './components/Particles';
import HandManager from './components/HandManager';
import UI from './components/UI';
import { ShapeType } from './types';

const App: React.FC = () => {
  const [shape, setShape] = useState<ShapeType>(ShapeType.HEART);
  const [color, setColor] = useState<string>('#ff4d4d');
  const [handData, setHandData] = useState({ distance: 0, detected: false });
  const [showDebug, setShowDebug] = useState(true);
  
  // AI State
  const [aiPoints, setAiPoints] = useState<Float32Array | null>(null);

  const handleHandUpdate = useCallback((distance: number, detected: boolean) => {
    // We update state here. Note: For extremely high perf apps, we might use a ref 
    // and bypass React state for the animation loop, but for this complexity,
    // React state updates (batched) are usually fine, or we can use a store.
    // However, to prevent excessive re-renders of the whole tree, the Particles
    // component uses Refs internally for the animation loop, so passing props 
    // down is okay as long as we don't block the main thread.
    setHandData({ distance, detected });
  }, []);

  const handleAiGenerate = (points: Float32Array, prompt: string) => {
    setAiPoints(points);
    // Color suggestion based on prompt?
    // Simple heuristic:
    if (prompt.includes('fire')) setColor('#ffaa00');
    else if (prompt.includes('water') || prompt.includes('ocean')) setColor('#00aaff');
    else if (prompt.includes('grass') || prompt.includes('tree')) setColor('#44ff44');
    else setColor('#ffffff');
  };

  return (
    <div className="relative w-full h-screen bg-black">
      
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <color attach="background" args={['#050505']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          
          <Particles 
            shapeType={shape} 
            color={color} 
            count={6000} 
            handDistance={handData.distance}
            isHandDetected={handData.detected}
            aiPoints={aiPoints}
          />
          
          <OrbitControls 
            enableZoom={true} 
            enablePan={false} 
            autoRotate={!handData.detected}
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>

      {/* Logic & UI Layers */}
      <HandManager 
        onHandUpdate={handleHandUpdate} 
        showDebug={showDebug} 
      />
      
      <UI 
        currentShape={shape} 
        onShapeChange={setShape} 
        color={color} 
        onColorChange={setColor}
        isHandDetected={handData.detected}
        onAiGenerate={handleAiGenerate}
        showDebug={showDebug}
        onToggleDebug={() => setShowDebug(!showDebug)}
      />
    </div>
  );
};

export default App;
