import React, { useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, Wind } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface InteractiveCakeProps {
  age: number;
  recipientName: string;
}

export const InteractiveCake: React.FC<InteractiveCakeProps> = ({
  age = 17,
  recipientName = 'Kim Ánh',
}) => {
  const [candlesLit, setCandlesLit] = useState(true);
  const [hasWished, setHasWished] = useState(false);

  const handleBlowCandles = () => {
    if (!candlesLit) {
      // Re-light
      setCandlesLit(true);
      soundManager.playChime(700);
      return;
    }

    setCandlesLit(false);
    setHasWished(true);
    soundManager.playChime(880);

    // Confetti burst
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#fb7185', '#f59e0b', '#38bdf8', '#e2e8f0', '#fbbf24'],
    });

    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0.1, y: 0.7 },
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 0.9, y: 0.7 },
      });
    }, 250);
  };

  return (
    <div className="flex flex-col items-center justify-center select-none">
      {/* Cake Container */}
      <div className="relative w-64 h-56 flex flex-col items-center justify-end">
        {/* Candles on top */}
        <div className="flex items-end justify-center gap-3 mb-1 z-10">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              {/* Flame */}
              {candlesLit ? (
                <motion.div
                  animate={{
                    scaleY: [1, 1.25, 0.9, 1.15],
                    scaleX: [1, 0.85, 1.1, 0.9],
                    y: [0, -1, 1, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.45 + i * 0.1,
                    ease: 'easeInOut',
                  }}
                  className="w-3.5 h-6 rounded-full bg-gradient-to-t from-orange-500 via-amber-300 to-yellow-100 shadow-[0_0_12px_rgba(251,191,36,0.9)] cursor-pointer"
                  onClick={handleBlowCandles}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0.8, y: 0 }}
                  animate={{ opacity: 0, y: -16 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1.5 h-4 rounded-full bg-slate-400/50 blur-[1px]"
                />
              )}
              {/* Candle Body */}
              <div className="w-2.5 h-10 bg-gradient-to-b from-rose-200 via-pink-400 to-rose-400 rounded-t-sm border border-white/30 shadow-sm" />
            </div>
          ))}
        </div>

        {/* Top Cake Layer */}
        <div className="w-44 h-16 bg-gradient-to-r from-pink-300 via-rose-300 to-pink-300 rounded-t-2xl relative shadow-lg flex items-center justify-center border-t-2 border-white/60">
          {/* Icing drips */}
          <div className="absolute -bottom-2 inset-x-0 flex justify-around">
            {[...Array(7)].map((_, idx) => (
              <div
                key={idx}
                className="w-4 h-4 bg-white/90 rounded-full shadow-sm"
              />
            ))}
          </div>
          <span className="text-rose-900 font-extrabold text-sm tracking-wider font-serif-display z-10">
            SWEET {age}
          </span>
        </div>

        {/* Bottom Cake Layer */}
        <div className="w-56 h-20 bg-gradient-to-r from-amber-100 via-rose-200 to-pink-200 rounded-b-2xl relative shadow-2xl flex items-center justify-center border-b-4 border-rose-300/50">
          {/* Decorative Pearls & Strawberry dots */}
          <div className="flex items-center gap-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-rose-500/80 shadow-sm border border-white/50"
              />
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-2 text-center">
            <span className="text-xs text-rose-800/80 font-bold uppercase tracking-widest">
              🎂 {recipientName} • 19.09
            </span>
          </div>
        </div>

        {/* Golden Cake Stand plate */}
        <div className="w-64 h-3 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 rounded-full shadow-xl -mt-1 border border-amber-300/60" />
      </div>

      {/* Action Button: Blow / Light candles */}
      <div className="mt-6 flex flex-col items-center">
        <button
          id="btn-blow-candles"
          onClick={handleBlowCandles}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold text-xs shadow-lg shadow-rose-500/25 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          {candlesLit ? (
            <>
              <Wind className="w-4 h-4 text-amber-200" />
              <span>Nhấn để Thổi Nến & Ước Nguyện</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Thắp Sáng Lại Nến Sinh Nhật</span>
            </>
          )}
        </button>

        {hasWished && !candlesLit && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-amber-300 mt-2 flex items-center gap-1 font-medium"
          >
            <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
            Điều ước tuổi 17 của Kim Ánh đã được gửi tới đàn cá Koi may mắn!
          </motion.p>
        )}
      </div>
    </div>
  );
};
