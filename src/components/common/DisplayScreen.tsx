import React, { useRef, useEffect } from 'react';
import { Copy, ChevronLeft, ChevronRight, RotateCcw, AlertCircle, Check } from 'lucide-react';
import { copyTextToClipboard } from '../../utils/exportHelper';
import { useToast } from '../../context/ToastContext';
import { AngleUnit } from '../../types/calculator';

interface DisplayScreenProps {
  expression: string;
  cursorPosition: number;
  previewResult?: string;
  finalResult?: string;
  error?: string | null;
  angleUnit?: AngleUnit;
  onToggleAngleUnit?: () => void;
  hasMemory?: boolean;
  onCursorMove: (newPosition: number) => void;
  onClear: () => void;
  onBackspace: () => void;
}

export const DisplayScreen: React.FC<DisplayScreenProps> = ({
  expression,
  cursorPosition,
  previewResult,
  finalResult,
  error,
  angleUnit,
  onToggleAngleUnit,
  hasMemory = false,
  onCursorMove,
  onClear,
  onBackspace,
}) => {
  const { showToast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  // Auto-scroll expression to cursor position
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [expression, cursorPosition]);

  const handleCopy = async () => {
    const textToCopy = finalResult || previewResult || expression || '0';
    const success = await copyTextToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      showToast(`Copied ${textToCopy}`, 'success');
      setTimeout(() => setCopied(false), 1600);
    } else {
      showToast('Failed to copy', 'error');
    }
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newPos = Math.round(ratio * expression.length);
    onCursorMove(newPos);
  };

  // Render expression with colored syntax tokens and interactive cursor
  const renderExpressionWithCursor = () => {
    if (!expression) {
      return (
        <span className="relative inline-flex items-center text-[var(--screen-subtext)] select-none">
          <span>0</span>
          <span className="inline-block w-0.5 h-6 bg-[var(--accent-primary)] animate-pulse ml-1" />
        </span>
      );
    }

    const before = expression.slice(0, cursorPosition);
    const after = expression.slice(cursorPosition);

    return (
      <span className="tracking-wide select-text">
        {formatExpressionTokens(before)}
        <span className="inline-block w-0.5 h-6 bg-[var(--accent-primary)] animate-pulse align-middle mx-0.5 shadow-sm shadow-[var(--accent-primary)]" />
        {formatExpressionTokens(after)}
      </span>
    );
  };

  // Syntax highlighting for operators and functions
  const formatExpressionTokens = (text: string) => {
    // Regex splits by operators and functions
    const parts = text.split(/([+\-×÷*/^%(),]|(?:sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|log|ln|sqrt|cbrt))/g);
    return parts.map((part, i) => {
      if (!part) return null;
      if (['+', '−', '-', '×', '*', '÷', '/', '^', '%'].includes(part)) {
        return (
          <span key={i} className="text-[var(--accent-primary)] font-semibold mx-0.5">
            {part}
          </span>
        );
      }
      if (['(', ')'].includes(part)) {
        return (
          <span key={i} className="text-[var(--text-muted)] font-normal">
            {part}
          </span>
        );
      }
      if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'log', 'ln', 'sqrt', 'cbrt'].includes(part)) {
        return (
          <span key={i} className="text-[var(--text-secondary)] font-semibold">
            {part}
          </span>
        );
      }
      return (
        <span key={i} className="text-[var(--screen-text)]">
          {part}
        </span>
      );
    });
  };

  // Calculate dynamic font size based on result length
  const displayResultText = finalResult || previewResult || (expression ? '' : '0');
  const getResultFontSize = () => {
    const len = displayResultText.length;
    if (len > 18) return 'text-xl md:text-2xl';
    if (len > 12) return 'text-2xl md:text-3xl';
    if (len > 8) return 'text-3xl md:text-4xl';
    return 'text-3xl md:text-5xl';
  };

  return (
    <div className="instrument-display relative flex flex-col justify-between w-full p-4 md:p-5 rounded-2xl overflow-hidden transition-all duration-200 min-h-[160px] md:min-h-[180px]">
      {/* Top Instrument Status Line */}
      <div className="flex items-center justify-between gap-2 text-xs font-mono text-[var(--screen-subtext)] pb-2.5 border-b border-[var(--border-color)]">
        {/* Hardware Status Indicators */}
        <div className="flex items-center gap-2">
          {angleUnit && onToggleAngleUnit && (
            <button
              type="button"
              onClick={onToggleAngleUnit}
              title="Click to toggle DEG / RAD mode"
              className="flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold tracking-wider transition-colors border bg-[var(--key-function)] hover:bg-[var(--key-function-hover)] text-[var(--accent-primary)] border-[var(--border-color)] shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
              <span>{angleUnit.toUpperCase()}</span>
            </button>
          )}

          {hasMemory && (
            <span
              title="Memory Register active (MS / M+)"
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30"
            >
              <span className="w-1 h-1 rounded-full bg-amber-400" />
              <span>MEM</span>
            </span>
          )}

          {error && (
            <span className="flex items-center gap-1 text-rose-400 font-sans text-xs bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/30">
              <AlertCircle className="w-3 h-3" />
              <span>{error}</span>
            </span>
          )}
        </div>

        {/* Tactile Tools */}
        <div className="flex items-center gap-1.5">
          {/* Cursor manual step buttons */}
          <div className="flex items-center bg-[var(--key-function)] rounded-lg p-0.5 border border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => onCursorMove(Math.max(0, cursorPosition - 1))}
              disabled={cursorPosition <= 0}
              className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-20 transition-colors"
              title="Move cursor left (←)"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <div className="w-[1px] h-3 bg-[var(--border-color)]" />
            <button
              type="button"
              onClick={() => onCursorMove(Math.min(expression.length, cursorPosition + 1))}
              disabled={cursorPosition >= expression.length}
              className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-20 transition-colors"
              title="Move cursor right (→)"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            title="Copy value to clipboard"
            className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--key-function)] hover:bg-[var(--key-function-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Expression Area (Interactive cursor navigation) */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className="my-2.5 overflow-x-auto whitespace-nowrap scrollbar-none font-mono text-lg md:text-xl text-[var(--text-secondary)] cursor-text py-1"
      >
        {renderExpressionWithCursor()}
      </div>

      {/* Primary Result Display with dynamic font sizing */}
      <div className="flex items-baseline justify-end gap-2 text-right pt-1 select-all">
        {finalResult ? (
          <div
            onClick={handleCopy}
            title="Click to copy result"
            className={`font-mono font-bold tracking-tight text-[var(--screen-text)] cursor-pointer hover:opacity-90 transition-opacity ${getResultFontSize()}`}
          >
            {finalResult}
          </div>
        ) : previewResult && previewResult !== expression && previewResult !== '0' ? (
          <div className="font-mono text-lg md:text-2xl text-[var(--screen-subtext)] font-medium flex items-center gap-2">
            <span className="opacity-50 text-sm font-sans">LIVE</span>
            <span className="text-[var(--accent-primary)] font-bold">=</span>
            <span className="text-[var(--screen-text)] opacity-85">{previewResult}</span>
          </div>
        ) : (
          <div className="font-mono text-3xl md:text-4xl text-[var(--screen-subtext)] opacity-40 font-light">
            0
          </div>
        )}
      </div>
    </div>
  );
};
