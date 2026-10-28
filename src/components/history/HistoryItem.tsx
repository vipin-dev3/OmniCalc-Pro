import React from 'react';
import { HistoryItem as HistoryItemType } from '../../types/calculator';
import { formatTimestamp } from '../../utils/formatters';
import { Copy, CornerDownLeft, Trash2, Check } from 'lucide-react';
import { copyTextToClipboard } from '../../utils/exportHelper';
import { useToast } from '../../context/ToastContext';

interface HistoryItemProps {
  item: HistoryItemType;
  onRecall: (text: string) => void;
  onDelete: (id: string) => void;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ item, onRecall, onDelete }) => {
  const { showToast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyTextToClipboard(text);
    if (success) {
      setCopied(true);
      showToast('Copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="group relative p-3 rounded-xl bg-[var(--key-default)] hover:bg-[var(--key-default-hover)] border border-[var(--border-color)] transition-all font-mono">
      <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] mb-1.5">
        <span className="px-1.5 py-0.2 rounded uppercase font-bold tracking-wider bg-[var(--key-function)] text-[var(--accent-primary)] border border-[var(--border-color)]">
          {item.mode}
        </span>
        <div className="flex items-center gap-2">
          <span>{formatTimestamp(item.timestamp)}</span>
          <button
            onClick={() => onDelete(item.id)}
            title="Delete from tape"
            className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 transition-opacity"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Expression (Click to recall) */}
      <button
        onClick={() => onRecall(item.expression)}
        title="Recall expression to input"
        className="w-full text-left text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] truncate transition-colors py-0.5"
      >
        {item.expression}
      </button>

      {/* Result (Click to recall result) */}
      <div className="flex items-center justify-between mt-1 pt-1 border-t border-[var(--border-color)]">
        <button
          onClick={() => onRecall(item.result)}
          title="Recall result into calculator"
          className="text-sm font-bold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors text-left flex items-center gap-1.5"
        >
          <span>= {item.result}</span>
          <CornerDownLeft className="w-3 h-3 opacity-0 group-hover:opacity-75 text-[var(--accent-primary)]" />
        </button>

        <button
          onClick={(e) => handleCopy(item.result, e)}
          title="Copy result"
          className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
};
