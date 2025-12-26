import React, { useState, useEffect, useRef } from 'react';
import { AppState, GIFTS, Gift } from './types';
import { WorkshopApp } from './WorkshopApp';
import { soundManager } from './SoundManager';
import { Volume2, VolumeX, Music, Music2, Share2, Check, RotateCcw, SkipForward, Sparkles, MailOpen } from 'lucide-react';

const STORAGE_KEYS = {
  DECK: 'st_gacha_deck_v1',
  INDEX: 'st_gacha_index_v1',
  COLLECTED: 'st_gacha_collected_v1'
};

const CornerConfettiCannon = ({ active }: { active: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<any[]>([]);
  const animationFrameRef = useRef<number>(0);

  const spawnParticles = (width: number, height: number) => {
    const colors = ['#FFD700', '#FF4D4D', '#4DFF88', '#4D94FF', '#FF80BF', '#FFFFFF', '#FFA500'];
    const createBatch = (x: number, y: number, angleDeg: number) => {
      for (let i = 0; i < 60; i++) {
        const angle = (angleDeg + (Math.random() * 40 - 20)) * (Math.PI / 180);
        const speed = (400 + Math.random() * 400);
        particles.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          rotation: Math.random() * Math.PI * 2,
          angularVelocity: (Math.random() - 0.5) * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 2 + Math.random(),
          width: 8 + Math.random() * 4,
          height: 6 + Math.random() * 4,
        });
      }
    };
    createBatch(0, height, -45);
    createBatch(width, height, -135);
  };

  useEffect(() => {
    if (!active) {
      particles.current = [];
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    spawnParticles(canvas.width, canvas.height);

    let lastTime = performance.now();
    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.vy += 1000 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.angularVelocity * dt;
        p.life -= dt;
        if (p.life <= 0) {
          particles.current.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.min(1, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        ctx.restore();
      }
      if (particles.current.length > 0) animationFrameRef.current = requestAnimationFrame(loop);
    };
    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [active]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-[60] pointer-events-none" />;
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.INTRO);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [deck, setDeck] = useState<Gift[]>([]);
  const [deckIndex, setDeckIndex] = useState(0);
  const [history, setHistory] = useState<Gift[]>([]);

  const [isMusicOn, setIsMusicOn] = useState(false);
  const [isSfxOn, setIsSfxOn] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const workshopRef = useRef<WorkshopApp | null>(null);

  // ✅ NEW: 确保只注册一次“首次点击解锁音频”
  const hasBoundUnlockRef = useRef(false);

  // Fisher-Yates with crypto randomness
  const shuffleGifts = (array: Gift[]): Gift[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      let randomValue;
      if (window.crypto && window.crypto.getRandomValues) {
        const array32 = new Uint32Array(1);
        window.crypto.getRandomValues(array32);
        randomValue = array32[0] / (0xffffffff + 1);
      } else {
        randomValue = Math.random();
      }
      const j = Math.floor(randomValue * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initDeck = (forceNew = false) => {
    const savedDeck = localStorage.getItem(STORAGE_KEYS.DECK);
    const savedIndex = localStorage.getItem(STORAGE_KEYS.INDEX);
    const savedHistory = localStorage.getItem(STORAGE_KEYS.COLLECTED);

    if (!forceNew && savedDeck && savedIndex !== null) {
      setDeck(JSON.parse(savedDeck));
      setDeckIndex(parseInt(savedIndex, 10));
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } else {
      const newDeck = shuffleGifts(GIFTS);
      setDeck(newDeck);
      setDeckIndex(0);
      localStorage.setItem(STORAGE_KEYS.DECK, JSON.stringify(newDeck));
      localStorage.setItem(STORAGE_KEYS.INDEX, '0');
      if (forceNew) {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEYS.COLLECTED);
      }
    }
  };

  useEffect(() => {
    initDeck();
    workshopRef.current = new WorkshopApp(document.getElementById('game-container')!);
    const handleResize = () => workshopRef.current?.resize();
    window.addEventListener('resize', handleResize);

    // ✅ NEW: 页面任意首次点击，先 unlock（满足 iOS/Chrome autoplay policy）
    if (!hasBoundUnlockRef.current) {
      hasBoundUnlockRef.current = true;

      const unlockOnce = () => {
        // unlockAudio 里通常会把 bgm play/pause 一下，或创建 AudioContext
        soundManager.unlockAudio();
      };

      window.addEventListener('pointerdown', unlockOnce, { once: true });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (workshopRef.current) workshopRef.current.app.destroy(true);
    };
  }, []);

  const handleOpenCard = () => {
    soundManager.playSfx('click');

    // ✅ NEW: 再保险一次：按钮点击一定算 user gesture
    soundManager.unlockAudio();

    // ✅ NEW: 开始播放/切换背景音乐，并同步 UI 状态
    const musicOn = !!soundManager.toggleMusic();
    setIsMusicOn(musicOn);

    setState(AppState.WORKSHOP_PAN);
    workshopRef.current?.runWorkshopPan(() => {
      setState(AppState.DIALOGUE);
    });
  };

  const handleDraw = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setShowConfetti(false);
    soundManager.playSfx('spin');

    let currentDeck = [...deck];
    let currentIndex = deckIndex;

    if (currentIndex >= currentDeck.length) {
      currentDeck = shuffleGifts(GIFTS);
      currentIndex = 0;
      setDeck(currentDeck);
      localStorage.setItem(STORAGE_KEYS.DECK, JSON.stringify(currentDeck));
    }

    const draw = currentDeck[currentIndex];

    setTimeout(() => {
      setSelectedGift(draw);

      const newIndex = currentIndex + 1;
      setDeckIndex(newIndex);
      localStorage.setItem(STORAGE_KEYS.INDEX, newIndex.toString());

      setHistory(prev => {
        const exists = prev.find(g => g.id === draw.id);
        const newHist = exists ? prev : [draw, ...prev];
        const result = newHist.slice(0, 7);
        localStorage.setItem(STORAGE_KEYS.COLLECTED, JSON.stringify(result));
        return result;
      });

      setState(AppState.RESULT);
      setIsSpinning(false);
      setShowConfetti(true);
      soundManager.playSfx('reveal');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2500);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const responsiveTitle = "text-[clamp(2rem,6vw,3.5rem)]";
  const responsiveText = "text-[clamp(1rem,2.5vw,1.4rem)]";

  return (
    <div className="ui-layer min-h-[100dvh]">
      <CornerConfettiCannon active={showConfetti && state === AppState.RESULT} />

      {/* Control Overlay */}
      {state !== AppState.INTRO && (
        <div className="fixed top-4 right-4 flex gap-2 z-[100] p-safe-top">
          <button
            onClick={() => setIsMusicOn(!!soundManager.toggleMusic())}
            className={`p-3 rounded-full transition-all shadow-xl interactive active:scale-90 ${isMusicOn ? 'bg-green-500 text-white' : 'bg-white/90 text-slate-400'}`}
          >
            {isMusicOn ? <Music size={20} /> : <Music2 size={20} />}
          </button>
          <button
            onClick={() => { soundManager.setSfxEnabled(!isSfxOn); setIsSfxOn(!isSfxOn); }}
            className={`p-3 rounded-full transition-all shadow-xl interactive active:scale-90 ${isSfxOn ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-400'}`}
          >
            {isSfxOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      )}

      {/* Intro Page */}
      {state === AppState.INTRO && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_#dc2626_0%,_#064e3b_100%)] z-[1000] p-6">
          <div className="bg-white p-8 md:p-14 rounded-[3.5rem] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.6)] max-w-lg w-full transform animate-float border border-white/40 flex flex-col items-center text-center">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <MailOpen className="text-red-600" size={44} />
            </div>
            <h1 className={`font-festive text-red-600 leading-tight mb-4 ${responsiveTitle}`}>Season's Greetings!</h1>
            <p className={`text-slate-700 font-round font-bold italic mb-10 leading-relaxed ${responsiveText}`}>
              "Stephanie has sent you a magical holiday surprise."
            </p>
            <button
              onClick={handleOpenCard}
              className="bg-red-600 hover:bg-red-700 text-white font-black py-4 md:py-5 px-10 md:px-14 rounded-[2rem] text-xl md:text-2xl transition-all shadow-[0_8px_0_#991b1b] active:translate-y-2 active:shadow-none interactive flex items-center gap-3"
            >
              <span>Open the Card</span>
              <Sparkles size={20} />
            </button>
            <p className="mt-8 text-slate-400 font-bold uppercase tracking-widest text-[10px] opacity-70">Tap anywhere to start music</p>
          </div>
        </div>
      )}

      {/* Cinematic Pan / Dialogue */}
      {state === AppState.WORKSHOP_PAN && (
        <button
          onClick={() => { soundManager.playSfx('click'); workshopRef.current?.skipPan(); setState(AppState.DIALOGUE); }}
          className="fixed bottom-8 right-8 flex items-center gap-2 bg-white text-slate-800 px-6 py-3 rounded-full font-black shadow-2xl interactive z-[100]"
        >
          <SkipForward size={18} /> Skip
        </button>
      )}

      {state === AppState.DIALOGUE && (
        <div className="fixed inset-0 flex items-end justify-center pb-8 md:pb-16 px-4 bg-black/20 backdrop-blur-[2px] z-[90]">
          <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border-[6px] border-green-500 max-w-xl w-full flex flex-col sm:flex-row gap-6 items-center shadow-2xl font-round animate-in slide-in-from-bottom-10">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-green-50 rounded-full flex items-center justify-center text-6xl md:text-7xl shrink-0 border-2 border-green-100 shadow-inner">🧝</div>
            <div className="flex-1 space-y-4 text-center sm:text-left">
              <p className="text-xl md:text-2xl font-round text-green-800 leading-tight font-bold italic">
                “Merry Christmas! Welcome to Santa’s Workshop — a little surprise is waiting just for you.”
              </p>
              <button
                onClick={() => { soundManager.playSfx('click'); setState(AppState.GACHA); }}
                className="bg-green-600 hover:bg-green-700 text-white font-round font-black py-3 px-8 rounded-2xl text-lg transition-all shadow-[0_6px_0_rgb(21,128,61)] active:translate-y-1 active:shadow-none interactive"
              >
                Let's Draw!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gacha Machine */}
      {state === AppState.GACHA && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/20 backdrop-blur-sm z-[90] p-4">
          <div className="bg-red-600 p-8 rounded-[3.5rem] border-[8px] border-yellow-400 shadow-2xl w-full max-w-[300px] text-center space-y-6 font-round relative animate-in zoom-in-95">
            <div className="h-32 bg-sky-100/30 rounded-[2rem] border-4 border-red-800 flex items-center justify-center relative overflow-hidden shadow-inner">
              {GIFTS.map((g, i) => (
                <div
                  key={g.id}
                  className={`w-8 h-8 rounded-full border-2 border-white/40 absolute ${isSpinning ? 'animate-bounce' : ''}`}
                  style={{ backgroundColor: g.hex, left: `${15 + (i * 10)}%`, top: `${30 + (i % 2) * 20}%` }}
                />
              ))}
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleDraw} disabled={isSpinning}
                className="w-24 h-24 bg-yellow-400 rounded-full border-[8px] border-red-900 flex items-center justify-center transition-all shadow-xl interactive active:scale-95 group"
              >
                <div className={`w-3 h-16 bg-red-900 rounded-full transition-transform duration-[2500ms] ${isSpinning ? 'rotate-[1440deg]' : 'group-hover:rotate-12'}`} />
              </button>
            </div>
            <div className="text-white font-black italic">
              <h2 className="text-2xl uppercase tracking-tighter text-yellow-50">GIFT-O-MATIC</h2>
              <p className="text-red-100 text-[10px] mt-1 opacity-80 uppercase tracking-widest">
                {deckIndex < GIFTS.length ? `${GIFTS.length - deckIndex} GIFTS LEFT IN SET` : 'SET COMPLETE - RESHUFFLING!'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Result Page */}
      {state === AppState.RESULT && selectedGift && (
        <div className="relative flex-1 flex flex-col bg-white/95 backdrop-blur-3xl z-[110] font-round animate-in fade-in duration-700 min-h-[100dvh]">

          <div className="flex-1 flex flex-col items-center w-full max-w-4xl mx-auto px-6 pt-12 pb-32">

            <div className="flex items-center gap-2 text-yellow-500 mb-2 shrink-0">
              <Sparkles size={16} />
              <h2 className="font-black tracking-[0.3em] uppercase text-[10px] md:text-sm">Gift Unwrapped</h2>
              <Sparkles size={16} />
            </div>

            <h1 className={`font-festive text-red-600 leading-tight mb-2 text-center drop-shadow-sm ${responsiveTitle}`}>
              {selectedGift.name}
            </h1>

            <p className={`text-slate-600 mb-8 text-center italic font-bold max-w-md px-4 leading-snug ${responsiveText}`}>
              "{selectedGift.description}"
            </p>

            <div className="relative flex flex-col items-center justify-center min-h-[180px] max-h-[min(35dvh,320px)] w-full mb-10 shrink-0 icon-bounce">
              <div className="absolute inset-0 bg-yellow-400/20 blur-[100px] rounded-full"></div>
              <div className="text-[clamp(8rem,25vh,14rem)] leading-none relative z-10 drop-shadow-2xl select-none">
                {selectedGift.emoji}
              </div>
            </div>

            <div className="bg-green-50/90 p-8 md:p-10 rounded-[2.5rem] border-4 border-green-200/80 shadow-lg text-center mb-10 w-full max-w-lg shrink-0 transform -rotate-1">
              <p className="text-xl md:text-2xl font-round text-green-800 leading-relaxed font-bold italic">
                “Stephanie wishes you a Merry Christmas and a wonderful holiday memory.”
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-[2rem] w-full max-w-sm border border-slate-100 shadow-inner shrink-0 mb-4">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-4 font-black text-center">Collection: {history.length}/{GIFTS.length}</p>
              <div className="flex gap-3 overflow-x-auto pb-1 justify-center items-center">
                {GIFTS.map((g) => {
                  const collected = history.some(h => h.id === g.id);
                  return (
                    <div
                      key={g.id}
                      className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all border ${
                        collected ? 'bg-white shadow-sm border-slate-100 text-xl' : 'bg-slate-200/50 border-dashed border-slate-300 text-slate-300'
                      }`}
                    >
                      {collected ? g.emoji : '?'}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 p-4 md:p-6 z-[120] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
            <div className="max-w-md mx-auto flex gap-3 md:gap-4 pb-safe-bottom">
              <button
                onClick={copyUrl}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-4 px-4 rounded-2xl font-black text-base transition-all shadow-[0_5px_0_#991b1b] active:translate-y-1 active:shadow-none interactive"
              >
                {copied ? <Check size={18} /> : <Share2 size={18} />}
                <span>{copied ? "Copied!" : "Share Link"}</span>
              </button>
              <button
                onClick={() => { soundManager.playSfx('click'); setState(AppState.GACHA); setShowConfetti(false); }}
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 py-4 px-4 rounded-2xl font-black text-base transition-all border-2 border-slate-200 shadow-lg interactive active:scale-95"
              >
                <RotateCcw size={18} />
                <span>{deckIndex >= GIFTS.length ? 'Start New Set' : 'Spin Again'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
