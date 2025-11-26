import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

interface HandManagerProps {
  onHandUpdate: (distance: number, isDetected: boolean) => void;
  showDebug?: boolean;
}

const HandManager: React.FC<HandManagerProps> = ({ onHandUpdate, showDebug = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const lastVideoTimeRef = useRef(-1);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });

        // Setup Webcam
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480, facingMode: "user" } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', () => {
            setIsReady(true);
            predict();
          });
        }
      } catch (e) {
        console.error("Failed to init hand tracker:", e);
      }
    };

    init();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const predict = () => {
    if (landmarkerRef.current && videoRef.current && isReady) {
      const startTimeMs = performance.now();
      
      if (videoRef.current.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = videoRef.current.currentTime;
        
        const detections = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
        
        let distance = 0;
        let detected = false;

        if (detections.landmarks && detections.landmarks.length > 0) {
          detected = true;
          
          // Logic:
          // If 2 hands: Distance between index finger tips (index 8).
          // If 1 hand: Distance between thumb tip (4) and index tip (8) (Pinch).
          
          if (detections.landmarks.length === 2) {
            const h1 = detections.landmarks[0][8]; // Index tip hand 1
            const h2 = detections.landmarks[1][8]; // Index tip hand 2
            
            // Euclidean distance in screen space (approx)
            const dx = h1.x - h2.x;
            const dy = h1.y - h2.y;
            // Normalize raw distance. Usually ranges 0.05 to 0.8
            const rawDist = Math.sqrt(dx*dx + dy*dy); 
            distance = Math.min(Math.max((rawDist - 0.1) * 2, 0), 1); // Map to 0-1
            
          } else {
            // One hand pinch
            const thumb = detections.landmarks[0][4];
            const index = detections.landmarks[0][8];
            const dx = thumb.x - index.x;
            const dy = thumb.y - index.y;
            const rawDist = Math.sqrt(dx*dx + dy*dy);
            // Pinch is small distance, spread is large.
            // Map 0.02 (closed) -> 0.2 (open) to 0 -> 1
            distance = Math.min(Math.max((rawDist - 0.02) * 5, 0), 1);
          }
        }
        
        onHandUpdate(distance, detected);
      }
    }
    requestRef.current = requestAnimationFrame(predict);
  };

  return (
    <div className={`fixed bottom-4 left-4 z-50 rounded-lg overflow-hidden border-2 border-white/20 transition-opacity duration-300 ${showDebug ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline
        muted
        className="w-32 h-24 object-cover transform scale-x-[-1]"
      />
      <div className="absolute top-0 left-0 w-full bg-black/50 text-[10px] text-white p-1 text-center">
        调试视图
      </div>
    </div>
  );
};

export default HandManager;