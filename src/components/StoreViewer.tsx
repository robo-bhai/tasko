import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ExternalLink, RefreshCw, ShoppingBag } from 'lucide-react';

interface StoreViewerProps {
  url: string;
  title?: string;
  onClose: () => void;
  isUrdu?: boolean;
}

const SLOW_LOAD_MS = 15000;

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

export const StoreViewer: React.FC<StoreViewerProps> = ({
  url,
  title = 'Khanewal Connect Store',
  onClose,
  isUrdu = true
}) => {
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const closedByPop = useRef(false);

  // Android back button / gesture closes the viewer instead of leaving the app.
  useEffect(() => {
    window.history.pushState({ kcStore: true }, '');
    const onPop = () => {
      closedByPop.current = true;
      onClose();
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      if (!closedByPop.current && window.history.state?.kcStore) {
        window.history.back();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show the "taking long" hint if the page has not finished loading.
  useEffect(() => {
    setLoaded(false);
    setSlow(false);
    const t = setTimeout(() => setSlow(true), SLOW_LOAD_MS);
    return () => clearTimeout(t);
  }, [reloadKey]);

  const openExternal = () => window.open(url, '_blank', 'noopener,noreferrer');

  return (
    <div
      role="dialog"
      aria-label={title}
      className="fixed inset-x-0 top-0 z-[70] flex flex-col bg-[#07080c]"
      style={{ height: 'var(--app-height, 100dvh)' }}
    >
      {/* Header */}
      <header
        className="shrink-0 flex items-center gap-2 px-2 pb-2 bg-[#090a0f] border-b border-amber-500/20"
        style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top, 0px))' }}
      >
        <button
          onClick={onClose}
          aria-label="Back"
          className="p-2 rounded-xl text-slate-200 hover:bg-slate-800 active:scale-95 cursor-pointer touch-manipulation"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-white truncate">
            Khanewal <span className="text-amber-400">Connect</span>
          </p>
          <p className="text-[10px] text-slate-400 truncate">{title}</p>
        </div>
        <button
          onClick={() => setReloadKey(k => k + 1)}
          aria-label="Reload"
          className="p-2 rounded-xl text-slate-300 hover:bg-slate-800 active:scale-95 cursor-pointer touch-manipulation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={openExternal}
          aria-label="Open in browser"
          className="p-2 rounded-xl text-slate-300 hover:bg-slate-800 active:scale-95 cursor-pointer touch-manipulation"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </header>

      {/* Content */}
      <div
        className="relative flex-1 min-h-0"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {!loaded && <StoreLoader isUrdu={isUrdu} slow={slow} onOpenExternal={openExternal} />}
        <iframe
          key={reloadKey}
          src={url}
          title={title}
          className="w-full h-full border-0 bg-white"
          allow="payment; geolocation; clipboard-write"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
};
