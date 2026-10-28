import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'Navigation & Workspace',
      items: [
        { keys: ['Alt', '1 - 5'], desc: 'Switch Calculator Mode (Sci, Prog, Conv, Fin, Graph)' },
        { keys: ['Alt', 'H'], desc: 'Toggle Calculation Paper Tape' },
        { keys: ['?'], desc: 'Open this Reference Sheet' },
      ],
    },
    {
      title: 'Calculator Pad & Input',
      items: [
        { keys: ['0 - 9', '.'], desc: 'Number & Decimal Input' },
        { keys: ['+', '-', '*', '/'], desc: 'Basic Arithmetic (+, −, ×, ÷)' },
        { keys: ['^'], desc: 'Power / Exponentiation ($x^y$)' },
        { keys: ['(', ')'], desc: 'Parentheses' },
        { keys: ['Enter', '='], desc: 'Calculate / Evaluate Expression' },
        { keys: ['Backspace'], desc: 'Delete Character Before Cursor' },
        { keys: ['Escape'], desc: 'Clear All (AC)' },
        { keys: ['←', '→'], desc: 'Move Input Cursor Left / Right' },
      ],
    },
    {
      title: 'Programmer Mode',
      items: [
        { keys: ['A - F'], desc: 'Hexadecimal Digits (Active in HEX base)' },
        { keys: ['Enter'], desc: 'Execute Pending Bitwise Operation' },
      ],
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-mono">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.16 }}
          className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-highlight)] rounded-3xl p-6 shadow-2xl z-10 text-[var(--text-primary)] max-h-[85vh] overflow-y-auto hardware-chassis"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-[var(--accent-primary)]" />
              <h2 className="font-bold text-sm tracking-wider uppercase">
                Hardware Hotkey Reference
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-5 mt-4">
            {shortcutGroups.map((group, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)]">
                  {group.title}
                </h3>
                <div className="space-y-1.5">
                  {group.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-[var(--key-function)] border border-[var(--border-color)]"
                    >
                      <span className="text-[var(--text-secondary)]">{item.desc}</span>
                      <div className="flex items-center gap-1">
                        {item.keys.map((k, ki) => (
                          <kbd
                            key={ki}
                            className="px-2 py-0.5 rounded-md bg-[var(--key-default)] border border-[var(--border-color)] font-mono text-[10px] text-[var(--text-primary)] font-bold shadow-sm"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-3 border-t border-[var(--border-color)] flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-[var(--key-action)] text-[var(--key-action-text)] font-bold text-xs shadow-md"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
