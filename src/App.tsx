import React, { useState, useEffect } from 'react';
import { BirthdayConfig } from './types';
import { DEFAULT_CONFIG, THEME_PRESETS } from './data/defaultConfig';
import { KoiPondCanvas } from './components/KoiPondCanvas';
import { FlipBookViewer } from './components/FlipBookViewer';
import { EditorModal } from './components/EditorModal';

const STORAGE_KEY = 'kimanh_birthday_flipbook_v3';

export default function App() {
  const [config, setConfig] = useState<BirthdayConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If it's old placeholder data, discard and use DEFAULT_CONFIG
        if (!parsed.gifts || parsed.gifts.length < 7 || parsed.gifts[0]?.senderName === 'Người bạn 1') {
          return DEFAULT_CONFIG;
        }
        if (!parsed.lanVyLetter) {
          parsed.lanVyLetter = DEFAULT_CONFIG.lanVyLetter;
        }
        if (!parsed.editorPassCode || parsed.editorPassCode === 'LANVY') {
          parsed.editorPassCode = '1512lanvy';
        }
        // Ensure messages for friends 1-6 are cleared as requested
        if (parsed.gifts && Array.isArray(parsed.gifts)) {
          parsed.gifts = parsed.gifts.map((g: any, idx: number) => {
            if (idx < 6) {
              return { ...g, message: '' };
            }
            return g;
          });
        }
        parsed.bgMusicTitle = 'Happy Birthday to You';
        return parsed;
      }
    } catch {
      // LocalStorage fallback
    }
    return DEFAULT_CONFIG;
  });

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  // Sync client customizations directly into server files for permanent ZIP packaging
  useEffect(() => {
    try {
      fetch('/api/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      }).catch(() => {});
    } catch {
      // ignore
    }
  }, [config]);

  // Sync to local storage & server on change
  const handleSaveConfig = (newConfig: BirthdayConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      fetch('/api/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      }).catch(() => {});
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  };

  const handleTriggerConfetti = () => {
    setConfettiTrigger((prev) => prev + 1);
  };

  const currentTheme =
    THEME_PRESETS.find((t) => t.id === config.themeId) || THEME_PRESETS[0];

  const speedMultiplier =
    config.koiSpeed === 'calm' ? 0.75 : config.koiSpeed === 'energetic' ? 1.4 : 1.0;

  return (
    <main
      className={`relative w-full min-h-screen bg-gradient-to-b ${currentTheme.background} overflow-hidden font-sans`}
    >
      {/* Background Koi Fish Pond Canvas - Crystal azure water with jumping red koi & confetti feeding */}
      <KoiPondCanvas
        interactive={true}
        speedMultiplier={speedMultiplier}
        pondColor={currentTheme.pondColor}
        confettiTrigger={confettiTrigger}
      />

      {/* Main FlipBook Interactive Viewer (Page 1 -> Page 10) */}
      <FlipBookViewer
        config={config}
        onOpenEditor={() => setIsEditorOpen(true)}
        onTriggerConfetti={handleTriggerConfetti}
      />

      {/* Editor Modal (Customizer Studio for Lan Vy) */}
      <EditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        config={config}
        onSave={handleSaveConfig}
        onPreview={() => setIsEditorOpen(false)}
      />
    </main>
  );
}
