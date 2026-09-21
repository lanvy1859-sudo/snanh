export interface Photo {
  id: string;
  url: string;
  caption?: string;
  tag?: string;
}

export interface FriendGift {
  id: string;
  senderName: string;
  isLanVy?: boolean;
  giftName: string;
  imageUrl?: string;
  message: string;
}

export interface LanVySecretLetter {
  title: string;
  content: string;
  closingWish: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  background: string;
  pondColor: string;
  accent: string;
  textColor: string;
}

export interface BirthdayConfig {
  recipientName: string;
  recipientNickname: string;
  birthDate: string;
  age: number;
  passCode: string;
  editorPassCode: string;
  introText: string;
  photos: Photo[];
  gifts: FriendGift[];
  lanVyLetter: LanVySecretLetter;
  closingMessage1: string;
  closingMessage2: string;
  senderName: string;
  themeId: string;
  koiSpeed: 'calm' | 'playful' | 'energetic';
  bgMusicTitle?: string;
  bgMusicUrl?: string;
}

export interface KoiFishData {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  angle: number;
  speed: number;
  length: number;
  colorType: 'scarlet_kohaku' | 'crimson_red' | 'tancho_crown' | 'coral_white';
  tailAngle: number;
  finAngle: number;
  phase: number;
  wiggleSpeed: number;
  jumpProgress?: number; // 0 to 1 for jumping effect
  isJumping?: boolean;
}
