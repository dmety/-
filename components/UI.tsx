import React, { useState } from 'react';
import { ShapeType } from '../types';
import { generatePointsFromText } from '../services/geminiService';
import { Loader2, Hand, Wand2, Palette, Box, Heart, Circle, User, Sun } from 'lucide-react';

interface UIProps {
  currentShape: ShapeType;
  onShapeChange: (s: ShapeType) => void;
  color: string;
  onColorChange: (c: string) => void;
  isHandDetected: boolean;
  onAiGenerate: (points: Float32Array, prompt: string) => void;
  showDebug: boolean;
  onToggleDebug: () => void;
}

const UI: React.FC<UIProps> = ({ 
  currentShape, 
  onShapeChange, 
  color, 
  onColorChange,
  isHandDetected,
  onAiGenerate,
  showDebug,
  onToggleDebug
}) => {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const colors = [
    '#ffffff', // White
    '#ff4d4d', // Red
    '#4dff4d', // Green
    '#4d4dff', // Blue
    '#ffff4d', // Yellow
    '#ff4dff', // Magenta
    '#4dffff', // Cyan
    '#ffa500', // Orange
  ];

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    try {
      const points = await generatePointsFromText(aiPrompt);
      onAiGenerate(points, aiPrompt);
      onShapeChange(ShapeType.AI_GENERATED);
    } catch (err) {
      alert("AI 生成失败，请检查 API Key 或重试。");
    } finally {
      setIsAiLoading(false);
    }
  };

  const getIcon = (shape: ShapeType) => {
    switch (shape) {
      case ShapeType.HEART: return <Heart size={16} />;
      case ShapeType.SATURN: return <Circle size={16} />;
      case ShapeType.MEDITATION: return <User size={16} />;
      case ShapeType.FLOWER: return <Sun size={16} />;
      case ShapeType.FIREWORKS: return <Wand2 size={16} />;
      case ShapeType.AI_GENERATED: return <Wand2 size={16} />;
      default: return <Box size={16} />;
    }
  };

  return (
    <>
      {/* Top Left Status */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
         <h1 className="text-xl font-bold bg-black/50 backdrop-blur px-3 py-1 rounded text-white border border-white/10">
           ZenParticles
         </h1>
         <div className={`flex items-center gap-2 px-3 py-1 rounded backdrop-blur border border-white/10 text-sm transition-colors ${isHandDetected ? 'bg-green-500/20 text-green-200 border-green-500/30' : 'bg-red-500/20 text-red-200 border-red-500/30'}`}>
            <Hand size={16} className={isHandDetected ? "animate-pulse" : ""} />
            {isHandDetected ? "已检测到手势" : "未检测到手势"}
         </div>
      </div>

      {/* Main Control Panel */}
      <div className={`absolute top-4 right-4 z-10 w-80 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-4 transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-[calc(100%+1rem)]'}`}>
        
        {/* Toggle Handle */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="absolute -left-10 top-0 bg-black/80 backdrop-blur-md p-2 rounded-l-lg border-y border-l border-white/10 text-white hover:bg-white/10"
        >
          {isMenuOpen ? '→' : '←'}
        </button>

        <div className="space-y-6">
          
          {/* Shape Selector */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">选择模型</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: ShapeType.HEART, label: "爱心" },
                { type: ShapeType.FLOWER, label: "花朵" },
                { type: ShapeType.SATURN, label: "土星" },
                { type: ShapeType.MEDITATION, label: "禅定" },
                { type: ShapeType.FIREWORKS, label: "烟花" },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => onShapeChange(item.type)}
                  className={`flex flex-col items-center justify-center py-3 rounded-lg border transition-all ${currentShape === item.type ? 'bg-white/20 border-white/40 text-white' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
                >
                  {getIcon(item.type)}
                  <span className="text-[10px] mt-1">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Generator */}
          <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-3 rounded-lg border border-indigo-500/30">
             <h3 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-2">
               <Wand2 size={12} /> Gemini 创意生成
             </h3>
             <form onSubmit={handleAiSubmit} className="flex gap-2">
               <input 
                 type="text" 
                 value={aiPrompt}
                 onChange={(e) => setAiPrompt(e.target.value)}
                 placeholder="例如：奔跑的马"
                 className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
               />
               <button 
                 type="submit" 
                 disabled={isAiLoading}
                 className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded text-xs font-medium disabled:opacity-50 transition-colors"
               >
                 {isAiLoading ? <Loader2 size={14} className="animate-spin" /> : "生成"}
               </button>
             </form>
          </div>

          {/* Color Picker */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Palette size={12} /> 粒子颜色
            </h3>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => onColorChange(c)}
                  style={{ backgroundColor: c }}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'border-transparent opacity-70'}`}
                />
              ))}
            </div>
          </div>

          {/* Settings */}
           <div className="pt-4 border-t border-white/10 flex justify-between items-center">
             <span className="text-xs text-gray-500">摄像头画面</span>
             <button 
               onClick={onToggleDebug}
               className={`w-10 h-5 rounded-full relative transition-colors ${showDebug ? 'bg-green-600' : 'bg-gray-700'}`}
             >
               <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showDebug ? 'left-6' : 'left-1'}`} />
             </button>
           </div>

        </div>
      </div>

      {/* Instructions Overlay (Bottom Center) */}
      {!isHandDetected && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center pointer-events-none w-full px-4">
          <p className="text-white/50 text-sm animate-bounce">
            请伸出双手控制粒子
          </p>
          <p className="text-white/30 text-xs mt-1">
            捏合缩小 • 张开扩散
          </p>
        </div>
      )}
    </>
  );
};

export default UI;