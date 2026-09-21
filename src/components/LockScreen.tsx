import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Lock, Sparkles, KeyRound, ArrowRight, Fish, Heart, AlertCircle, Info } from 'lucide-react';
import { BirthdayConfig } from '../types';
import { soundManager } from '../utils/audio';

interface LockScreenProps {
  config: BirthdayConfig;
  onUnlockViewer: () => void;
  onOpenEditor: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  config,
  onUnlockViewer,
  onOpenEditor,
}) => {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showHint, setShowHint] = useState(false);

  // Modal for Gear / Settings passcode
  const [isEditorPromptOpen, setIsEditorPromptOpen] = useState(false);
  const [editorPassword, setEditorPassword] = useState('');
  const [editorError, setEditorError] = useState('');

  const handleViewerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = password.trim().toUpperCase().replace(/\s+/g, '');
    const targetPass = (config.passCode || 'KIMANH').toUpperCase().replace(/\s+/g, '');

    // Allow KIMANH or KIM ÁNH or KIM ANH
    if (cleanInput === targetPass || cleanInput === 'KIMANH' || cleanInput === 'KIMÁNH') {
      soundManager.playChime(660);
      onUnlockViewer();
    } else {
      setErrorMsg('Mật mã chưa chính xác. Gợi ý: KIMANH');
      soundManager.playWaterDrop(300);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleEditorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = editorPassword.trim().toUpperCase().replace(/\s+/g, '');
    const targetPass = (config.editorPassCode || config.passCode || 'KIMANH').toUpperCase().replace(/\s+/g, '');

    if (cleanInput === targetPass || cleanInput === 'KIMANH' || cleanInput === '1909' || cleanInput === '2009') {
      soundManager.playChime(880);
      setIsEditorPromptOpen(false);
      onOpenEditor();
    } else {
      setEditorError('Mật mã chỉnh sửa chưa đúng (mặc định: KIMANH)');
      setTimeout(() => setEditorError(''), 4000);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 z-10 select-none">
      {/* Small Gear Button in the top-right corner as requested */}
      <div className="absolute top-5 right-5 z-40">
        <button
          id="btn-settings-gear"
          onClick={() => {
            soundManager.playWaterDrop(700);
            setIsEditorPromptOpen(true);
          }}
          title="Chế độ chỉnh sửa thay hình & lời chúc (Nhập mật mã KIMANH)"
          className="p-3 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-rose-500 border border-white/80 backdrop-blur-md shadow-lg shadow-sky-900/5 transition-all hover:scale-105 active:scale-95 group flex items-center gap-2 cursor-pointer"
        >
          <Settings className="w-4 h-4 text-rose-500 group-hover:rotate-90 transition-transform duration-500" />
          <span className="text-xs font-medium text-slate-700 hidden sm:inline">
            Tùy biến
          </span>
        </button>
      </div>

      {/* Center Lock Card - Bright, Pure & Transparent Glass Aesthetic */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/90 rounded-3xl p-8 md:p-9 shadow-2xl shadow-sky-900/10 relative overflow-hidden"
      >
        {/* Soft aquatic and blush gradients */}
        <div className="absolute -top-16 -left-16 w-40 h-40 bg-sky-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-rose-200/40 rounded-full blur-2xl pointer-events-none" />

        {/* Header Badge */}
        <div className="flex flex-col items-center text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 220 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-400 to-amber-400 p-0.5 shadow-md shadow-rose-500/20 mb-3 flex items-center justify-center"
          >
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Fish className="w-8 h-8 text-rose-500 animate-pulse" />
            </div>
          </motion.div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200/80 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {config.recipientNickname || 'K.Á • Bé Cá Koi 🎏'}
          </span>

          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {config.recipientName}
          </h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2 justify-center">
            <span>Sinh nhật 20/09</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span className="text-rose-600 font-semibold">17 Tuổi Rực Rỡ</span>
          </p>
        </div>

        {/* Subtle note */}
        <div className="bg-sky-50/70 rounded-2xl p-3.5 border border-sky-100 mb-6 text-center">
          <p className="text-xs leading-relaxed text-sky-900 font-medium">
            Mặt nước xanh lam trong vắt & đàn cá Koi đỏ đang chuẩn bị lời chúc sinh nhật dành riêng cho bạn...
          </p>
        </div>

        {/* Form to unlock video with KIMANH */}
        <form onSubmit={handleViewerSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4 text-sky-600" />
            </div>
            <input
              id="input-viewer-password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập pass để coi (Gợi ý: KIMANH)..."
              autoFocus
              className="w-full pl-11 pr-4 py-3.5 bg-white/90 border border-sky-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-400/20 rounded-2xl text-slate-800 placeholder-slate-400 text-sm font-semibold tracking-wider transition-all uppercase"
            />
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 text-xs text-rose-600 font-medium px-1"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          <button
            id="btn-unlock-gift"
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Mở Video Sinh Nhật</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Hint toggle */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="text-xs text-slate-500 hover:text-sky-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            {showHint ? 'Ẩn gợi ý' : 'Gợi ý mật khẩu'}
          </button>

          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-2"
              >
                <div className="p-2.5 bg-sky-50 border border-sky-200/80 rounded-xl text-xs text-sky-800">
                  Mật khẩu để mở thiệp: <span className="font-bold text-rose-600 tracking-wider">KIMANH</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-rose-500 font-medium">
            <Heart className="w-3 h-3 fill-rose-500" />
            Happy 17th Birthday!
          </span>
          <span>Bấm ⚙️ góc trên để chỉnh sửa</span>
        </div>
      </motion.div>

      {/* Modal for Gear button passcode */}
      <AnimatePresence>
        {isEditorPromptOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-sm bg-white border border-sky-100 rounded-3xl p-6 shadow-2xl relative"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-500">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Chế Độ Chỉnh Sửa</h3>
                  <p className="text-xs text-slate-500">Nhập mật mã để thay hình & lời chúc</p>
                </div>
              </div>

              <form onSubmit={handleEditorSubmit} className="space-y-4">
                <input
                  id="input-editor-pass"
                  type="password"
                  value={editorPassword}
                  onChange={(e) => setEditorPassword(e.target.value)}
                  placeholder="Nhập pass (mặc định: KIMANH)..."
                  autoFocus
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 rounded-xl text-slate-800 text-sm"
                />

                {editorError && (
                  <p className="text-xs text-rose-500">{editorError}</p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditorPromptOpen(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    id="btn-confirm-editor-pass"
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold shadow-md shadow-rose-500/20 transition-colors cursor-pointer"
                  >
                    Xác Nhận
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
