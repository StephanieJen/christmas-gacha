
import React, { useState } from 'react';
import { Gift as GiftType } from '../types';
import { Sparkles, RotateCcw, Share2, Check, Clock } from 'lucide-react';
import { soundManager } from '../SoundManager';

interface ResultScreenProps {
  gift: GiftType;
  history: GiftType[];
  onReset: () => void;
  isSfxOn: boolean;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ gift, history, onReset, isSfxOn }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (isSfxOn) soundManager.playSfx('click');
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0c1421] px-4 overflow-y-auto pt-20 pb-10">
      <div className="max-w-2xl w-full text-center space-y-6 animate-in fade-in zoom-in duration-700">
        
        <div className="space-y-2">
            <h2 className="text-red-500 font-bold uppercase tracking-widest text-sm font-round">You Unwrapped...</h2>
            <div className="flex justify-center items-center gap-4">
               <Sparkles className="text-yellow-400 hidden md:block" />
               <h1 className="text-4xl md:text-6xl font-festive text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                 {gift.name}
               </h1>
               <Sparkles className="text-yellow-400 hidden md:block" />
            </div>
            <p className="text-xl text-gray-300 font-round italic px-6">
                "{gift.description}"
            </p>
            <p className="text-lg text-gray-400 font-round">
                A magical gift in <span style={{ color: gift.hex }} className="font-bold underline">{gift.color}</span>!
            </p>
        </div>

        <div className="relative flex justify-center py-6">
           <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div className="w-48 h-48 rounded-full blur-[80px]" style={{ backgroundColor: gift.hex }} />
           </div>
           <div className="text-8xl animate-bounce" role="img" aria-label={gift.name}>
             {gift.emoji}
           </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 max-w-lg mx-auto shadow-xl">
           <p className="text-xl font-round text-green-400 leading-relaxed italic">
             “Stephanie wishes you a Merry Christmas and a wonderful holiday memory.”
           </p>
        </div>

        {/* History Panel */}
        <div className="bg-black/20 p-4 rounded-2xl border border-white/5 max-w-sm mx-auto font-round">
          <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-widest mb-3 justify-center">
            <Clock size={12} />
            <span>Recent Draws</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {history.map((h, i) => (
              <div key={i} className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md text-xs border border-white/10" title={h.name}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: h.hex }} />
                <span className="text-gray-300 truncate max-w-[80px] font-round">{h.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-6 py-3 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-full transition-all text-green-400 font-bold font-round"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Copied URL!' : 'Share the Magic'}</span>
          </button>
          
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all text-gray-300 hover:text-white font-bold font-round"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Draw Again</span>
          </button>
        </div>

        <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-10">
            {[...Array(15)].map((_, i) => (
                <div 
                    key={i}
                    className="absolute text-white animate-pulse"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        fontSize: `${Math.random() * 20 + 10}px`,
                        animationDelay: `${Math.random() * 5}s`
                    }}
                >
                    ❄️
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;
