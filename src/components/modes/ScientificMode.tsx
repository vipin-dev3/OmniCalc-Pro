import React, { useState, useEffect, useCallback } from 'react';
import { DisplayScreen } from '../common/DisplayScreen';
import { KeypadButton } from '../common/KeypadButton';
import { evaluateExpression, formatNumber } from '../../utils/mathParser';
import { useHistory } from '../../context/HistoryContext';
import { useToast } from '../../context/ToastContext';
import { AngleUnit } from '../../types/calculator';
import { Delete, RotateCcw, Cpu } from 'lucide-react';

export const ScientificMode: React.FC = () => {
  const { addHistory, recallTarget } = useHistory();
  const { showToast } = useToast();

  const [expression, setExpression] = useState<string>('');
  const [cursorPos, setCursorPos] = useState<number>(0);
  const [finalResult, setFinalResult] = useState<string>('');
  const [previewResult, setPreviewResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [angleUnit, setAngleUnit] = useState<AngleUnit>('deg');
  const [isSecond, setIsSecond] = useState<boolean>(false);
  const [isHyperbolic, setIsHyperbolic] = useState<boolean>(false);
  const [memory, setMemory] = useState<number>(0);

  // Live evaluation preview
  useEffect(() => {
    if (!expression.trim()) {
      setPreviewResult('');
      setError(null);
      return;
    }

    const res = evaluateExpression(expression, angleUnit);
    if (res.success && res.value !== expression) {
      setPreviewResult(res.value);
      setError(null);
    } else {
      setPreviewResult('');
    }
  }, [expression, angleUnit]);

  // Handle recall from history drawer
  useEffect(() => {
    if (recallTarget) {
      setExpression(recallTarget.text);
      setCursorPos(recallTarget.text.length);
      setFinalResult('');
      setError(null);
    }
  }, [recallTarget]);

  // Insert string at current cursor position
  const insertText = useCallback((text: string) => {
    setExpression((prev) => {
      const before = prev.slice(0, cursorPos);
      const after = prev.slice(cursorPos);
      return before + text + after;
    });
    setCursorPos((prev) => prev + text.length);
    setFinalResult('');
    setError(null);
  }, [cursorPos]);

  // Delete character before cursor
  const handleBackspace = useCallback(() => {
    if (cursorPos === 0) return;
    setExpression((prev) => {
      const before = prev.slice(0, cursorPos - 1);
      const after = prev.slice(cursorPos);
      return before + after;
    });
    setCursorPos((prev) => Math.max(0, prev - 1));
    setFinalResult('');
    setError(null);
  }, [cursorPos]);

  // Clear all
  const handleClear = useCallback(() => {
    setExpression('');
    setCursorPos(0);
    setFinalResult('');
    setPreviewResult('');
    setError(null);
  }, []);

  // Evaluate calculation
  const handleCalculate = useCallback(() => {
    if (!expression.trim()) return;

    const res = evaluateExpression(expression, angleUnit);
    if (res.success) {
      setFinalResult(res.value);
      setError(null);
      addHistory(expression, res.value, 'scientific');
    } else {
      setError(res.error || 'Syntax error');
      setFinalResult('');
    }
  }, [expression, angleUnit, addHistory]);

  // Memory operations
  const handleMemory = (action: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => {
    const currentVal = Number(finalResult || previewResult || expression) || 0;
    switch (action) {
      case 'MC':
        setMemory(0);
        showToast('Memory Cleared (MC)', 'info');
        break;
      case 'MR':
        insertText(formatNumber(memory));
        showToast(`Memory Recalled: ${formatNumber(memory)}`, 'info');
        break;
      case 'MS':
        setMemory(currentVal);
        showToast(`Stored ${formatNumber(currentVal)} in Memory (MS)`, 'info');
        break;
      case 'M+':
        setMemory((prev) => prev + currentVal);
        showToast(`Added to Memory: ${formatNumber(memory + currentVal)}`, 'info');
        break;
      case 'M-':
        setMemory((prev) => prev - currentVal);
        showToast(`Subtracted from Memory: ${formatNumber(memory - currentVal)}`, 'info');
        break;
    }
  };

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key >= '0' && e.key <= '9') {
        insertText(e.key);
      } else if (['+', '-', '*', '/', '(', ')', '^', '%', '.'].includes(e.key)) {
        insertText(e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key === '-' ? '−' : e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCursorPos((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCursorPos((prev) => Math.min(expression.length, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [insertText, handleCalculate, handleBackspace, handleClear, expression.length]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 flex flex-col gap-3">
      {/* Outer Machined Chassis */}
      <div className="hardware-chassis p-4 md:p-6 rounded-3xl space-y-4">
        {/* Recessed Instrument Display Screen */}
        <DisplayScreen
          expression={expression}
          cursorPosition={cursorPos}
          previewResult={previewResult}
          finalResult={finalResult}
          error={error}
          angleUnit={angleUnit}
          onToggleAngleUnit={() => setAngleUnit((prev) => (prev === 'deg' ? 'rad' : 'deg'))}
          hasMemory={memory !== 0}
          onCursorMove={setCursorPos}
          onClear={handleClear}
          onBackspace={handleBackspace}
        />

        {/* Function Modifiers & Memory Register Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-[var(--dock-bg)] border border-[var(--dock-border)] text-xs font-mono">
          {/* Shift / Angle Modifiers */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsSecond(!isSecond)}
              className={`px-3 py-1 rounded-lg font-bold border transition-colors shadow-sm ${
                isSecond
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] border-[var(--accent-primary)]'
                  : 'bg-[var(--chip-bg)] text-[var(--chip-text)] hover:text-[var(--text-primary)] border-[var(--border-color)]'
              }`}
            >
              2nd
            </button>
            <button
              onClick={() => setIsHyperbolic(!isHyperbolic)}
              className={`px-3 py-1 rounded-lg font-bold border transition-colors shadow-sm ${
                isHyperbolic
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] border-[var(--accent-primary)]'
                  : 'bg-[var(--chip-bg)] text-[var(--chip-text)] hover:text-[var(--text-primary)] border-[var(--border-color)]'
              }`}
            >
              hyp
            </button>
            <button
              onClick={() => setAngleUnit((u) => (u === 'deg' ? 'rad' : 'deg'))}
              className="px-2.5 py-1 rounded-lg font-bold bg-[var(--chip-bg)] text-[var(--accent-primary)] border border-[var(--border-color)] shadow-sm"
            >
              {angleUnit.toUpperCase()}
            </button>
          </div>

          {/* Memory Register Bar */}
          <div className="flex items-center gap-1">
            <div className="hidden sm:flex items-center gap-1 mr-1 text-[10px] text-[var(--dock-item-text)] border-r border-[var(--border-color)] pr-2">
              <span className="font-semibold">REG</span>
              <span className="font-bold text-[var(--text-primary)]">
                {memory !== 0 ? formatNumber(memory) : '0'}
              </span>
            </div>
            <button
              onClick={() => handleMemory('MC')}
              disabled={memory === 0}
              className="px-2 py-0.5 rounded-lg bg-[var(--chip-bg)] hover:opacity-80 text-[var(--chip-text)] disabled:opacity-30 border border-[var(--border-color)] font-bold text-[11px]"
            >
              MC
            </button>
            <button
              onClick={() => handleMemory('MR')}
              disabled={memory === 0}
              className="px-2 py-0.5 rounded-lg bg-[var(--chip-bg)] hover:opacity-80 text-[var(--chip-text)] disabled:opacity-30 border border-[var(--border-color)] font-bold text-[11px]"
            >
              MR
            </button>
            <button
              onClick={() => handleMemory('M+')}
              className="px-2 py-0.5 rounded-lg bg-[var(--chip-bg)] hover:opacity-80 text-[var(--chip-text)] border border-[var(--border-color)] font-bold text-[11px]"
            >
              M+
            </button>
            <button
              onClick={() => handleMemory('M-')}
              className="px-2 py-0.5 rounded-lg bg-[var(--chip-bg)] hover:opacity-80 text-[var(--chip-text)] border border-[var(--border-color)] font-bold text-[11px]"
            >
              M-
            </button>
            <button
              onClick={() => handleMemory('MS')}
              className="px-2 py-0.5 rounded-lg bg-[var(--chip-bg)] hover:opacity-80 text-[var(--accent-primary)] border border-[var(--border-color)] font-bold text-[11px]"
            >
              MS
            </button>
          </div>
        </div>

        {/* Sculpted Scientific Keypad Grid */}
        <div className="grid grid-cols-5 md:grid-cols-7 gap-2 md:gap-2.5">
          {/* Row 1: Trigonometry & Clears */}
          <KeypadButton
            label={
              isHyperbolic
                ? isSecond ? 'asinh' : 'sinh'
                : isSecond ? 'asin' : 'sin'
            }
            secondaryLabel={!isSecond ? (isHyperbolic ? 'asinh' : 'sin⁻¹') : undefined}
            variant="function"
            onClick={() =>
              insertText(
                isHyperbolic
                  ? isSecond ? 'asinh(' : 'sinh('
                  : isSecond ? 'asin(' : 'sin('
              )
            }
          />
          <KeypadButton
            label={
              isHyperbolic
                ? isSecond ? 'acosh' : 'cosh'
                : isSecond ? 'acos' : 'cos'
            }
            secondaryLabel={!isSecond ? (isHyperbolic ? 'acosh' : 'cos⁻¹') : undefined}
            variant="function"
            onClick={() =>
              insertText(
                isHyperbolic
                  ? isSecond ? 'acosh(' : 'cosh('
                  : isSecond ? 'acos(' : 'cos('
              )
            }
          />
          <KeypadButton
            label={
              isHyperbolic
                ? isSecond ? 'atanh' : 'tanh'
                : isSecond ? 'atan' : 'tan'
            }
            secondaryLabel={!isSecond ? (isHyperbolic ? 'atanh' : 'tan⁻¹') : undefined}
            variant="function"
            onClick={() =>
              insertText(
                isHyperbolic
                  ? isSecond ? 'atanh(' : 'tanh('
                  : isSecond ? 'atan(' : 'tan('
              )
            }
          />
          <KeypadButton
            label={isSecond ? '10ˣ' : 'log₁₀'}
            secondaryLabel={!isSecond ? '10ˣ' : undefined}
            variant="function"
            onClick={() => insertText(isSecond ? '10^(' : 'log10(')}
          />
          <KeypadButton
            label={isSecond ? 'eˣ' : 'ln'}
            secondaryLabel={!isSecond ? 'eˣ' : undefined}
            variant="function"
            onClick={() => insertText(isSecond ? 'e^(' : 'ln(')}
          />
          <KeypadButton
            label="AC"
            variant="danger"
            hotkey="Esc"
            onClick={handleClear}
          />
          <KeypadButton
            label={<Delete className="w-4 h-4 md:w-5 md:h-5" />}
            variant="function"
            hotkey="⌫"
            onClick={handleBackspace}
          />

          {/* Row 2: Powers, Roots, Factorial, Division */}
          <KeypadButton
            label={isSecond ? 'x³' : 'x²'}
            secondaryLabel={!isSecond ? 'x³' : undefined}
            variant="function"
            onClick={() => insertText(isSecond ? '^3' : '^2')}
          />
          <KeypadButton
            label={isSecond ? '³√x' : '√x'}
            secondaryLabel={!isSecond ? '³√x' : undefined}
            variant="function"
            onClick={() => insertText(isSecond ? 'cbrt(' : 'sqrt(')}
          />
          <KeypadButton
            label="xʸ"
            secondaryLabel="y√x"
            variant="function"
            hotkey="^"
            onClick={() => insertText('^(')}
          />
          <KeypadButton
            label="n!"
            variant="function"
            onClick={() => insertText('!')}
          />
          <KeypadButton
            label="("
            variant="function"
            hotkey="("
            onClick={() => insertText('(')}
          />
          <KeypadButton
            label=")"
            variant="function"
            hotkey=")"
            onClick={() => insertText(')')}
          />
          <KeypadButton
            label="÷"
            variant="operator"
            hotkey="/"
            onClick={() => insertText('÷')}
          />

          {/* Row 3: Constants & 7-8-9 & Multiply */}
          <KeypadButton
            label="π"
            variant="function"
            subLabel="3.141"
            onClick={() => insertText('pi')}
          />
          <KeypadButton
            label="e"
            variant="function"
            subLabel="2.718"
            onClick={() => insertText('e')}
          />
          <KeypadButton
            label="ϕ"
            variant="function"
            subLabel="1.618"
            onClick={() => insertText('phi')}
          />
          <KeypadButton
            label="7"
            variant="default"
            hotkey="7"
            onClick={() => insertText('7')}
          />
          <KeypadButton
            label="8"
            variant="default"
            hotkey="8"
            onClick={() => insertText('8')}
          />
          <KeypadButton
            label="9"
            variant="default"
            hotkey="9"
            onClick={() => insertText('9')}
          />
          <KeypadButton
            label="×"
            variant="operator"
            hotkey="*"
            onClick={() => insertText('×')}
          />

          {/* Row 4: Modulo, Inversion & 4-5-6 & Minus */}
          <KeypadButton
            label="|x|"
            variant="function"
            onClick={() => insertText('abs(')}
          />
          <KeypadButton
            label="mod"
            variant="function"
            onClick={() => insertText(' mod ')}
          />
          <KeypadButton
            label="1/x"
            variant="function"
            onClick={() => insertText('1/(')}
          />
          <KeypadButton
            label="4"
            variant="default"
            hotkey="4"
            onClick={() => insertText('4')}
          />
          <KeypadButton
            label="5"
            variant="default"
            hotkey="5"
            onClick={() => insertText('5')}
          />
          <KeypadButton
            label="6"
            variant="default"
            hotkey="6"
            onClick={() => insertText('6')}
          />
          <KeypadButton
            label="−"
            variant="operator"
            hotkey="-"
            onClick={() => insertText('−')}
          />

          {/* Row 5: Log2, Percent & 1-2-3 & Plus */}
          <KeypadButton
            label="log₂"
            variant="function"
            onClick={() => insertText('log2(')}
          />
          <KeypadButton
            label="%"
            variant="function"
            hotkey="%"
            onClick={() => insertText('%')}
          />
          <KeypadButton
            label="EXP"
            variant="function"
            onClick={() => insertText('e+')}
          />
          <KeypadButton
            label="1"
            variant="default"
            hotkey="1"
            onClick={() => insertText('1')}
          />
          <KeypadButton
            label="2"
            variant="default"
            hotkey="2"
            onClick={() => insertText('2')}
          />
          <KeypadButton
            label="3"
            variant="default"
            hotkey="3"
            onClick={() => insertText('3')}
          />
          <KeypadButton
            label="+"
            variant="operator"
            hotkey="+"
            onClick={() => insertText('+')}
          />

          {/* Row 6: Sign, Random, ANS, 0, Decimal, Equals */}
          <KeypadButton
            label="±"
            variant="function"
            onClick={() => {
              if (expression.startsWith('-(') && expression.endsWith(')')) {
                setExpression(expression.slice(2, -1));
              } else {
                setExpression(`-(${expression})`);
              }
            }}
          />
          <KeypadButton
            label="rnd"
            variant="function"
            onClick={() => insertText(Math.random().toFixed(4))}
          />
          <KeypadButton
            label="ANS"
            variant="function"
            onClick={() => {
              if (finalResult) insertText(finalResult);
            }}
          />
          <KeypadButton
            label="0"
            variant="default"
            hotkey="0"
            onClick={() => insertText('0')}
          />
          <KeypadButton
            label="."
            variant="default"
            hotkey="."
            onClick={() => insertText('.')}
          />
          <KeypadButton
            label="="
            variant="action"
            hotkey="Enter"
            className="col-span-2 text-xl md:text-2xl font-bold"
            onClick={handleCalculate}
          />
        </div>
      </div>
    </div>
  );
};
