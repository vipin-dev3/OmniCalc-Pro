import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Download, Search, FileSpreadsheet, FileCode, History as HistoryIcon, ScrollText } from 'lucide-react';
import { useHistory } from '../../context/HistoryContext';
import { HistoryItem } from './HistoryItem';
import { exportHistoryAsCSV, exportHistoryAsJSON } from '../../utils/exportHelper';
import { useToast } from '../../context/ToastContext';
import { CalculatorMode } from '../../types/calculator';

export const HistoryDrawer: React.FC = () => {
  const { history, isDrawerOpen, setIsDrawerOpen, clearHistory, removeHistoryItem, recallToCurrent } = useHistory();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | CalculatorMode>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.expression.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.result.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || item.mode === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleExportCSV = () => {
    if (!history.length) {
      showToast('No history to export', 'info');
      return;
    }
    exportHistoryAsCSV(filteredHistory.length ? filteredHistory : history);
    showToast('Exported calculation tape as CSV', 'success');
  };

  const handleExportJSON = () => {
    if (!history.length) {
      showToast('No history to export', 'info');
      return;
    }
    exportHistoryAsJSON(filteredHistory.length ? filteredHistory : history);
    showToast('Exported calculation tape as JSON', 'success');
  };

  const handleClear = () => {
    clearHistory();
    setShowClearConfirm(false);
    showToast('Paper tape cleared', 'info');
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer Sidebar */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-[var(--bg-card)] border-l border-[var(--border-highlight)] shadow-2xl flex flex-col font-mono"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-header)]">
              <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-sm">
                <ScrollText className="w-4 h-4 text-[var(--accent-primary)]" />
                <span>CALCULATION TAPE</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--key-function)] text-[var(--accent-primary)] border border-[var(--border-color)]">
                  {history.length}
                </span>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search & Mode Filters */}
            <div className="p-3.5 space-y-2.5 border-b border-[var(--border-color)] bg-[var(--key-function)]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Filter calculations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-4 py-1.5 rounded-xl bg-[var(--key-default)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5 text-[10px]">
                {(['all', 'scientific', 'programmer', 'converter', 'financial'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedFilter(mode)}
                    className={`px-2.5 py-1 rounded-lg uppercase font-bold whitespace-nowrap transition-colors border ${
                      selectedFilter === mode
                        ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] border-[var(--accent-primary)]'
                        : 'bg-[var(--key-default)] text-[var(--text-muted)] border-[var(--border-color)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Tape History Item List */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
              {filteredHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-[var(--text-muted)] text-center text-xs space-y-2">
                  <ScrollText className="w-8 h-8 opacity-30" />
                  <p>Paper tape is empty</p>
                  <p className="text-[10px] opacity-60">Calculations will print here automatically</p>
                </div>
              ) : (
                filteredHistory.map((item) => (
                  <HistoryItem
                    key={item.id}
                    item={item}
                    onRecall={(text) => {
                      recallToCurrent(text);
                      setIsDrawerOpen(false);
                      showToast(`Recalled: ${text}`, 'info');
                    }}
                    onDelete={removeHistoryItem}
                  />
                ))
              )}
            </div>

            {/* Drawer Bottom Actions: Clear & Export */}
            <div className="p-3.5 border-t border-[var(--border-color)] bg-[var(--bg-header)] flex items-center justify-between gap-2">
              {showClearConfirm ? (
                <div className="flex items-center gap-1.5 w-full">
                  <span className="text-[10px] text-rose-400">Clear all?</span>
                  <button
                    onClick={handleClear}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2 py-1 rounded-lg bg-[var(--key-default)] text-[var(--text-secondary)] text-[10px]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    disabled={!history.length}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--key-danger)] text-[var(--key-danger-text)] border border-[var(--key-danger-border)] hover:brightness-110 disabled:opacity-30 text-xs font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Tape</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleExportCSV}
                      disabled={!history.length}
                      title="Export CSV"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[var(--key-function)] hover:bg-[var(--key-function-hover)] text-[var(--text-secondary)] border border-[var(--border-color)] disabled:opacity-30 text-xs"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>CSV</span>
                    </button>
                    <button
                      onClick={handleExportJSON}
                      disabled={!history.length}
                      title="Export JSON"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[var(--key-function)] hover:bg-[var(--key-function-hover)] text-[var(--text-secondary)] border border-[var(--border-color)] disabled:opacity-30 text-xs"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>JSON</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
