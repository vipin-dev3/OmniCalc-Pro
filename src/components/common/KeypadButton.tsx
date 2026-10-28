import React from 'react';
import { motion } from 'framer-motion';
import { useSound } from '../../context/SoundContext';

export type ButtonVariant = 'default' | 'operator' | 'function' | 'action' | 'danger' | 'ghost';

interface KeypadButtonProps {
  label: React.ReactNode;
  subLabel?: string;
  secondaryLabel?: string;
  badge?: string;
  hotkey?: string;
  variant?: ButtonVariant;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  isActive?: boolean;
}

export const KeypadButton: React.FC<KeypadButtonProps> = ({
  label,
  subLabel,
  secondaryLabel,
  badge,
  hotkey,
  variant = 'default',
  onClick,
  disabled = false,
  className = '',
  isActive = false,
}) => {
  const { playClick, playSuccess } = useSound();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (variant === 'action') {
      playSuccess();
    } else {
      playClick();
    }
    onClick();
  };

  // Compute inline or CSS variable styles for tactile keycap rendering
  const getVariantClasses = () => {
    if (isActive) {
      return 'bg-[var(--accent-primary)] text-[var(--accent-text)] border-[var(--accent-hover)] font-bold shadow-md';
    }

    switch (variant) {
      case 'action':
        return 'bg-[var(--key-action)] text-[var(--key-action-text)] border-[var(--key-action-border)] font-bold tracking-tight shadow-md';
      case 'operator':
        return 'bg-[var(--key-operator)] text-[var(--key-operator-text)] border-[var(--key-operator-border)] font-semibold';
      case 'function':
        return 'bg-[var(--key-function)] text-[var(--key-function-text)] border-[var(--key-function-border)] font-medium text-xs md:text-sm';
      case 'danger':
        return 'bg-[var(--key-danger)] text-[var(--key-danger-text)] border-[var(--key-danger-border)] font-semibold';
      case 'ghost':
        return 'bg-transparent hover:bg-white/5 text-[var(--text-secondary)] border-transparent shadow-none';
      case 'default':
      default:
        return 'bg-[var(--key-default)] text-[var(--key-default-text)] border-[var(--key-default-border)] font-medium text-base md:text-lg';
    }
  };

  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.96 }}
      transition={{ duration: 0.05 }}
      onClick={handleClick}
      disabled={disabled}
      type="button"
      className={`keycap-3d group relative flex flex-col items-center justify-center min-h-[46px] md:min-h-[52px] p-2 rounded-xl select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] cursor-pointer ${
        disabled ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''
      } ${getVariantClasses()} ${className}`}
    >
      {/* Secondary engraved label (e.g. sin⁻¹ or 2nd function) */}
      {secondaryLabel && (
        <span className="text-[9px] md:text-[10px] font-mono leading-none tracking-tight opacity-75 text-[var(--accent-primary)] mb-0.5 select-none">
          {secondaryLabel}
        </span>
      )}

      {/* Badge in corner (e.g. base type or indicator) */}
      {badge && (
        <span className="absolute top-1 right-1.5 text-[8px] font-mono uppercase px-1 py-0.2 rounded bg-black/30 border border-white/10 text-[var(--text-secondary)]">
          {badge}
        </span>
      )}

      {/* Primary Key Label */}
      <div className="flex items-center justify-center gap-1 leading-tight">
        <span className="tracking-tight">{label}</span>
        {subLabel && (
          <span className="text-[9px] opacity-60 font-mono font-normal">
            {subLabel}
          </span>
        )}
      </div>

      {/* Subtle hotkey indicator */}
      {hotkey && (
        <span className="absolute bottom-1 right-1.5 text-[8px] font-mono text-[var(--text-muted)] opacity-0 group-hover:opacity-80 transition-opacity">
          {hotkey}
        </span>
      )}
    </motion.button>
  );
};
