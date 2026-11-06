import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, X, ShoppingBag } from 'lucide-react';

interface StoreViewerProps {
  url: string;
  title?: string;
  onClose: () => void;
  isUrdu?: boolean;
}

const SLOW_LOAD_MS = 12000;

/** Branded loading screen: store-style skeleton cards + lines. */
const StoreLoader: React.FC<{ isUrdu: boolean; slow: boolean; onOpenExternal: () => void }> = ({
  isUrdu,
  slow,
  onOpenExternal
}) => (
  <div className="absolute inset-0 z-10 bg-[#07080c] flex flex-col overflow-hidden">
    {/* Brand block */}
    <div className="flex flex-col items-center pt-10 pb-5 px-6 relative">
      <div
        className="absolute top-6 w-40 h-40 rounded-full bg-amber-400/20 blur-3xl pointer-events-none"
        style={{ animation: 'kc-glow 2.4s ease-in-out infinite' }}
      />
      <div
        className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-500/30"
        style={{ animation: 'kc-bag 1.8s ease-in-out infinite' }}
      >
        <ShoppingBag className="w-10 h-10 text-slate-950" strokeWidth={2.4} />
      </div>
      <h2 className="mt-4 text-xl font-black tracking-tight text-white">
        Khanewal <span className="text-amber-400">Connect</span>
      </h2>
      <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400 mt-1">
        Online Store
      </p>

      {/* Indeterminate progress bar */}
      <div className="relative mt-5 w-48 h-1 rounded-full bg-slate-800 overflow-hidden">
        <span className="kc-bar" />
      </div>
      <p className="mt-3 text-xs text-slate-400">
        {isUrdu ? 'Store load ho raha hai, thora intezar karein…' : 'Loading store, please wait…'}
      </p>
    </div>

    {/* Skeleton: search bar, category chips, product grid */}
    <div className="flex-1 min-h-0 px-4 space-y-4 overflow-hidden">
      <div className="kc-skel h-10 w-full rounded-xl" />

      <div className="flex gap-2">
        {[64, 80, 56, 72, 60].map((w, i) => (
          <div key={i} className="kc-skel h-7 rounded-full shrink-0" style={{ width: w }} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="rounded-2xl border border-slate-800 bg-[#0c0e15] p-2.5 space-y-2"
          >
            <div className="kc-skel aspect-square w-full rounded-xl" />
            <div className="kc-skel h-3 w-4/5" />
            <div className="kc-skel h-3 w-3/5" />
            <div className="flex items-center justify-between pt-1">
              <div className="kc-skel h-4 w-1/3" />
              <div className="kc-skel h-6 w-6 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {slow && (
      <div className="px-4 py-3 border-t border-slate-800 bg-[#0b0d13] text-center">
        <p className="text-[11px] text-slate-400 mb-2">
          {isUrdu
            ? 'Store ko load hone mein zyada waqt lag raha hai.'
            : 'The store is taking longer than usual.'}
        </p>
        <button
          onClick={onOpenExternal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-black cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {isUrdu ? 'Browser mein kholen' : 'Open in browser'}
        </button>
      </div>
    )}
  </div>
);

/**
 * Opens the store in the same window and keeps the branded loading screen
 * visible until the browser actually swaps pages (the old page stays on
 * screen until the new one is ready). No iframe, so the store site needs
 * no changes. In an installed PWA, Android shows the store in an in-app
 * browser tab; when the user comes back, the loader closes itself.
 */
export const StoreViewer: React.FC<StoreViewerProps> = ({
  url,
  title = 'Khanewal Connect Store',
  onClose,
  isUrdu = true
}) => {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    let leftApp = false;

    const onHidden = () => {
      if (document.visibilityState === 'hidden') leftApp = true;
      else if (leftApp) onClose(); // returned from the store
    };
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) onClose(); // back/forward cache restore
    };
    document.addEventListener('visibilitychange', onHidden);
    window.addEventListener('pageshow', onPageShow);

    // Let the loader paint first, then navigate.
    const go = setTimeout(() => window.location.assign(url), 450);
    const slowTimer = setTimeout(() => setSlow(true), SLOW_LOAD_MS);

    return () => {
      clearTimeout(go);
      clearTimeout(slowTimer);
      document.removeEventListener('visibilitychange', onHidden);
      window.removeEventListener('pageshow', onPageShow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openExternal = () => window.open(url, '_blank', 'noopener,noreferrer');

  return createPortal(
    <div
      role="dialog"
      aria-label={title}
      className="fixed inset-x-0 top-0 z-[70] bg-[#07080c]"
      style={{ height: 'var(--app-height, 100dvh)' }}
    >
      <StoreLoader isUrdu={isUrdu} slow={slow} onOpenExternal={openExternal} />
      <button
        onClick={onClose}
        aria-label="Cancel"
        className="absolute right-3 z-20 p-2 rounded-full bg-slate-800/80 text-slate-200 active:scale-95 cursor-pointer touch-manipulation"
        style={{ top: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}
      >
        <X className="w-5 h-5" />
      </button>
    </div>,
    document.body
  );
};
