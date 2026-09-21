import { BirthdayConfig, ThemePreset } from '../types';
import savedConfigData from './savedConfig.json';

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'clear_azure_pond',
    name: 'Nước Xanh Lam Trong Mắt (Trong Sáng)',
    description: 'Nước xanh lam trong vắt, cá koi đỏ bơi lượn rực rỡ dưới ánh nắng',
    background: 'from-sky-50 via-cyan-50 to-blue-100',
    pondColor: 'rgba(56, 189, 248, 0.12)',
    accent: '#ef4444',
    textColor: 'text-slate-800',
  },
  {
    id: 'crystal_turquoise',
    name: 'Hồ Ngọc Lam Thanh Khiết',
    description: 'Tone ngọc bích nước trong thanh khiết tươi trẻ',
    background: 'from-emerald-50 via-teal-50 to-cyan-100',
    pondColor: 'rgba(20, 184, 166, 0.12)',
    accent: '#f43f5e',
    textColor: 'text-slate-800',
  },
  {
    id: 'sakura_stream',
    name: 'Suối Trong Cánh Hoa Rơi',
    description: 'Màu nước pha chút hồng pastel trong trẻo nhẹ nhàng',
    background: 'from-rose-50 via-sky-50 to-blue-50',
    pondColor: 'rgba(244, 63, 94, 0.08)',
    accent: '#e11d48',
    textColor: 'text-slate-800',
  },
];

export const DEFAULT_CONFIG: BirthdayConfig = {
  ...savedConfigData,
  gifts: (savedConfigData.gifts && savedConfigData.gifts.length >= 7
    ? savedConfigData.gifts
    : [
        { id: 'gift-1', senderName: 'Người bạn 1', giftName: 'Món quà kỷ niệm 01', imageUrl: '', message: '' },
        { id: 'gift-2', senderName: 'Người bạn 2', giftName: 'Món quà kỷ niệm 02', imageUrl: '', message: '' },
        { id: 'gift-3', senderName: 'Người bạn 3', giftName: 'Món quà kỷ niệm 03', imageUrl: '', message: '' },
        { id: 'gift-4', senderName: 'Người bạn 4', giftName: 'Món quà kỷ niệm 04', imageUrl: '', message: '' },
        { id: 'gift-5', senderName: 'Người bạn 5', giftName: 'Món quà kỷ niệm 05', imageUrl: '', message: '' },
        { id: 'gift-6', senderName: 'Người bạn 6', giftName: 'Món quà kỷ niệm 06', imageUrl: '', message: '' },
        {
          id: 'gift-7',
          senderName: 'Lan Vy (Tui nà 💕)',
          isLanVy: true,
          giftName: 'Món quà đặc biệt từ Lan Vy',
          imageUrl: '',
          message: 'Món quà đặc biệt nhất tui dành cho bà chính là bức thư bí mật ở phong bì phía dưới... Bấm vào để đọc nha!',
        },
      ]
  ).map((g: any, idx: number) => (idx < 6 ? { ...g, message: '' } : g)),
  bgMusicTitle: savedConfigData.bgMusicTitle || 'Happy Birthday to You',
} as BirthdayConfig;
