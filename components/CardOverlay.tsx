
import React from 'react';
import { Mail } from 'lucide-react';

interface CardOverlayProps {
  onOpen: () => void;
}

const CardOverlay: React.FC<CardOverlayProps> = ({ onOpen }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-gradient-to-br from-red-900 via-[#0c1421] to-green-900">
      <div 
        className="max-w-md w-full bg-white text-gray-900 rounded-2xl shadow-2xl p-8 text-center transform transition-all hover:scale-105"
        role="dialog"
        aria-labelledby="card-title"
      >
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 animate-bounce">
            <Mail size={40} />
          </div>
        </div>
        
        <h1 id="card-title" className="text-4xl font-festive text-red-600 mb-4">You've Got Mail!</h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Stephanie sent you a special invitation to visit Santa's Workshop. Would you like to see what's inside?
        </p>

        <button
          onClick={onOpen}
          className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 group"
          aria-label="Open Christmas Card"
        >
          <span>Open Card</span>
          <div className="w-2 h-2 bg-white rounded-full transition-transform group-hover:scale-150" />
        </button>

        <div className="mt-6 flex justify-center gap-2">
            {[...Array(5)].map((_, i) => (
                <span key={i} className="text-2xl text-red-200">❄️</span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CardOverlay;
