import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Heart,
} from 'lucide-react';
import { BirthdayConfig } from '../types';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

interface MotionVideoPlayerProps {
  config: BirthdayConfig;
  onOpenEditor: () => void;
  onExit: () => void;
}

// 3 clear motion stages:
// 0: Lời chúc mở đầu (Hôm nay ngày 20/9, xin chúc mừng ngày sinh nhật thứ 17 của bn Kim Ánh)
// 1: Khoảnh khắc hình ảnh (Show các ảnh được chụp trong ngày sinh nhật)
// 2: Lời chúc kết thúc & đồng hành (Mong món quà nhỏ này... Chúc Ánh luôn khỏe mạnh vui vẻ hạnh phúc)
const STAGE_DURATIONS = [9, 14, 11]; // In seconds
const TOTAL_DURATION = STAGE_DURATIONS.reduce((a, b) => a + b, 0); // 34 seconds

export const MotionVideoPlayer: React.FC<MotionVideoPlayerProps> = ({
  config,
  onOpenEditor,
  onExit,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<any>(null);

  // Auto-play gentle soothing birthday melody
  useEffect(() => {
    soundManager.startBirthdayMelody();
    return () => {
      soundManager.stopMelody();
    };
  }, []);

  // Main playback timer
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.1;
        if (next >= TOTAL_DURATION) {
          setIsPlaying(false);
          // Trigger celebration confetti at the finale
          confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#ef4444', '#38bdf8', '#fbbf24', '#f43f5e', '#ffffff'],
          });
          return TOTAL_DURATION;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Compute current stage from currentTime
  useEffect(() => {
    let accumulated = 0;
    for (let i = 0; i < STAGE_DURATIONS.length; i++) {
      accumulated += STAGE_DURATIONS[i];
      if (currentTime < accumulated || i === STAGE_DURATIONS.length - 1) {
        if (currentStage !== i) {
          setCurrentStage(i);
          soundManager.playChime(640 + i * 80);
          if (i === 2) {
            confetti({
              particleCount: 45,
              spread: 60,
              origin: { y: 0.65 },
              colors: ['#ef4444', '#38bdf8', '#fbbf24'],
            });
          }
        }
        break;
      }
    }
  }, [currentTime, currentStage]);

  // Auto-cycle photos when in Stage 1
  useEffect(() => {
    if (currentStage !== 1 || !isPlaying) return;
    const photoInterval = setInterval(() => {
      setActivePhotoIdx((prev) => (prev + 1) % (config.photos.length || 1));
    }, 3800);
    return () => clearInterval(photoInterval);
  }, [currentStage, isPlaying, config.photos.length]);

  // Auto-hide controls when idle
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3200);
  };

  const togglePlay = () => {
    if (currentTime >= TOTAL_DURATION) {
      setCurrentTime(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
    soundManager.playWaterDrop(520);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setCurrentStage(0);
    setActivePhotoIdx(0);
    setIsPlaying(true);
    soundManager.playChime(600);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMute(next);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    setCurrentTime(percentage * TOTAL_DURATION);
  };

  const progressPercent = (currentTime / TOTAL_DURATION) * 100;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-full overflow-hidden select-none flex flex-col justify-between"
    >
      {/* Top Header Bar - Minimal & Clean */}
      <motion.div
        animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : -20 }}
        transition={{ duration: 0.25 }}
        className="relative z-30 flex items-center justify-between p-4 md:p-6"
      >
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/70 hover:bg-white/90 text-slate-700 text-xs md:text-sm font-medium backdrop-blur-md border border-sky-100/80 shadow-sm transition-all duration-200"
          title="Quay lại màn hình chính"
        >
          <ArrowLeft className="w-4 h-4 text-sky-600" />
          <span>Màn hình chính</span>
        </button>

        {/* Small Gear button in the corner to open editor mode */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenEditor}
            className="p-2.5 rounded-full bg-white/70 hover:bg-white/90 text-slate-700 hover:text-sky-600 backdrop-blur-md border border-sky-100/80 shadow-sm transition-all duration-200"
            title="Chỉnh sửa nội dung & hình ảnh (Yêu cầu mật khẩu)"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Main Motion Typography & Content Stage */}
      <div className="relative z-20 flex-1 flex items-center justify-center p-4 md:p-8">
        <AnimatePresence mode="wait">
          {/* ============================================================ */}
          {/* GIAI ĐOẠN 1: LỜI CHÚC MỞ ĐẦU                                 */}
          {/* "hôm nay ngày 20/9, xin chúc mừng ngày sinh nhật thứ 17 của bn Kim Ánh" */}
          {/* ============================================================ */}
          {currentStage === 0 && (
            <motion.div
              key="stage-intro"
              initial={{ opacity: 0, y: 25, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -25, scale: 0.97 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl w-full text-center px-4"
            >
              {/* Elegant floating glass card with clear azure aesthetic */}
              <div className="bg-white/75 backdrop-blur-md border border-white/80 rounded-3xl p-8 md:p-12 shadow-xl shadow-sky-950/5 relative overflow-hidden">
                {/* Subtle soft aquatic shimmer */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-sky-200/30 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-200/30 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700 text-xs md:text-sm font-medium mb-6 shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  <span>20 Tháng 9 • Tuổi 17 Rạng Rỡ</span>
                </motion.div>

                {/* Main required text lines */}
                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-800 leading-snug md:leading-tight"
                >
                  Hôm nay ngày <span className="text-sky-600 font-bold">20/9</span>,
                  <br />
                  xin chúc mừng ngày sinh nhật thứ <span className="text-rose-500 font-bold">17</span> của bn{' '}
                  <span className="text-rose-600 font-bold">{config.recipientName}</span> ✨
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-sm md:text-base font-light"
                >
                  <span className="text-rose-500 font-medium">🎏 K.Á</span>
                  <span>•</span>
                  <span>Tuổi mới an nhiên, rực rỡ như hoa nở trên mặt nước biếc</span>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* GIAI ĐOẠN 2: CHUYỂN TRANG SHOW ẢNH SINH NHẬT                 */}
          {/* "rồi chuyển trang để show lên các ảnh đc chụp trong ngày sinh nhật" */}
          {/* ============================================================ */}
          {currentStage === 1 && (
            <motion.div
              key="stage-photos"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl w-full flex flex-col items-center justify-center px-4"
            >
              {config.photos && config.photos.length > 0 ? (
                <div className="w-full relative flex flex-col items-center">
                  <div className="relative w-full max-w-lg aspect-4/3 sm:aspect-16/10 rounded-3xl overflow-hidden bg-white/70 backdrop-blur-md border border-white/90 shadow-2xl shadow-sky-950/10 p-3 group">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={config.photos[activePhotoIdx]?.id || activePhotoIdx}
                        initial={{ opacity: 0, scale: 1.04 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.55 }}
                        className="w-full h-full relative rounded-2xl overflow-hidden"
                      >
                        <img
                          src={config.photos[activePhotoIdx]?.url}
                          alt={config.photos[activePhotoIdx]?.caption || 'Ảnh sinh nhật Kim Ánh'}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover rounded-2xl transition-transform duration-700 hover:scale-102"
                        />

                        {/* Tag pill */}
                        {config.photos[activePhotoIdx]?.tag && (
                          <div className="absolute top-3 left-3 bg-white/85 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-sky-800 border border-white/70 shadow-sm flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-rose-500" />
                            {config.photos[activePhotoIdx].tag}
                          </div>
                        )}

                        {/* Caption bar */}
                        {config.photos[activePhotoIdx]?.caption && (
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent p-4 pt-10 text-white rounded-b-2xl">
                            <p className="text-sm md:text-base font-medium tracking-wide">
                              {config.photos[activePhotoIdx].caption}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {/* Left & Right arrow controls */}
                    {config.photos.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setActivePhotoIdx(
                              (prev) => (prev - 1 + config.photos.length) % config.photos.length
                            )
                          }
                          className="absolute left-5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-xs transition-transform active:scale-95"
                          aria-label="Ảnh trước"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            setActivePhotoIdx((prev) => (prev + 1) % config.photos.length)
                          }
                          className="absolute right-5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-xs transition-transform active:scale-95"
                          aria-label="Ảnh tiếp theo"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Photo thumbnail dots */}
                  {config.photos.length > 1 && (
                    <div className="flex items-center gap-2 mt-4">
                      {config.photos.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActivePhotoIdx(idx)}
                          className={`h-2 transition-all rounded-full ${
                            activePhotoIdx === idx
                              ? 'w-6 bg-rose-500'
                              : 'w-2 bg-slate-300 hover:bg-slate-400'
                          }`}
                          aria-label={`Xem ảnh ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl text-center">
                  <p className="text-slate-600">Chưa có ảnh nào được tải lên.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* GIAI ĐOẠN 3: LỜI CHÚC KẾT THÚC                               */}
          {/* "rồi câu cuối là mong món quà nhỏ này sẽ là hành trang nhỏ đồng hành với bn cá trong khoảng thời gian rực rỡ nìi" */}
          {/* "chúc Ánh luôn khỏe mạnh vui vẻ hạnh phúc"                    */}
          {/* ============================================================ */}
          {currentStage === 2 && (
            <motion.div
              key="stage-closing"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl w-full text-center px-4"
            >
              <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-3xl p-8 md:p-12 shadow-xl shadow-sky-950/5 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-44 h-44 bg-rose-200/40 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-sky-200/40 rounded-full blur-2xl pointer-events-none" />

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="w-12 h-12 mx-auto mb-6 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 shadow-xs"
                >
                  <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
                </motion.div>

                {/* Line 1: Hành trang đồng hành */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-lg sm:text-xl md:text-2xl text-slate-700 font-medium leading-relaxed"
                >
                  "{config.closingMessage1 || 'Mong món quà nhỏ này sẽ là hành trang nhỏ đồng hành với bn cá trong khoảng thời gian rực rỡ nìi'}"
                </motion.p>

                {/* Line 2: Chúc Ánh luôn khỏe mạnh vui vẻ hạnh phúc */}
                <motion.h2
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="mt-6 text-2xl sm:text-3xl md:text-4xl font-bold text-rose-600 tracking-tight"
                >
                  {config.closingMessage2 || 'Chúc Ánh luôn khỏe mạnh vui vẻ hạnh phúc 💖'}
                </motion.h2>

                {/* Sign-off */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                  className="mt-8 flex items-center justify-center gap-3 text-slate-500 text-sm"
                >
                  <span>Gửi tặng Kim Ánh 🎏</span>
                  <span>•</span>
                  <span>{config.senderName || 'Từ một người bạn thân'}</span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Bar: Clean Progress Bar & Playback Controls ("giữ thanh tiến độ là đc") */}
      <motion.div
        animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 20 }}
        transition={{ duration: 0.25 }}
        className="relative z-30 p-4 md:p-6 max-w-3xl mx-auto w-full"
      >
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/80 shadow-lg shadow-sky-950/5 flex flex-col gap-3">
          {/* The requested Progress Bar */}
          <div
            onClick={handleScrub}
            className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden cursor-pointer relative group"
            title="Nhấp để chuyển nhanh tiến độ"
          >
            <div
              className="h-full bg-gradient-to-r from-sky-400 via-rose-400 to-rose-500 rounded-full transition-all duration-150 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Minimal Playback Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center shadow-sm transition-transform active:scale-95"
                title={isPlaying ? 'Tạm dừng' : 'Phát tiếp'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>

              <button
                onClick={handleRestart}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                title="Xem lại từ đầu"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Time display */}
              <span className="text-xs font-mono text-slate-500 ml-1">
                {Math.floor(currentTime)}s / {TOTAL_DURATION}s
              </span>
            </div>

            {/* Right-side audio & fullscreen toggles */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleMute}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                title={isMuted ? 'Bật nhạc' : 'Tắt tiếng'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-sky-600" />}
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
