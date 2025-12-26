
import React, { useState } from 'react';
import { GIFTS, Gift } from '../types';
import { soundManager } from '../SoundManager';

interface GachaMachineProps {
  onDraw: (gift: Gift) => void;
  isSfxOn: boolean;
}

const GachaMachine: React.FC<GachaMachineProps> = ({ onDraw, isSfxOn }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [balls, setBalls] = useState<{ color: string; hex: string }[]>([]);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    if (isSfxOn) soundManager.playSfx('spin');

    const droppedBalls = GIFTS.map(g => ({ color: g.color, hex: g.hex }))
      .sort(() => Math.random() - 0.5);
    setBalls(droppedBalls);

    const randomIndex = Math.floor(Math.random() * GIFTS.length);
    const selected = GIFTS[randomIndex];

    setTimeout(() => {
      onDraw(selected);
      setIsSpinning(false);
    }, 3000);
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-[#222] border-8 border-red-600 rounded-[40px] w-80 h-[500px] flex flex-col items-center overflow-hidden shadow-[0_0_50px_rgba(255,0,0,0.5)]">
        <div className="w-full h-1/2 bg-blue-100/10 border-b-8 border-red-600 relative overflow-hidden flex flex-wrap justify-center items-end p-4">
          {!isSpinning && GIFTS.map((g, i) => (
            <div key={i} className="w-8 h-8 rounded-full m-1 border border-white/20 shadow-inner" style={{ backgroundColor: g.hex }} />
          ))}
          {isSpinning && balls.map((b, i) => (
            <div 
              key={i} 
              className="w-10 h-10 rounded-full absolute transition-all duration-[2000ms] animate-bounce-slow"
              style={{ 
                backgroundColor: b.hex,
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 80}%`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
        <div className="w-full flex-1 flex flex-col items-center justify-center p-6 bg-red-600 space-y-6">
          <div className="w-24 h-24 bg-red-800 rounded-full border-4 border-yellow-500 flex items-center justify-center shadow-inner relative group">
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className={`w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center transform active:scale-95 transition-all shadow-lg ${isSpinning ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
              aria-label="Spin Gacha Machine"
            >
              <div className={`w-1 h-12 bg-gray-800 rounded-full transition-all duration-1000 ${isSpinning ? 'rotate-[1440deg]' : ''}`} />
            </button>
          </div>
          <div className="text-center">
             <span className="text-white font-bold text-xl block uppercase tracking-widest">Spin Me!</span>
             <p className="text-red-100 text-xs mt-2 italic">100% chance of Christmas magic</p>
          </div>
          <div className="w-16 h-10 bg-black/40 rounded-t-2xl mt-auto border-t-2 border-red-800" />
        </div>
        <style>{`
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-40px) scale(1.1); }
          }
          .animate-bounce-slow { animation: bounce-slow 0.8s infinite ease-in-out; }
        `}</style>
      </div>
    </div>
  );
};

export default GachaMachine;
