import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Save,
  RotateCcw,
  Image as ImageIcon,
  Heart,
  User,
  Palette,
  Plus,
  Trash2,
  Upload,
  Sparkles,
  Check,
  Eye,
  KeyRound,
  Mail,
  Gift,
  FileText,
  Copy,
} from 'lucide-react';
import { BirthdayConfig, FriendGift, Photo } from '../types';
import { DEFAULT_CONFIG } from '../data/defaultConfig';
import { soundManager } from '../utils/audio';

interface EditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BirthdayConfig;
  onSave: (newConfig: BirthdayConfig) => void;
  onPreview: () => void;
}

export const EditorModal: React.FC<EditorModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  onPreview,
}) => {
  const [formData, setFormData] = useState<BirthdayConfig>(() => {
    const cloned = JSON.parse(JSON.stringify(config));
    // Ensure 7 gifts exist
    if (!cloned.gifts || cloned.gifts.length < 7) {
      cloned.gifts = DEFAULT_CONFIG.gifts;
    }
    if (!cloned.lanVyLetter) {
      cloned.lanVyLetter = DEFAULT_CONFIG.lanVyLetter;
    }
    return cloned;
  });

  const [activeTab, setActiveTab] = useState<'gifts' | 'letter' | 'photos' | 'general' | 'security'>('gifts');
  const [selectedGiftIndex, setSelectedGiftIndex] = useState<number>(0);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const giftFileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    onSave(formData);
    soundManager.playChime(880);
    try {
      await fetch('/api/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch {
      // ignore
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCopyJson = () => {
    try {
      navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
      setCopySuccess(true);
      soundManager.playWaterDrop(700);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      alert('Đã có lỗi khi sao chép. Dữ liệu của bạn vẫn được lưu tự động trên hệ thống!');
    }
  };

  const handleResetDefault = () => {
    if (window.confirm('Đặt lại tất cả nội dung về mặc định ban đầu cho Kim Ánh & Lan Vy?')) {
      setFormData(JSON.parse(JSON.stringify(DEFAULT_CONFIG)));
      soundManager.playWaterDrop(500);
    }
  };

  // Upload image for the active gift
  const handleGiftImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const dataUrl = event.target.result as string;
        setFormData((prev) => {
          const updatedGifts = [...prev.gifts];
          if (updatedGifts[selectedGiftIndex]) {
            updatedGifts[selectedGiftIndex] = {
              ...updatedGifts[selectedGiftIndex],
              imageUrl: dataUrl,
            };
          }
          return { ...prev, gifts: updatedGifts };
        });
        soundManager.playWaterDrop(620);
      }
    };
    reader.readAsDataURL(file);
    if (giftFileInputRef.current) giftFileInputRef.current.value = '';
  };

  const handleGiftImageByUrl = () => {
    const currentUrl = formData.gifts[selectedGiftIndex]?.imageUrl || '';
    const url = prompt('Dán đường dẫn ảnh (URL):', currentUrl);
    if (url !== null) {
      setFormData((prev) => {
        const updatedGifts = [...prev.gifts];
        if (updatedGifts[selectedGiftIndex]) {
          updatedGifts[selectedGiftIndex] = {
            ...updatedGifts[selectedGiftIndex],
            imageUrl: url.trim(),
          };
        }
        return { ...prev, gifts: updatedGifts };
      });
      soundManager.playWaterDrop(600);
    }
  };

  const handleRemoveGiftImage = () => {
    setFormData((prev) => {
      const updatedGifts = [...prev.gifts];
      if (updatedGifts[selectedGiftIndex]) {
        updatedGifts[selectedGiftIndex] = {
          ...updatedGifts[selectedGiftIndex],
          imageUrl: '',
        };
      }
      return { ...prev, gifts: updatedGifts };
    });
    soundManager.playWaterDrop(400);
  };

  const currentGift = formData.gifts[selectedGiftIndex] || formData.gifts[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl h-[92vh] max-h-[760px] bg-white rounded-3xl border border-sky-100 shadow-2xl flex flex-col overflow-hidden text-slate-800"
      >
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between bg-sky-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-slate-800">
                Chế Độ Chỉnh Sửa Dành Cho Lan Vy
              </h2>
              <p className="text-xs text-slate-500">
                Tùy biến 7 món quà, thư bí mật gõ chữ và hình ảnh cho Kim Ánh (20/09)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <Check className="w-3.5 h-3.5" /> Đã lưu thành công!
              </span>
            )}

            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs md:text-sm shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu thay đổi</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-1 px-4 md:px-6 pt-3 border-b border-slate-100 bg-slate-50/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('gifts')}
            className={`pb-3 px-3 text-xs md:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'gifts'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>7 Món Quà Bạn Bè</span>
          </button>

          <button
            onClick={() => setActiveTab('letter')}
            className={`pb-3 px-3 text-xs md:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'letter'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4 text-rose-500" />
            <span>Thư Rung & Gõ Chữ Của Lan Vy 💌</span>
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`pb-3 px-3 text-xs md:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Lời Chúc & Thông Tin</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 px-3 text-xs md:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Mật Mã Thiệp</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/30">
          {/* TAB 1: 7 MÓN QUÀ BẠN BÈ */}
          {activeTab === 'gifts' && (
            <div className="space-y-5">
              {/* Gift Selectors (1 to 7) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {formData.gifts.map((g, idx) => (
                  <button
                    key={g.id || idx}
                    onClick={() => setSelectedGiftIndex(idx)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                      selectedGiftIndex === idx
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 scale-105'
                        : idx === 6
                        ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-200'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {idx === 6 ? <Heart className="w-3.5 h-3.5 fill-current" /> : <Gift className="w-3.5 h-3.5" />}
                    <span>
                      {idx === 6 ? 'Quà #7 (Lan Vy 💕)' : `Quà #${idx + 1}`}
                    </span>
                  </button>
                ))}
              </div>

              {/* Editing selected gift */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left: Gift Details Form */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                      Đang sửa Món Quà {selectedGiftIndex + 1}/7 {selectedGiftIndex === 6 && '• Lan Vy'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tên người tặng quà:
                    </label>
                    <input
                      type="text"
                      value={currentGift.senderName}
                      onChange={(e) => {
                        const updated = [...formData.gifts];
                        updated[selectedGiftIndex].senderName = e.target.value;
                        setFormData({ ...formData, gifts: updated });
                      }}
                      placeholder="Ví dụ: Hoàng Nam, Minh Anh..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-rose-400 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tên món quà hoặc kỷ niệm:
                    </label>
                    <input
                      type="text"
                      value={currentGift.giftName}
                      onChange={(e) => {
                        const updated = [...formData.gifts];
                        updated[selectedGiftIndex].giftName = e.target.value;
                        setFormData({ ...formData, gifts: updated });
                      }}
                      placeholder="Ví dụ: Vòng tay handmade, Bó hoa kem..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-rose-400 focus:bg-white transition-all"
                    />
                  </div>

                  {selectedGiftIndex === 6 ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Lời nhắn của Lan Vy gửi Kim Ánh:
                      </label>
                      <textarea
                        rows={3}
                        value={currentGift.message}
                        onChange={(e) => {
                          const updated = [...formData.gifts];
                          updated[selectedGiftIndex].message = e.target.value;
                          setFormData({ ...formData, gifts: updated });
                        }}
                        placeholder="Nhập lời nhắn của Lan Vy..."
                        className="w-full px-3.5 py-2.5 bg-rose-50/50 border border-rose-200 rounded-xl text-sm font-medium focus:border-rose-400 focus:bg-white transition-all"
                      />
                    </div>
                  ) : (
                    <div className="p-3 bg-sky-50/70 border border-sky-200/80 rounded-xl text-xs text-sky-800">
                      <span className="font-bold">✨ Thông tin: </span>
                      Phần lời nhắn của bạn bè đã được xóa theo yêu cầu (chỉ giữ lại Tên người gửi và Tên món quà). Riêng Quà #7 của Lan Vy vẫn giữ nguyên lời nhắn và bức thư riêng!
                    </div>
                  )}
                </div>

                {/* Right: Gift Image Upload & Preview */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    Ảnh món quà / Kỷ niệm:
                  </label>

                  <div className="w-full h-48 rounded-2xl bg-sky-50/60 border-2 border-dashed border-sky-200 flex items-center justify-center overflow-hidden relative">
                    {currentGift.imageUrl ? (
                      <>
                        <img
                          src={currentGift.imageUrl}
                          alt="Ảnh món quà"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={handleRemoveGiftImage}
                          className="absolute top-2 right-2 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow-sm text-xs cursor-pointer"
                          title="Xóa ảnh"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                        <ImageIcon className="w-8 h-8 text-sky-400 mb-1.5" />
                        <span className="text-xs font-semibold text-slate-600">
                          Chưa có ảnh món quà này
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5">
                          Tải ảnh từ máy tính hoặc dán link bên dưới
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Image actions */}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={giftFileInputRef}
                      onChange={handleGiftImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => giftFileInputRef.current?.click()}
                      className="flex-1 py-2 px-3 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Tải ảnh từ máy</span>
                    </button>

                    <button
                      onClick={handleGiftImageByUrl}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Dán link ảnh URL</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: THƯ RUNG & GÕ CHỮ CỦA LAN VY */}
          {activeTab === 'letter' && (
            <div className="bg-white rounded-2xl border border-rose-200 p-5 md:p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl border border-rose-200">
                <Mail className="w-5 h-5 text-rose-500" />
                <div>
                  <h4 className="text-xs md:text-sm font-bold text-rose-900">
                    Bức thư bí mật của Lan Vy (Hiệu ứng gõ chữ Typewriter)
                  </h4>
                  <p className="text-[11px] text-rose-700">
                    Nội dung thư này sẽ xuất hiện với hiệu ứng gõ chữ lách cách khi Kim Ánh nhấp vào bức thư đang rung ở Trang 9!
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề bức thư:
                </label>
                <input
                  type="text"
                  value={formData.lanVyLetter.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lanVyLetter: { ...formData.lanVyLetter, title: e.target.value },
                    })
                  }
                  placeholder="Thư gửi riêng cho bạn Cá (K.Á) từ Lan Vy 💌"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-rose-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội dung thư bí mật (Chạy hiệu ứng gõ chữ):
                </label>
                <textarea
                  rows={8}
                  value={formData.lanVyLetter.content}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lanVyLetter: { ...formData.lanVyLetter, content: e.target.value },
                    })
                  }
                  placeholder="Nhập những lời tâm tình Lan Vy muốn gửi tới Kim Ánh..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-rose-400 focus:bg-white leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lời chúc kết thúc bức thư & cuối trang:
                </label>
                <input
                  type="text"
                  value={formData.lanVyLetter.closingWish}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lanVyLetter: { ...formData.lanVyLetter, closingWish: e.target.value },
                    })
                  }
                  placeholder="Mong bà sẽ luôn vui vẻ và hạnh phúc 💖"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-rose-600 focus:border-rose-400 focus:bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Dòng chữ này luôn hiện ở cuối trang và kết thúc thư đúng như yêu cầu: "mong bà sẽ luôn vui vẻ và hạnh phúc".
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: THÔNG TIN & LỜI CHÚC MỞ ĐẦU / KẾT THÚC */}
          {activeTab === 'general' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên người nhận:
                  </label>
                  <input
                    type="text"
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Biệt danh (K.Á):
                  </label>
                  <input
                    type="text"
                    value={formData.recipientNickname}
                    onChange={(e) => setFormData({ ...formData, recipientNickname: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngày sinh:
                  </label>
                  <input
                    type="text"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tuổi sinh nhật:
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 17 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Câu chúc mở đầu (Trang 2):
                </label>
                <textarea
                  rows={2}
                  value={formData.introText}
                  onChange={(e) => setFormData({ ...formData, introText: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Câu chúc đồng hành (Trang 10):
                </label>
                <textarea
                  rows={2}
                  value={formData.closingMessage1}
                  onChange={(e) => setFormData({ ...formData, closingMessage1: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lời chúc kết thúc (Trang 10):
                </label>
                <input
                  type="text"
                  value={formData.closingMessage2}
                  onChange={(e) => setFormData({ ...formData, closingMessage2: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-rose-600"
                />
              </div>
            </div>
          )}

          {/* TAB 4: MẬT MÃ BẢO VỆ */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100">
                  <div className="flex items-center gap-2 mb-2 text-sky-800 font-bold text-sm">
                    <KeyRound className="w-4 h-4 text-sky-600" />
                    <span>Mật mã để Kim Ánh mở thiệp</span>
                  </div>
                  <input
                    type="text"
                    value={formData.passCode}
                    onChange={(e) => setFormData({ ...formData, passCode: e.target.value.toUpperCase() })}
                    placeholder="KIMANH"
                    className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl font-bold uppercase tracking-wider text-slate-800"
                  />
                  <p className="text-[11px] text-slate-500 mt-2">
                    Mặc định là <b>KIMANH</b>. Không hiển thị gợi ý trên ô nhập theo yêu cầu của bạn.
                  </p>
                </div>

                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                  <div className="flex items-center gap-2 mb-2 text-rose-800 font-bold text-sm">
                    <KeyRound className="w-4 h-4 text-rose-600" />
                    <span>Mật mã chỉnh sửa của Lan Vy (Bánh răng ⚙️)</span>
                  </div>
                  <input
                    type="text"
                    value={formData.editorPassCode}
                    onChange={(e) => setFormData({ ...formData, editorPassCode: e.target.value })}
                    placeholder="1512lanvy"
                    className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl font-bold tracking-wider text-rose-600"
                  />
                  <p className="text-[11px] text-slate-500 mt-2">
                    Mặc định là <b>1512lanvy</b>. Nhập pass này khi bấm vào nút bánh răng để mở giao diện chỉnh sửa này.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefault}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại mặc định</span>
            </button>

            <button
              onClick={handleCopyJson}
              className="text-xs text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer font-medium transition-all"
              title="Sao chép toàn bộ dữ liệu cấu hình để dự phòng"
            >
              {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copySuccess ? 'Đã sao chép mã!' : 'Sao chép cấu hình (JSON)'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-pulse">
                <Check className="w-4 h-4" /> Đã lưu vào mã nguồn & file ZIP!
              </span>
            )}

            <button
              onClick={onPreview}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs md:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Xem trước thiệp</span>
            </button>

            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs md:text-sm shadow-md shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu & Tích hợp ZIP</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
