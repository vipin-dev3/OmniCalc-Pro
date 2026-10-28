import React, { useState, useEffect, useCallback } from 'react';
import { KeypadButton } from '../common/KeypadButton';
import { WordSize, BaseSystem } from '../../types/calculator';
import {
  WORD_SIZE_BITS,
  clampToWordSize,
  formatBases,
  parseFromBase,
  toggleBit,
  isBitSet,
  performBitwiseOp,
} from '../../utils/bitwiseHelper';
import { useHistory } from '../../context/HistoryContext';
import { useToast } from '../../context/ToastContext';
import { Copy, Delete, RotateCcw, Binary, Check } from 'lucide-react';
import { copyTextToClipboard } from '../../utils/exportHelper';

type PendingOp = 'AND' | 'OR' | 'XOR' | 'NAND' | 'NOR' | 'SHL' | 'SHR' | 'ROL' | 'ROR' | null;

export const ProgrammerMode: React.FC = () => {
  const { addHistory, recallTarget } = useHistory();
  const { showToast } = useToast();

  const [currentVal, setCurrentVal] = useState<bigint>(0n);
  const [wordSize, setWordSize] = useState<WordSize>('dword'); // Default 32-bit DWORD
  const [isSigned, setIsSigned] = useState<boolean>(false);
  const [activeBase, setActiveBase] = useState<BaseSystem>('HEX');

  // Input buffer string in current active base
  const [inputBuffer, setInputBuffer] = useState<string>('0');
  const [storedVal, setStoredVal] = useState<bigint | null>(null);
  const [pendingOp, setPendingOp] = useState<PendingOp>(null);
  const [copiedBase, setCopiedBase] = useState<string | null>(null);

  // Formatted representations
  const formatted = formatBases(currentVal, wordSize, isSigned);

  // Sync input buffer when currentVal changes externally
  const updateCurrentValue = useCallback(
    (newVal: bigint) => {
      const clamped = clampToWordSize(newVal, wordSize);
      setCurrentVal(clamped);
      const f = formatBases(clamped, wordSize, isSigned);
      if (activeBase === 'HEX') setInputBuffer(f.hex);
      else if (activeBase === 'DEC') setInputBuffer(f.dec);
      else if (activeBase === 'OCT') setInputBuffer(f.oct);
      else if (activeBase === 'BIN') setInputBuffer(f.bin);
    },
    [wordSize, isSigned, activeBase]
  );

  // Handle word size change
  const handleWordSizeChange = (newSize: WordSize) => {
    setWordSize(newSize);
    updateCurrentValue(currentVal);
  };

  // Handle active base switch
  const handleBaseSelect = (base: BaseSystem) => {
    setActiveBase(base);
    const f = formatBases(currentVal, wordSize, isSigned);
    if (base === 'HEX') setInputBuffer(f.hex);
    else if (base === 'DEC') setInputBuffer(f.dec);
    else if (base === 'OCT') setInputBuffer(f.oct);
    else if (base === 'BIN') setInputBuffer(f.bin);
  };

  // Handle digit / char entry
  const handleInputChar = (char: string) => {
    let nextStr = inputBuffer === '0' ? char : inputBuffer + char;
    const parsed = parseFromBase(nextStr, activeBase, wordSize);
    setCurrentVal(parsed);
    setInputBuffer(nextStr);
  };

  const handleBackspace = () => {
    if (inputBuffer.length <= 1) {
      setInputBuffer('0');
      setCurrentVal(0n);
    } else {
      const nextStr = inputBuffer.slice(0, -1);
      setInputBuffer(nextStr);
      const parsed = parseFromBase(nextStr, activeBase, wordSize);
      setCurrentVal(parsed);
    }
  };

  const handleClear = () => {
    setInputBuffer('0');
    setCurrentVal(0n);
    setStoredVal(null);
    setPendingOp(null);
  };

  // Set bitwise operation
  const handleOp = (op: PendingOp) => {
    if (op === null) return;
    setStoredVal(currentVal);
    setPendingOp(op);
    setInputBuffer('0');
  };

  // Execute pending bitwise operation
  const handleEquals = () => {
    if (pendingOp && storedVal !== null) {
      const result = performBitwiseOp(pendingOp, storedVal, currentVal, wordSize);
      updateCurrentValue(result);
      addHistory(`${storedVal} ${pendingOp} ${currentVal}`, result.toString(), 'programmer');
      setStoredVal(null);
      setPendingOp(null);
    }
  };

  // Bit toggle
  const handleBitToggle = (bitIndex: number) => {
    const nextVal = toggleBit(currentVal, bitIndex, wordSize);
    updateCurrentValue(nextVal);
  };

  // Invert NOT
  const handleNot = () => {
    const bits = WORD_SIZE_BITS[wordSize];
    const mask = (1n << BigInt(bits)) - 1n;
    const nextVal = (~currentVal) & mask;
    updateCurrentValue(nextVal);
    addHistory(`NOT ${currentVal}`, nextVal.toString(), 'programmer');
  };

  const handleCopy = async (text: string, base: string) => {
    const success = await copyTextToClipboard(text);
    if (success) {
      setCopiedBase(base);
      showToast(`Copied ${base} (${text})`, 'success');
      setTimeout(() => setCopiedBase(null), 1500);
    }
  };

  // Quick ASCII preview for integer
  const getAsciiPreview = () => {
    try {
      const num = Number(currentVal);
      if (num >= 32 && num <= 126) {
        return `ASCII: "${String.fromCharCode(num)}"`;
      }
      if (num === 0) return 'ASCII: NULL';
      if (num < 32) return 'ASCII: CTRL';
      return `0x${currentVal.toString(16).toUpperCase()}`;
    } catch {
      return '';
    }
  };

  // Keyboard shortcut listener for Programmer Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

      const key = e.key.toUpperCase();
      const validHex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

      if (validHex.includes(key)) {
        if (activeBase === 'HEX') handleInputChar(key);
        else if (activeBase === 'DEC' && key <= '9') handleInputChar(key);
        else if (activeBase === 'OCT' && key <= '7') handleInputChar(key);
        else if (activeBase === 'BIN' && (key === '0' || key === '1')) handleInputChar(key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeBase, currentVal, inputBuffer]);

  // Check if digit button should be enabled in active base
  const isDigitEnabled = (char: string) => {
    if (activeBase === 'HEX') return true;
    if (activeBase === 'DEC') return char <= '9';
    if (activeBase === 'OCT') return char <= '7';
    if (activeBase === 'BIN') return char === '0' || char === '1';
    return false;
  };

  const totalBits = WORD_SIZE_BITS[wordSize];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 flex flex-col gap-3 font-mono">
      {/* Outer Hardware Chassis */}
      <div className="hardware-chassis p-4 md:p-6 rounded-3xl space-y-4">
        {/* Top Multi-Base Multi-Register Display */}
        <div className="instrument-display p-4 md:p-5 rounded-2xl space-y-3">
          {/* Architecture Register Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[var(--border-color)] text-xs">
            {/* Word Size Radios */}
            <div className="flex items-center gap-1">
              {(['qword', 'dword', 'word', 'byte'] as WordSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => handleWordSizeChange(size)}
                  className={`px-2.5 py-1 rounded-md uppercase font-bold text-[10px] tracking-wider transition-colors border shadow-sm ${
                    wordSize === size
                      ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] border-[var(--accent-primary)]'
                      : 'bg-[var(--chip-bg)] text-[var(--chip-text)] hover:text-[var(--text-primary)] border-[var(--border-color)]'
                  }`}
                >
                  {size} ({WORD_SIZE_BITS[size]})
                </button>
              ))}
            </div>

            {/* Signed / Unsigned Toggle & ASCII Preview */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--accent-primary)] font-bold px-2 py-0.5 rounded bg-black/15 dark:bg-black/40 border border-black/10 dark:border-white/5">
                {getAsciiPreview()}
              </span>

              <button
                onClick={() => setIsSigned(!isSigned)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider transition-colors border shadow-sm ${
                  isSigned
                    ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] border-[var(--accent-primary)]'
                    : 'bg-[var(--chip-bg)] text-[var(--chip-text)] border-[var(--border-color)] hover:text-[var(--text-primary)]'
                }`}
              >
                {isSigned ? 'SIGNED (2s-C)' : 'UNSIGNED'}
              </button>
            </div>
          </div>

          {/* Simultaneous Register Readouts */}
          <div className="space-y-1.5 pt-1">
            {(
              [
                { id: 'HEX', label: 'HEX', val: formatted.hex, prefix: '0x' },
                { id: 'DEC', label: 'DEC', val: formatted.dec, prefix: '' },
                { id: 'OCT', label: 'OCT', val: formatted.oct, prefix: '0o' },
                { id: 'BIN', label: 'BIN', val: formatted.bin, prefix: '0b' },
              ] as const
            ).map((item) => (
              <div
                key={item.id}
                onClick={() => handleBaseSelect(item.id)}
                className={`flex items-center justify-between p-2 md:p-2.5 rounded-xl cursor-pointer transition-all border ${
                  activeBase === item.id
                    ? 'bg-[var(--key-operator)] border-[var(--accent-primary)]/50 shadow-inner'
                    : 'bg-[var(--key-function)] border-transparent hover:border-[var(--border-color)]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`text-[10px] font-bold w-10 py-0.5 rounded text-center shrink-0 border ${
                      activeBase === item.id
                        ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] border-[var(--accent-primary)]'
                        : 'bg-[var(--key-default)] text-[var(--text-muted)] border-[var(--border-color)]'
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="text-sm md:text-base text-[var(--screen-text)] font-semibold tracking-wider truncate">
                    {item.id === 'BIN'
                      ? item.val.match(/.{1,4}/g)?.join(' ') || item.val
                      : item.val}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(item.val, item.label);
                  }}
                  title={`Copy ${item.label} value`}
                  className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0"
                >
                  {copiedBase === item.label ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tactile Bit-Grid Field Visualizer */}
        <div className="p-3 md:p-4 rounded-2xl bg-[var(--dock-bg)] border border-[var(--border-color)] space-y-2.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-bold text-[var(--accent-primary)] tracking-wider text-[11px]">
              BIT FIELD MATRIX ({totalBits}-BIT REG)
            </span>
            <div className="flex items-center gap-2 text-[10px] font-bold">
              <button
                onClick={() => updateCurrentValue(0n)}
                className="hover:text-[var(--text-primary)] transition-colors"
              >
                CLR
              </button>
              <span>•</span>
              <button
                onClick={() => handleNot()}
                className="hover:text-[var(--text-primary)] transition-colors"
              >
                INV (NOT)
              </button>
              <span>•</span>
              <button
                onClick={() => updateCurrentValue((1n << BigInt(totalBits)) - 1n)}
                className="hover:text-[var(--text-primary)] transition-colors"
              >
                ALL 1s
              </button>
            </div>
          </div>

          {/* Grouped Bit Nibbles */}
          <div className="flex flex-col gap-1.5 pt-0.5">
            {Array.from({ length: Math.ceil(totalBits / 16) }).map((_, groupIdx) => {
              const highBit = totalBits - 1 - groupIdx * 16;
              const lowBit = Math.max(0, highBit - 15);

              return (
                <div key={groupIdx} className="flex flex-col gap-1 bg-black/5 dark:bg-black/25 p-2 rounded-xl border border-black/10 dark:border-white/5">
                  <div className="flex justify-between text-[9px] text-[var(--text-muted)] font-bold px-1">
                    <span>BIT {highBit}</span>
                    <span>BIT {lowBit}</span>
                  </div>
                  <div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-none py-0.5">
                    {Array.from({ length: highBit - lowBit + 1 }).map((_, i) => {
                      const bitIdx = highBit - i;
                      const isSet = isBitSet(currentVal, bitIdx);

                      return (
                        <button
                          key={bitIdx}
                          onClick={() => handleBitToggle(bitIdx)}
                          title={`Toggle Bit ${bitIdx} (Current: ${isSet ? '1' : '0'})`}
                          className={`w-6 h-7 rounded-lg flex flex-col items-center justify-center text-[11px] font-bold transition-all border shadow-sm ${
                            isSet
                              ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] border-[var(--accent-primary)]'
                              : 'bg-[var(--chip-bg)] text-[var(--chip-text)] border-[var(--border-color)] hover:border-[var(--border-highlight)]'
                          } ${bitIdx % 4 === 0 && bitIdx !== lowBit ? 'mr-1.5 border-r border-black/15 dark:border-white/10 pr-0.5' : ''}`}
                        >
                          {isSet ? '1' : '0'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Programmer Keypad */}
        <div className="grid grid-cols-6 gap-2">
          {/* Bitwise Ops Row 1 */}
          <KeypadButton label="AND" variant="function" onClick={() => handleOp('AND')} />
          <KeypadButton label="OR" variant="function" onClick={() => handleOp('OR')} />
          <KeypadButton label="XOR" variant="function" onClick={() => handleOp('XOR')} />
          <KeypadButton label="NOT" variant="function" onClick={handleNot} />
          <KeypadButton label="NAND" variant="function" onClick={() => handleOp('NAND')} />
          <KeypadButton label="NOR" variant="function" onClick={() => handleOp('NOR')} />

          {/* Shifts & Hex A-B */}
          <KeypadButton label="<<" variant="function" subLabel="SHL" onClick={() => handleOp('SHL')} />
          <KeypadButton label=">>" variant="function" subLabel="SHR" onClick={() => handleOp('SHR')} />
          <KeypadButton label="ROL" variant="function" onClick={() => handleOp('ROL')} />
          <KeypadButton label="ROR" variant="function" onClick={() => handleOp('ROR')} />
          <KeypadButton
            label="A"
            variant="function"
            disabled={!isDigitEnabled('A')}
            onClick={() => handleInputChar('A')}
          />
          <KeypadButton
            label="B"
            variant="function"
            disabled={!isDigitEnabled('B')}
            onClick={() => handleInputChar('B')}
          />

          {/* Row 3 */}
          <KeypadButton
            label="C"
            variant="function"
            disabled={!isDigitEnabled('C')}
            onClick={() => handleInputChar('C')}
          />
          <KeypadButton
            label="D"
            variant="function"
            disabled={!isDigitEnabled('D')}
            onClick={() => handleInputChar('D')}
          />
          <KeypadButton
            label="7"
            variant="default"
            disabled={!isDigitEnabled('7')}
            onClick={() => handleInputChar('7')}
          />
          <KeypadButton
            label="8"
            variant="default"
            disabled={!isDigitEnabled('8')}
            onClick={() => handleInputChar('8')}
          />
          <KeypadButton
            label="9"
            variant="default"
            disabled={!isDigitEnabled('9')}
            onClick={() => handleInputChar('9')}
          />
          <KeypadButton label="AC" variant="danger" onClick={handleClear} />

          {/* Row 4 */}
          <KeypadButton
            label="E"
            variant="function"
            disabled={!isDigitEnabled('E')}
            onClick={() => handleInputChar('E')}
          />
          <KeypadButton
            label="F"
            variant="function"
            disabled={!isDigitEnabled('F')}
            onClick={() => handleInputChar('F')}
          />
          <KeypadButton
            label="4"
            variant="default"
            disabled={!isDigitEnabled('4')}
            onClick={() => handleInputChar('4')}
          />
          <KeypadButton
            label="5"
            variant="default"
            disabled={!isDigitEnabled('5')}
            onClick={() => handleInputChar('5')}
          />
          <KeypadButton
            label="6"
            variant="default"
            disabled={!isDigitEnabled('6')}
            onClick={() => handleInputChar('6')}
          />
          <KeypadButton
            label={<Delete className="w-4 h-4 md:w-5 md:h-5" />}
            variant="function"
            onClick={handleBackspace}
          />

          {/* Row 5 */}
          <KeypadButton
            label="0"
            variant="default"
            disabled={!isDigitEnabled('0')}
            className="col-span-2"
            onClick={() => handleInputChar('0')}
          />
          <KeypadButton
            label="1"
            variant="default"
            disabled={!isDigitEnabled('1')}
            onClick={() => handleInputChar('1')}
          />
          <KeypadButton
            label="2"
            variant="default"
            disabled={!isDigitEnabled('2')}
            onClick={() => handleInputChar('2')}
          />
          <KeypadButton
            label="3"
            variant="default"
            disabled={!isDigitEnabled('3')}
            onClick={() => handleInputChar('3')}
          />
          <KeypadButton
            label="="
            variant="action"
            className="font-bold text-xl"
            onClick={handleEquals}
          />
        </div>
      </div>
    </div>
  );
};
