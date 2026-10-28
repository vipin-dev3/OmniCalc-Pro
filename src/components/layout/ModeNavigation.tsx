import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, Cpu, ArrowLeftRight, Landmark, LineChart } from 'lucide-react';
import { CalculatorMode } from '../../types/calculator';

interface ModeNavigationProps {
  currentMode: CalculatorMode;
  onModeChange: (mode: CalculatorMode) => void;
}

interface ModeItem {
  id: CalculatorMode;
  code: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hotkey: string;
}

const MODES: ModeItem[] = [
  { id: 'scientific', code: '01', label: 'Scientific', icon: Calculator, hotkey: 'Alt+1' },
  { id: 'programmer', code: '02', label: 'Programmer', icon: Cpu, hotkey: 'Alt+2' },
  { id: 'converter', code: '03', label: 'Metrology & FX', icon: ArrowLeftRight, hotkey: 'Alt+3' },
  { id: 'financial', code: '04', label: 'Financial & Growth', icon: Landmark, hotkey: 'Alt+4' },
  { id: 'graphing', code: '05', label: '2D Plotter', icon: LineChart, hotkey: 'Alt+5' },
];

export const ModeNavigation: React.FC<ModeNavigationProps> = ({ currentMode, onModeChange }) => {
  return (
    <nav className="w-full max-w-4xl mx-auto px-4 my-2">
      <div className="flex items-center justify-start sm:justify-center gap-1.5 p-1.5 rounded-2xl machined-dock overflow-x-auto scrollbar-none">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = currentMode === mode.id;

          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-semibold transition-all duration-150 whitespace-nowrap focus:outline-none ${
                isActive
                  ? 'text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeModeSelector"
                  className="absolute inset-0 rounded-xl bg-[var(--key-default)] border border-[var(--border-highlight)] shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                    isActive
                      ? 'bg-[var(--accent-primary)] text-[var(--accent-text)]'
                      : 'bg-black/30 text-[var(--text-muted)] border border-white/5'
                  }`}
                >
                  {mode.code}
                </span>
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[var(--accent-primary)]' : ''}`} />
                <span>{mode.label}</span>
                <span className="text-[9px] opacity-40 font-normal hidden lg:inline ml-0.5">
                  ({mode.hotkey.replace('Alt+', '⌥')})
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
