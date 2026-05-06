import React from 'react';

export const FullscreenLoader: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
      <span className="text-sm font-semibold">Loading Time Tracker</span>
    </div>
  </div>
);

export const SectionLoader: React.FC = () => (
  <div className="flex h-full min-h-[240px] items-center justify-center text-slate-400 dark:text-slate-500">
    <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
  </div>
);

export const OverlayLoader: React.FC = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
    <div className="flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 shadow-xl dark:bg-slate-900/90">
      <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Loading</span>
    </div>
  </div>
);
