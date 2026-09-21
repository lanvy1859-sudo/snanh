import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, X, Heart, Sparkles, RefreshCw, Volume2 } from 'lucide-react';
import { LanVySecretLetter } from '../types';
import { soundManager } from '../utils/audio';

interface SecretLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  letter: LanVySecretLetter;
}

export const SecretLetterModal: React.FC<SecretLetterModalProps> = ({
  isOpen,
  onClose,
  letter,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingIndex, setTypingIndex] = useState(0);

  const fullText = letter.content || '';

  // Restart typewriter whenever opened
  useEffect(() => {
    if (isOpen) {
      setDisplayedText('');
      setTypingIndex(0);
      setIsTyping(true);
      soundManager.playChime(780);
    } else {
      setIsTyping(false);
      setDisplayedText('');
    }
  }, [isOpen]);

  // Typewriter effect loop
  useEffect(() => {
    if (!isOpen || !isTyping) return;

    if (typingIndex < fullText.length) {
      const char = fullText[typingIndex];
      const delay = char === '\n' ? 120 : char === '.' || char === '!' || char === '?' ? 90 : 26;

      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + char);
        setTypingIndex((prev) => prev + 1);

        // Gentle soft typewriter click for non-space characters
        if (char !== ' ' && char !== '\n' && Math.random() < 0.35) {
          soundManager.playTypewriterSound();
        }
      }, delay);

      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
      soundManager.playWaterDrop(750);
    }
  }, [isOpen, isTyping, typingIndex, fullText]);

  const handleReplayTyping = () => {
    setDisplayedText('');
    setTypingIndex(0);
    setIsTyping(true);
    soundManager.playChime(660);
  };

  const handleSkipTyping = () => {
    setDisplayedText(fullText);
    setTypingIndex(fullText.length);
    setIsTyping(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-xl bg-gradient-to-b from-amber-50/95 via-rose-50/90 to-white/95 rounded-3xl border border-rose-200/80 shadow-2xl overflow-hidden p-6 md:p-8"
      >
        {/* Soft background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-rose-600 border border-rose-100 shadow-sm transition-all hover:scale-110 cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Envelope Stamp Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-rose-100 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 p-0.5 shadow-md shadow-rose-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Mail className="w-6 h-6 text-rose-500 animate-bounce" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 bg-rose-100/70 px-2.5 py-0.5 rounded-full">
                Bức thư bí mật từ Lan Vy
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-slate-800 mt-0.5">
              {letter.title || 'Gửi Bạn Cá (K.Á) Yêu Dấu 💌'}
            </h3>
          </div>
        </div>

        {/* Paper Sheet Content with Typewriter */}
        <div className="bg-white/90 rounded-2xl p-5 md:p-6 border border-amber-200/60 shadow-inner min-h-[220px] max-h-[380px] overflow-y-auto font-sans leading-relaxed text-slate-700 text-sm md:text-base relative">
          <p className="whitespace-pre-line font-medium text-slate-700">
            {displayedText}
            {isTyping && (
              <span className="inline-block w-2 h-4.5 bg-rose-500 ml-1 animate-pulse align-middle" />
            )}
          </p>

          {/* Letter Ending */}
          {!isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 pt-4 border-t border-rose-100 flex flex-col items-end text-right"
            >
              <div className="flex items-center gap-1.5 text-rose-600 font-bold text-base md:text-lg">
                <Heart className="w-5 h-5 fill-rose-500 text-rose-500 animate-pulse" />
                <span>{letter.closingWish || 'Mong bà sẽ luôn vui vẻ và hạnh phúc 💖'}</span>
              </div>
              <span className="text-xs text-slate-400 mt-1 font-serif italic">
                Thương mến • Lan Vy (20/09)
              </span>
            </motion.div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isTyping ? (
              <button
                onClick={handleSkipTyping}
                className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
              >
                Bỏ qua hiệu ứng gõ chữ
              </button>
            ) : (
              <button
                onClick={handleReplayTyping}
                className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-full border border-rose-200 transition-colors font-medium cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Gõ lại từ đầu
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            title="Đóng thư"
            aria-label="Đóng thư"
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-md shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            <Heart className="w-5 h-5 fill-white text-white" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
