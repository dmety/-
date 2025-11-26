import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

interface HandManagerProps {
  onHandUpdate: (distance: number, isDetected: boolean) => void;
  showDebug?: boolean;
}

const HandManager: React.FC<HandManagerProps> = ({ onHandUpdate, showDebug = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const lastVideoTimeRef = useRef(-1);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const init = async () => {
      try {
        console.log("Initializing HandManager...");
        // 1. Initialize Vision Tasks with the correct WASM version matching package.json/importmap (0.10.14)
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        
        // 2. Create HandLandmarker with Fallback logic
        try {
          console.log("Attempting to load HandLandmarker with GPU...");
          landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
              delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 2
          });
        } catch (gpuError) {
          console.warn("GPU init failed, falling back to CPU", gpuError);
          landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
              delegate: "CPU"
            },
            runningMode: "VIDEO",
            numHands: 2
          });
        }

        console.log("HandLandmarker initialized.");

        // 3. Setup Webcam
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 }, 
            height: { ideal: 480 }, 
            facingMode: "user" 
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Wait for metadata to ensure we have dimensions
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
               videoRef.current.play();
            }
          };
          // Start prediction loop only when data is flowing
          videoRef.current.onloadeddata = () => {
            console.log("Video data loaded, starting predictions.");
            setIsReady(true);
            predict();
          };
        }
      } catch (e: any) {
        console.error("Failed to init hand tracker:", e);
        setErrorMsg("无法启动摄像头或模型加载失败");
      }
    };

    init();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
      }
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const predict = () => {
    // Ensure loop continues even if not ready yet
    requestRef.current = requestAnimationFrame(predict);

    if (landmarkerRef.current && videoRef.current && isReady) {
      // Basic check to ensure video is actually playing and has size
      if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
        return;
      }

      const startTimeMs = performance.now();
      
      if (videoRef.current.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = videoRef.current.currentTime;
        
        try {
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
        } catch (err) {
          // Occasional glitches in detection shouldn't crash the app
          console.warn("Detection error:", err);
        }
      }
    }
  };

  return (
    <div className={`fixed bottom-4 left-4 z-50 flex flex-col items-start transition-opacity duration-300 ${showDebug ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="rounded-lg overflow-hidden border-2 border-white/20 relative bg-black">
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
      {errorMsg && (
        <div className="mt-2 bg-red-500/80 text-white text-xs p-2 rounded max-w-[200px]">
          {errorMsg}
        </div>
      )}
    </div>
  );
};

export default HandManager;