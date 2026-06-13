import React from 'react';
import { LossReason } from '../store/useStore';

interface Props {
  isOpen: boolean;
  onSubmit: (reason: LossReason) => void;
  onClose: () => void;
}

const REASONS: LossReason[] = [
  'তাড়াহুড়া করে ট্রেড',
  'ট্রেন্ডের বিপরীতে ট্রেড',
  'ইমোশনাল ট্রেড',
  'FOMO',
  'মার্কেট খারাপ',
  'এনালাইসিস করিনি',
  'অন্যান্য'
];

export function LossReasonModal({ isOpen, onSubmit, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0b121e]/90 dark:backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.4)] animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">লসের কারণ চিহ্নিত করুন</h3>
          <button onClick={onClose} className="p-1 rounded-full text-secondary hover:text-red-500 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="p-4 grid grid-cols-1 gap-2">
          {REASONS.map((r, i) => (
            <button
              key={i}
              onClick={() => onSubmit(r)}
              className="w-full text-left px-4 py-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 rounded-xl font-medium text-slate-700 dark:text-slate-200 transition-colors"
            >
              • {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
