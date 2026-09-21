import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Heart,
  Volume2,
  VolumeX,
  RotateCcw,
  Settings,
  Lock,
  ArrowRight,
  Fish,
  Image as ImageIcon,
  Mail,
  PartyPopper,
  KeyRound,
  Gift,
  Music,
} from 'lucide-react';
import { BirthdayConfig, FriendGift } from '../types';
import { soundManager } from '../utils/audio';
import { SecretLetterModal } from './SecretLetterModal';
import confetti from 'canvas-confetti';

interface FlipBookViewerProps {
  config: BirthdayConfig;
  onOpenEditor: () => void;
  onTriggerConfetti: () => void;
}

export const FlipBookViewer: React.FC<FlipBookViewerProps> = ({
  config,
  onOpenEditor,
  onTriggerConfetti,
}) => {
  // Page index:
  // 0: Trang 1 - Khóa & Cá coi nhảy
  // 1: Trang 2 - Lời mở đầu & Pháo giấy rơi xuống hồ cho cá ăn
  // 2 -> 7: Trang 3..8 - Quà bạn 1 đến 6
  // 8: Trang 9 - Quà Lan Vy (#7) với bức thư đang rung & hiệu ứng gõ chữ
  // 9: Trang 10 - Lời kết & Đồng hành
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  // Lan Vy Gear Modal state
  const [isGearModalOpen, setIsGearModalOpen] = useState<boolean>(false);
  const [gearPassInput, setGearPassInput] = useState<string>('');
  const [gearPassError, setGearPassError] = useState<string>('');

  // Secret letter modal
  const [isLetterModalOpen, setIsLetterModalOpen] = useState<boolean>(false);

  // Total pages = 10 (Page 1: Lock, Page 2: Confetti intro, Pages 3-8: Gifts 1-6, Page 9: Lan Vy Gift 7 + Letter, Page 10: Finale)
  const totalPages = 10;

  // Sound melody on load
  useEffect(() => {
    // Only play melody if user interacted or unlocked
    if (isUnlocked) {
      soundManager.startBirthdayMelody();
    }
    return () => {
      soundManager.stopMelody();
    };
  }, [isUnlocked]);

  // Page 2 trigger confetti automatically when turning to it
  useEffect(() => {
    if (currentPage === 1) {
      onTriggerConfetti();
      confetti({
        particleCount: 50,
        spread: 75,
        origin: { y: 0.5 },
        colors: ['#ef4444', '#38bdf8', '#fbbf24', '#f43f5e', '#10b981'],
      });
      soundManager.playChime(700);
    }
  }, [currentPage]);

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = passwordInput.trim().toUpperCase().replace(/\s+/g, '');
    const validPass = (config.passCode || 'KIMANH').toUpperCase().replace(/\s+/g, '');

    if (cleanInput === validPass || cleanInput === 'KIMANH' || cleanInput === 'KIMÁNH') {
      soundManager.playPageFlip();
      setIsUnlocked(true);
      setDirection('next');
      setCurrentPage(1);
    } else {
      soundManager.playWaterDrop(300);
      setPasswordError('Mật mã chưa chính xác. Hãy hỏi người gửi thiệp nhé!');
      setTimeout(() => setPasswordError(''), 3500);
    }
  };

  const handleGearSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = gearPassInput.trim().toLowerCase().replace(/\s+/g, '');
    const validEditorPass = (config.editorPassCode || '1512lanvy').toLowerCase().replace(/\s+/g, '');

    if (cleanInput === validEditorPass || cleanInput === '1512lanvy') {
      soundManager.playChime(880);
      setIsGearModalOpen(false);
      setGearPassInput('');
      setGearPassError('');
      onOpenEditor();
    } else {
      soundManager.playWaterDrop(320);
      setGearPassError('Mật mã chưa chính xác');
      setTimeout(() => setGearPassError(''), 3500);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      soundManager.playPageFlip();
      setDirection('next');
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1 || (currentPage === 1 && isUnlocked)) {
      soundManager.playPageFlip();
      setDirection('prev');
      setCurrentPage((prev) => Math.max(prev - 1, 0));
    }
  };

  // 3D Page flip animation variants
  const pageVariants = {
    enter: (dir: 'next' | 'prev') => ({
      rotateY: dir === 'next' ? 70 : -70,
      opacity: 0,
      scale: 0.94,
      transformOrigin: dir === 'next' ? 'left center' : 'right center',
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
    exit: (dir: 'next' | 'prev') => ({
      rotateY: dir === 'next' ? -70 : 70,
      opacity: 0,
      scale: 0.94,
      transformOrigin: dir === 'next' ? 'right center' : 'left center',
      transition: {
        duration: 0.45,
        ease: [0.7, 0, 0.84, 0] as const,
      },
    }),
  };

  // Get gifts (guaranteed 7 gifts)
  const gifts = config.gifts && config.gifts.length >= 7 ? config.gifts : [];

  return (
    <div className="relative min-h-screen flex flex-col justify-between p-3 md:p-6 z-10 select-none overflow-hidden">
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between z-40 max-w-5xl mx-auto">
        {/* Left: App Title or Page Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-sky-200/80 shadow-xs">
            <Fish className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-semibold text-slate-700">
              {config.recipientNickname || 'K.Á • Cá Koi 🎏'}
            </span>
          </div>

          {isUnlocked && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/75 backdrop-blur-md border border-sky-100 text-xs text-slate-600 font-medium">
              <span>Trang {currentPage + 1} / {totalPages}</span>
            </div>
          )}
        </div>

        {/* Right: Audio control & Gear settings button */}
        <div className="flex items-center gap-2">
          {/* Happy Birthday track badge */}
          <button
            onClick={handleToggleMute}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/85 hover:bg-white border border-rose-200/80 text-rose-700 text-xs font-semibold shadow-xs backdrop-blur-md transition-all cursor-pointer"
            title={isMuted ? 'Bật nhạc Happy Birthday' : 'Tắt nhạc'}
          >
            <Music className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span className="truncate max-w-[130px] sm:max-w-[170px]">Happy Birthday 🎵</span>
            {!isMuted && (
              <span className="flex items-end gap-0.5 h-3.5 ml-0.5">
                <span className="w-0.5 h-3 bg-rose-500 rounded-full animate-pulse" />
                <span className="w-0.5 h-2 bg-rose-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="w-0.5 h-3.5 bg-rose-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              </span>
            )}
          </button>

          <button
            id="btn-toggle-sound"
            onClick={handleToggleMute}
            className="p-2.5 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-rose-500 border border-white/90 backdrop-blur-md shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title={isMuted ? 'Bật nhạc Happy Birthday' : 'Tắt nhạc'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-rose-500" />}
          </button>

          {/* Small Gear button for Lan Vy edit mode */}
          <button
            id="btn-gear-settings"
            onClick={() => {
              soundManager.playWaterDrop(680);
              setIsGearModalOpen(true);
            }}
            title="Chế độ chỉnh sửa (Dành cho Lan Vy)"
            className="p-2.5 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-rose-500 border border-white/90 backdrop-blur-md shadow-xs transition-all hover:scale-105 active:scale-95 group cursor-pointer flex items-center gap-1.5"
          >
            <Settings className="w-4 h-4 text-slate-500 group-hover:rotate-90 group-hover:text-rose-500 transition-all duration-300" />
            <span className="text-xs font-semibold text-slate-600 hidden md:inline">
              Chỉnh sửa
            </span>
          </button>
        </div>
      </div>

      {/* Main Flip Book Stage */}
      <div className="flex-1 flex items-center justify-center my-4 perspective-[1400px]">
        <div className="w-full max-w-2xl min-h-[460px] md:min-h-[520px] relative flex items-center justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            {/* TRANG 1: Màn hình cá coi nhảy và câu nhập pass */}
            {currentPage === 0 && (
              <motion.div
                key="page-1"
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full bg-white/85 backdrop-blur-xl border border-white/90 rounded-3xl p-7 md:p-10 shadow-2xl shadow-sky-900/10 relative overflow-hidden flex flex-col items-center text-center"
              >
                {/* Visual accent bubbles */}
                <div className="absolute -top-12 -left-12 w-36 h-36 bg-sky-200/40 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-rose-200/40 rounded-full blur-2xl pointer-events-none" />

                {/* Badge & Avatar */}
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-400 to-amber-400 p-0.5 shadow-lg shadow-rose-500/20 mb-4 flex items-center justify-center"
                >
                  <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                    <Fish className="w-8 h-8 text-rose-500 animate-pulse" />
                  </div>
                </motion.div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Sinh nhật 20/09 • Tuổi 17
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-2">
                  {config.recipientName}
                </h1>

                <p className="text-sm text-slate-500 max-w-sm mb-6 font-medium">
                  Cuốn sổ kỷ niệm tuổi 17 bên đàn cá Koi trong vắt. Mở cuốn sổ để khám phá những điều bất ngờ...
                </p>

                {/* Ô nhập pass sạch sẽ không có gợi ý */}
                <form onSubmit={handleUnlock} className="w-full max-w-sm space-y-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4 text-sky-500" />
                    </div>
                    <input
                      id="input-flipbook-pass"
                      type="text"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Nhập mật mã để mở..."
                      autoFocus
                      className="w-full pl-11 pr-4 py-3.5 bg-white/95 border border-sky-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50 rounded-2xl text-slate-800 placeholder-slate-400 text-sm font-semibold tracking-wider transition-all uppercase text-center shadow-xs"
                    />
                  </div>

                  {passwordError && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-rose-500 font-medium"
                    >
                      {passwordError}
                    </motion.p>
                  )}

                  <button
                    id="btn-open-flipbook"
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-sm shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Lật mở cuốn sổ sinh nhật</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <p className="text-[11px] text-slate-400 mt-5">
                  Gợi ý: Hãy hỏi người gửi để nhận mật mã mở thiệp 🎏
                </p>
              </motion.div>
            )}

            {/* TRANG 2: Chúc mừng sinh nhật & Pháo giấy rơi xuống hồ cho cá ăn */}
            {currentPage === 1 && (
              <motion.div
                key="page-2"
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full bg-white/85 backdrop-blur-xl border border-white/90 rounded-3xl p-7 md:p-10 shadow-2xl shadow-sky-900/10 relative overflow-hidden flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 shadow-sm mb-4">
                  <PartyPopper className="w-7 h-7 text-rose-500 animate-bounce" />
                </div>

                <span className="text-xs font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 mb-3">
                  ✨ Chúc Mừng Tuổi 17 ✨
                </span>

                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 leading-snug max-w-md mb-4">
                  {config.introText ||
                    'Hôm nay ngày 20/9, xin chúc mừng ngày sinh nhật thứ 17 của bn Kim Ánh ✨'}
                </h2>

                <p className="text-sm text-slate-600 max-w-lg mb-6 leading-relaxed">
                  Pháo giấy tung bay ngập trời chúc mừng sinh nhật Kim Ánh! Từng mảnh pháo rơi xuống hồ nước xanh lam đang được đàn cá Koi đớp ăn vui vẻ 🎏
                </p>

                {/* Action to shoot more confetti and feed koi */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                  <button
                    onClick={() => {
                      onTriggerConfetti();
                      soundManager.playChime(750);
                    }}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-500 hover:to-rose-600 text-white text-xs md:text-sm font-bold shadow-md shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-100" />
                    <span>Tung thêm pháo giấy cho cá ăn 🎉</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-sky-100 w-full flex items-center justify-between text-xs text-slate-400">
                  <span>Trang 2: Khởi đầu rực rỡ</span>
                  <button
                    onClick={goToNextPage}
                    className="flex items-center gap-1 text-rose-600 font-bold hover:underline cursor-pointer"
                  >
                    <span>Xem món quà từ bạn bè</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* TRANG 3 ĐẾN 8: Món quà của 6 người bạn đầu tiên */}
            {currentPage >= 2 && currentPage <= 7 && (
              <motion.div
                key={`page-gift-${currentPage}`}
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full bg-white/85 backdrop-blur-xl border border-white/90 rounded-3xl p-6 md:p-9 shadow-2xl shadow-sky-900/10 relative overflow-hidden flex flex-col"
              >
                {(() => {
                  const giftIndex = currentPage - 2; // 0 to 5
                  const gift = gifts[giftIndex] || {
                    id: `gift-${giftIndex + 1}`,
                    senderName: `Người bạn ${giftIndex + 1}`,
                    giftName: `Món quà kỷ niệm 0${giftIndex + 1}`,
                    imageUrl: '',
                    message: `Chúc Kim Ánh sinh nhật thứ 17 luôn vui vẻ, rạng ngời và ngập tràn hạnh phúc!`,
                  };

                  return (
                    <div className="flex flex-col h-full justify-between">
                      {/* Top Tag */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200">
                          <Gift className="w-3.5 h-3.5 text-rose-500" />
                          <span>Món Quà Kỷ Niệm {giftIndex + 1}/7</span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">
                          Kim Ánh 20/09
                        </span>
                      </div>

                      {/* Main Gift Content: Photo + Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center my-2">
                        {/* Photo or aesthetic placeholder */}
                        <div className="w-full h-48 md:h-56 rounded-2xl overflow-hidden bg-sky-50/80 border border-sky-200/80 shadow-inner flex items-center justify-center relative group">
                          {gift.imageUrl ? (
                            <img
                              src={gift.imageUrl}
                              alt={gift.giftName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                              <div className="w-12 h-12 rounded-full bg-white/90 shadow-xs flex items-center justify-center text-rose-400 mb-2">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                              <span className="text-xs font-semibold text-slate-600">
                                {gift.giftName || 'Ảnh kỷ niệm / món quà'}
                              </span>
                              <span className="text-[11px] text-slate-400 mt-1">
                                (Lan Vy có thể thêm ảnh trong nút ⚙️)
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Gift Info: Tên người gửi & Món quà (đã xóa phần lời nhắn cho bạn bè) */}
                        <div className="flex flex-col justify-center text-left">
                          <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider">
                            Người gửi:
                          </span>
                          <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">
                            {gift.senderName || `Người bạn ${giftIndex + 1}`}
                          </h3>

                          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-rose-50 text-amber-900 text-xs md:text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-amber-200/80 shadow-xs w-fit">
                            <Gift className="w-4 h-4 text-rose-500 shrink-0" />
                            <span>{gift.giftName || `Món quà kỷ niệm 0${giftIndex + 1}`}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Navigation info */}
                      <div className="pt-4 border-t border-sky-100 flex items-center justify-between text-xs text-slate-400 mt-4">
                        <button
                          onClick={goToPrevPage}
                          className="flex items-center gap-1 hover:text-slate-700 cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Trang trước</span>
                        </button>
                        <span>Quà tặng {giftIndex + 1} / 7</span>
                        <button
                          onClick={goToNextPage}
                          className="flex items-center gap-1 text-rose-600 font-bold hover:underline cursor-pointer"
                        >
                          <span>Trang sau</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {/* TRANG 9: Quà tặng thứ 7 - Lan Vy (Tui nà 💕) & BỨC THƯ ĐANG RUNG LẮC */}
            {currentPage === 8 && (
              <motion.div
                key="page-lanvy"
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full bg-gradient-to-b from-rose-50/90 via-white/90 to-amber-50/90 backdrop-blur-xl border border-rose-200/90 rounded-3xl p-6 md:p-8 shadow-2xl shadow-rose-900/10 relative overflow-hidden flex flex-col justify-between"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    <span>Món Quà Kỷ Niệm 7/7 • Lan Vy (Tui nà 💕)</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    20/09 • Tuổi 17
                  </span>
                </div>

                {/* Lan Vy Gift Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-3">
                  <div className="w-full h-36 md:h-44 rounded-2xl overflow-hidden bg-rose-50 border border-rose-200 shadow-inner flex items-center justify-center relative">
                    {gifts[6]?.imageUrl ? (
                      <img
                        src={gifts[6].imageUrl}
                        alt="Món quà của Lan Vy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 p-3 text-center">
                        <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center text-rose-500 mb-1.5">
                          <Heart className="w-5 h-5 fill-rose-500" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                          {gifts[6]?.giftName || 'Món quà đặc biệt từ Lan Vy'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          (Lan Vy có thể chèn ảnh chung của 2 bạn)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-left flex flex-col justify-center">
                    <h3 className="text-xl font-extrabold text-slate-800">
                      {gifts[6]?.senderName || 'Lan Vy (Tui nà 💕)'}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-white/70 p-3 rounded-xl border border-rose-100">
                      {gifts[6]?.message ||
                        'Món quà đặc biệt nhất tui dành cho bà chính là bức thư bí mật ở phong bì phía dưới... Bấm vào để đọc nha!'}
                    </p>
                  </div>
                </div>

                {/* ĐẶC BIỆT: BỨC THƯ ĐANG RUNG Ở PHÍA DƯỚI */}
                <div className="my-2 p-3 bg-white/90 rounded-2xl border-2 border-rose-300/80 shadow-md flex flex-col items-center text-center relative overflow-hidden">
                  <div className="text-xs font-bold text-rose-600 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>BỨC THƯ BÍ MẬT ĐANG ĐỢI KIM ÁNH MỞ 💌</span>
                  </div>

                  {/* Vibrating / Shaking Envelope Button */}
                  <motion.button
                    id="btn-vibrating-envelope"
                    onClick={() => {
                      soundManager.playChime(820);
                      setIsLetterModalOpen(true);
                    }}
                    animate={{
                      rotate: [-2, 2, -2, 2, 0],
                      scale: [1, 1.03, 0.99, 1.02, 1],
                    }}
                    transition={{
                      repeat: Infinity,
                      repeatDelay: 1.2,
                      duration: 0.5,
                      ease: 'easeInOut',
                    }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-500/30 flex items-center gap-3 cursor-pointer hover:shadow-rose-500/50 transition-all border border-white/60"
                  >
                    <Mail className="w-6 h-6 animate-pulse" />
                    <span>Mở tui đi nè</span>
                    <Heart className="w-4 h-4 fill-white" />
                  </motion.button>

                  {/* Cuối trang: "mong bà sẽ luôn vui vẻ và hạnh phúc" */}
                  <p className="text-xs font-bold text-rose-500 mt-2.5">
                    {config.lanVyLetter?.closingWish || 'Mong bà sẽ luôn vui vẻ và hạnh phúc 💖'}
                  </p>
                </div>

                {/* Footer Navigation */}
                <div className="pt-3 border-t border-rose-100 flex items-center justify-between text-xs text-slate-400">
                  <button
                    onClick={goToPrevPage}
                    className="flex items-center gap-1 hover:text-slate-700 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Trang trước</span>
                  </button>
                  <span className="font-bold text-rose-500">Món quà thứ 7 • Lan Vy</span>
                  <button
                    onClick={goToNextPage}
                    className="flex items-center gap-1 text-rose-600 font-bold hover:underline cursor-pointer"
                  >
                    <span>Trang kết</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* TRANG 10: Lời kết đồng hành rực rỡ */}
            {currentPage === 9 && (
              <motion.div
                key="page-finale"
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full bg-white/90 backdrop-blur-xl border border-white/90 rounded-3xl p-7 md:p-10 shadow-2xl shadow-sky-900/10 relative overflow-hidden flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 p-0.5 shadow-md shadow-rose-500/20 mb-4 flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                    <Fish className="w-8 h-8 text-rose-500" />
                  </div>
                </div>

                <span className="text-xs font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 mb-3">
                  ✨ Tuổi 17 Tỏa Sáng ✨
                </span>

                <h2 className="text-xl md:text-2xl font-bold text-slate-800 max-w-lg mb-4 leading-relaxed">
                  "{config.closingMessage1 ||
                    'Mong món quà nhỏ này sẽ là hành trang nhỏ đồng hành với bn cá trong khoảng thời gian rực rỡ nìi ✨'}"
                </h2>

                <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-4 max-w-md my-2">
                  <p className="text-base md:text-lg font-extrabold text-rose-600 flex items-center justify-center gap-2">
                    <Heart className="w-5 h-5 fill-rose-500" />
                    <span>{config.closingMessage2 || 'Chúc Ánh luôn khỏe mạnh vui vẻ hạnh phúc 💖'}</span>
                  </p>
                </div>

                <p className="text-xs text-slate-400 mt-2 mb-6">
                  Từ Lan Vy & Những người bạn thân yêu gửi tới Bạn Cá (K.Á)
                </p>

                {/* Actions: Replay from beginning or Shoot confetti */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      soundManager.playPageFlip();
                      setDirection('prev');
                      setCurrentPage(1);
                    }}
                    className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Xem lại từ đầu</span>
                  </button>

                  <button
                    onClick={() => {
                      onTriggerConfetti();
                      confetti({
                        particleCount: 80,
                        spread: 90,
                        origin: { y: 0.6 },
                        colors: ['#ef4444', '#38bdf8', '#fbbf24', '#f43f5e'],
                      });
                    }}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs md:text-sm font-bold shadow-md shadow-rose-500/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Tung pháo giấy chúc mừng 🎉</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Page Flip Bar (Only when unlocked) */}
      {isUnlocked && (
        <div className="w-full max-w-xl mx-auto flex items-center justify-between z-40 bg-white/75 backdrop-blur-md px-4 py-2.5 rounded-full border border-sky-200/70 shadow-md">
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className={`p-2 rounded-full transition-all cursor-pointer ${
              currentPage <= 1
                ? 'opacity-30 cursor-not-allowed text-slate-400'
                : 'text-slate-700 hover:bg-sky-50 hover:text-rose-500 active:scale-95'
            }`}
            title="Trang trước"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (idx === 0) return; // don't go back to lock screen accidentally
                  soundManager.playPageFlip();
                  setDirection(idx > currentPage ? 'next' : 'prev');
                  setCurrentPage(idx);
                }}
                className={`transition-all rounded-full ${
                  currentPage === idx
                    ? 'w-6 h-2 bg-rose-500'
                    : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                }`}
                title={`Lật đến trang ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages - 1}
            className={`p-2 rounded-full transition-all cursor-pointer ${
              currentPage >= totalPages - 1
                ? 'opacity-30 cursor-not-allowed text-slate-400'
                : 'text-slate-700 hover:bg-sky-50 hover:text-rose-500 active:scale-95'
            }`}
            title="Trang sau"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Secret Letter Modal with Typewriter effect */}
      <SecretLetterModal
        isOpen={isLetterModalOpen}
        onClose={() => setIsLetterModalOpen(false)}
        letter={config.lanVyLetter}
      />

      {/* Lan Vy Passcode Modal for Gear button */}
      <AnimatePresence>
        {isGearModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 md:p-7 shadow-2xl border border-sky-100 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center mx-auto mb-3">
                <Settings className="w-6 h-6 animate-spin-slow" />
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-1">
                Chế Độ Chỉnh Sửa
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Dành cho Lan Vy để thay ảnh, sửa 7 món quà và bức thư bí mật.
              </p>

              <form onSubmit={handleGearSubmit} className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4 text-rose-500" />
                  </div>
                  <input
                    type="password"
                    value={gearPassInput}
                    onChange={(e) => setGearPassInput(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50 rounded-xl text-slate-800 text-sm font-semibold tracking-wider transition-all"
                  />
                </div>

                {gearPassError && (
                  <p className="text-xs text-rose-500 font-medium">{gearPassError}</p>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsGearModalOpen(false);
                      setGearPassInput('');
                      setGearPassError('');
                    }}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    Xác nhận
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
