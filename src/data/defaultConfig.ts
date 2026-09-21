import { BirthdayConfig, ThemePreset } from '../types';

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
  recipientName: 'Kim Ánh',
  recipientNickname: 'Bạn Kim Ánh (K.Á) 🎏',
  birthDate: '20/09',
  age: 17,
  passCode: 'KIMANH',
  editorPassCode: '1512lanvy',
  introText: 'Hôm nay ngày 20/9, xin chúc mừng ngày sinh nhật thứ 17 của con vợ Kim Ánh ✨',
  photos: [
    {
      id: 'photo-1',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
      caption: 'Tuổi 17 trong trẻo rạng ngời của Kim Ánh 🌸',
      tag: 'Sinh nhật 20/09',
    },
    {
      id: 'photo-2',
      url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
      caption: 'Khoảnh khắc tươi vui bên bạn bè & nụ cười tỏa nắng ✨',
      tag: 'Kỷ niệm tuổi 17',
    },
    {
      id: 'photo-3',
      url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
      caption: 'Bé Cá luôn tự do vẫy vùng, rực rỡ và hạnh phúc 🎏',
      tag: 'Kim Ánh 💖',
    },
  ],
  gifts: [
    {
      id: 'gift-1',
      senderName: 'Ngọc Yến',
      giftName: 'Gấu bông Protein',
      imageUrl: '/gifts/gift-1.png',
      message: '',
    },
    {
      id: 'gift-2',
      senderName: 'Nguyên Phương',
      giftName: 'Combo bút, túi bút, bình nc và standeeeee',
      imageUrl: '/gifts/gift-2.png',
      message: '',
    },
    {
      id: 'gift-3',
      senderName: 'Mỹ An',
      giftName: 'Combo quà Usagi và Keonhooo',
      imageUrl: '/gifts/gift-3.png',
      message: '',
    },
    {
      id: 'gift-4',
      senderName: 'Khánh Hà',
      giftName: 'Bình nước cute',
      imageUrl: '/gifts/gift-4.png',
      message: '',
    },
    {
      id: 'gift-5',
      senderName: 'Phi Phụng',
      giftName: 'Nến thơm ',
      imageUrl: '/gifts/gift-5.png',
      message: '',
    },
    {
      id: 'gift-6',
      senderName: 'Thảo Nguyên',
      giftName: 'Móc len dth(sorry ní t ko bt bias đó tên gì é)',
      imageUrl: '/gifts/gift-6.png',
      message: '',
    },
    {
      id: 'gift-7',
      senderName: 'Lan Vy (Tui nà 💕)',
      isLanVy: true,
      giftName: 'Lót ly thằn lằn dí con chihuahua',
      imageUrl: '/gifts/gift-7.png',
      message:
        'Món quà đặc biệt nhất tui dành cho bà chính là bức thư bí mật ở phong bì phía dưới... Bấm vào để đọc nha!',
    },
  ],
  lanVyLetter: {
    title: 'Thư gửi riêng cho bạn Cá (K.Á) từ Lan Vy 💌',
    content:
      'Nhân dịp sinh nhật, t xin chúc bà ngày càng giỏi giang, xinh đẹp, mọi chuyện đều thuận buồm xuôi gió, kiểu như thuyền gặp nước nheee\n\nHọc chung dí nhau, quậy banh chành suốt 3 năm, t cũng có nhiều kỉ niệm thăng trầm dí bà lắm á =))))))\n\nNếu nói về khoảng teamwork thì t đánh giá là ní khó hơn leader khác tí, nhma kiểu làm việc dí bà thì sẽ cảm thấy gất là yên tâm luôn. Giống mấy cái ảnh bot thanh long dí chồng ẻm á, một bờ vai rất đáng tin cậy =))))))))\n\nCòn về những vấn đề khác thì t thấy bà biết lắng nghe. Kiểu thật sự là có nhiều lúc t sẽ rất khùng, yapping rất nhiều, có thể xuyên đêm về một chủ đề xàm nào đó, nhma ní vẫn nghe nhe \nCảm ơn bà nhiều lémmmmm.\n\nH t cũng không biết chúc cụ thể ra sao, nhma t mong là m sẽ tìm được công việc mà m thích và theo đuổi nó.\n\nTại con vợ là kiểu người multiple work luôn á, gì cũng làm được, nên chắc chắn là gất thành công 💪 =))))\n\nSẵn làm cái thiệp này luôn, t muốn làm có luôn phần của nhóm mình, để sau này rảnh rảnh có gì m mở ra coi lại á.\nKỉ niệm tuổi 17 đòoooooooooooooooo 🥳\n\nHappy Birthday, Ká!!! 🎂💐\nChúc con vợ luôn bùm sáng nhaaaaaaaaaaa ✨💗',
    closingWish: 'Mong bà sẽ luôn vui vẻ và hạnh phúc 💖',
  },
  closingMessage1:
    'Mong món quà nhỏ này sẽ là hành trang nhỏ đồng hành với chiếc cá biết đi trong khoảng thời gian rực rỡ nì nhaaa ✨',
  closingMessage2: 'Chúc Ánh luôn khỏe mạnh vui vẻ hạnh phúc 💖',
  senderName: 'Lan Vy',
  themeId: 'clear_azure_pond',
  koiSpeed: 'playful',
  bgMusicTitle: 'Happy Birthday to You',
  bgMusicUrl: '',
};
