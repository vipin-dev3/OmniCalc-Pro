import React, { useState } from 'react';
import { Palette, Volume2, VolumeX, History, Keyboard, Check, SlidersHorizontal, Terminal } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSound } from '../../context/SoundContext';
import { useHistory } from '../../context/HistoryContext';
import { ThemeType } from '../../types/calculator';

interface HeaderProps {
  onOpenShortcuts: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenShortcuts }) => {
  const { theme, setTheme, availableThemes } = useTheme();
  const { soundEnabled, toggleSound } = useSound();
  const { history, toggleDrawer } = useHistory();
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  return (
    <header className="w-full flex items-center justify-between py-2.5 px-4 md:px-8 border-b border-[var(--border-color)] bg-[var(--bg-header)] backdrop-blur-xl sticky top-0 z-30 transition-colors duration-200">
      {/* Brand & Precision Logo */}
      <div className="flex items-center gap-3">
        {/* Precision Geometric Monogram */}
        <div className="relative w-9 h-9 rounded-xl bg-[var(--key-default)] border border-[var(--border-highlight)] flex items-center justify-center shadow-md overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
          <span className="font-mono font-black text-sm tracking-tighter text-[var(--accent-primary)] z-10">
            OC
          </span>
          <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-ping opacity-75" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono font-black text-base md:text-lg tracking-tight text-[var(--text-primary)]">
              OmniCalc <span className="text-[var(--accent-primary)] font-black">Pro</span>
            </h1>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--key-function)] text-[var(--accent-primary)] border border-[var(--border-color)] font-semibold tracking-wider">
              PRECISION
            </span>
          </div>
          <p className="text-[11px] font-mono text-[var(--text-muted)] hidden sm:block">
            Scientific • Programmer • Metrology • Financial • 2D Plotter
          </p>
        </div>
      </div>

      {/* Control Actions & Workstation Controls */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Keyboard Shortcuts Trigger */}
        <button
          onClick={onOpenShortcuts}
          title="Keyboard Hotkeys (Press ? or Shift+/)"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[var(--key-function)] hover:bg-[var(--key-function-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] transition-colors text-xs font-mono"
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span className="hidden md:inline text-[10px] opacity-75">Hotkeys</span>
          <kbd className="hidden lg:inline-block text-[9px] px-1 py-0.2 rounded bg-black/30 border border-white/10 text-[var(--text-muted)]">
            ?
          </kbd>
        </button>

        {/* Audio Click Feedback Toggle */}
        <button
          onClick={toggleSound}
          title={soundEnabled ? 'Mute Keypad Mechanical Audio' : 'Enable Keypad Mechanical Audio'}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-colors ${
            soundEnabled
              ? 'bg-[var(--key-function)] text-[var(--accent-primary)] border-[var(--border-highlight)] shadow-sm'
              : 'bg-[var(--key-function)] text-[var(--text-muted)] border-[var(--border-color)] opacity-60 hover:opacity-100'
          }`}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[10px]">Click ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[10px]">Click OFF</span>
            </>
          )}
        </button>

        {/* Theme Persona Selector */}
        <div className="relative">
          <button
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            title="Switch Aesthetic Theme Persona"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--key-function)] hover:bg-[var(--key-function-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] transition-colors text-xs font-mono"
          >
            <Palette className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span className="hidden md:inline text-[11px] font-medium">Theme</span>
          </button>

          {themeDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setThemeDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-highlight)] shadow-2xl p-2 z-40 space-y-1.5 hardware-chassis">
                <div className="px-3 py-1.5 text-[10px] font-mono font-bold tracking-widest uppercase text-[var(--text-muted)] border-b border-[var(--border-color)]">
                  Instrument Aesthetic Design
                </div>
                {availableThemes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors ${
                      theme === t.id
                        ? 'bg-[var(--key-operator)] border border-[var(--accent-primary)]/40'
                        : 'hover:bg-[var(--key-function-hover)]'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full mt-0.5 shrink-0 border border-white/20 shadow-sm"
                      style={{ backgroundColor: t.previewColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-[var(--text-primary)]">
                          {t.label}
                        </span>
                        {theme === t.id && (
                          <Check className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5">
                        {t.tagline}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* History Tape Drawer Button */}
        <button
          onClick={toggleDrawer}
          title="Open Paper Tape / History (Alt+H)"
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--key-default)] hover:bg-[var(--key-default-hover)] text-[var(--text-primary)] border border-[var(--border-highlight)] transition-colors font-mono text-xs shadow-sm keycap-3d"
        >
          <History className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          <span className="hidden sm:inline font-semibold">Tape</span>
          {history.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[var(--accent-primary)] text-[var(--accent-text)] text-[9px] font-bold">
              {history.length > 99 ? '99+' : history.length}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
