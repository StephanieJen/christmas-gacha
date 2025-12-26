import React from 'react';

interface ElfDialogueProps {
  onNext: () => void;
}

const ElfDialogue: React.FC<ElfDialogueProps> = ({ onNext }) => {
  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center pb-20 px-4 bg-black/30">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 flex gap-6 items-start shadow-2xl relative border-4 border-green-500 font-round">
        {/* Stylized Elf Avatar */}
        <div className="w-24 h-24 flex-shrink-0 bg-green-100 rounded-full border-4 border-green-500 flex items-center justify-center overflow-hidden">
           <div className="text-4xl">🧝</div>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <div className="text-gray-900">
             <h2 className="text-xl font-bold text-green-700 mb-1">Buddy the Elf</h2>
             <p className="text-lg italic font-semibold leading-relaxed font-round">
               “Merry Christmas! Welcome to Santa’s Workshop — a little surprise is waiting just for you.”
             </p>
          </div>

          <button
            onClick={onNext}
            className="self-end px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full transition-all hover:scale-105 shadow-md font-round"
            aria-label="Go to Gift Draw"
          >
            Draw My Gift!
          </button>
        </div>

        {/* Decorative corner */}
        <div className="absolute -top-4 -right-4 text-4xl transform rotate-12">🎁</div>
      </div>
    </div>
  );
};

export default ElfDialogue;