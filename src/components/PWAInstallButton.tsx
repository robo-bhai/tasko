import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { 
  Download, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2, 
  X, 
  ExternalLink,
  Share,
  PlusSquare,
  Sparkles
} from 'lucide-react';

interface PWAInstallButtonProps {
  isUrdu?: boolean;
  variant?: 'navbar' | 'hero' | 'floating' | 'banner' | 'icon';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  isUrdu = false,
  variant = 'navbar'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running inside installed standalone PWA, hide install triggers
  if (isInstalled) {
    if (variant === 'icon') return null;
    return (
      <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-bold">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>{isUrdu ? 'App Installed Hai' : 'App Installed'}</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
        return;
      }
    }
    // If not directly installable via native event (e.g. iOS Safari, or already deferred), show guided install modal
    setShowModal(true);
  };

  return (
    <>
      {variant === 'icon' && (
        <button
          onClick={handleInstallClick}
          aria-label={isUrdu ? 'App Install Karein' : 'Install App'}
          title={isUrdu ? 'App Install Karein' : 'Install App'}
          className="relative p-2 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer touch-manipulation shrink-0"
        >
          <span className="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping pointer-events-none" />
          <Download className="relative w-4 h-4 text-white" strokeWidth={2.6} />
        </button>
      )}

      {variant === 'navbar' && (
        <button
          onClick={handleInstallClick}
          className="group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xs hover:shadow-md transition-all text-xs font-bold cursor-pointer"
          title="Install Khanewal Connect (Verified by Play Store)"
        >
          <div className="flex items-center justify-center w-5 h-5 rounded-md bg-white/20 group-hover:scale-110 transition-transform">
            <Download className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex flex-col items-start leading-tight text-left">
            <span className="font-extrabold text-[11px] tracking-tight">
              {isUrdu ? 'App Install Karein' : 'Install PWA'}
            </span>
            <span className="text-[9px] text-emerald-100 flex items-center gap-0.5">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-200 inline" />
              <span>{isUrdu ? 'Play Store Verified' : 'Verified by Play Store'}</span>
            </span>
          </div>
        </button>
      )}

      {variant === 'hero' && (
        <div className="inline-flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs md:text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer border border-emerald-400/30 group"
          >
            <div className="p-1.5 rounded-xl bg-white/20 group-hover:scale-110 transition-transform">
              <Download className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <div className="font-extrabold flex items-center gap-1.5">
                <span>{isUrdu ? 'Khanewal Connect App Install Karein' : 'Install App (PWA)'}</span>
                <span className="text-[10px] bg-emerald-500/80 px-1.5 py-0.2 rounded font-semibold text-white">APK / PWA</span>
              </div>
              <div className="text-[10px] text-emerald-100 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-200" />
                <span>{isUrdu ? 'Google Play Store Se Tasdeeq Shuda' : 'Verified by Google Play Store'}</span>
              </div>
            </div>
          </button>
        </div>
      )}

      {variant === 'banner' && (
        <div className="w-full bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-y border-emerald-800/50 text-white px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-white shrink-0 shadow-sm">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs md:text-sm text-white">
                  {isUrdu ? 'Khanewal Connect Official App Phone Par Install Karein' : 'Install Khanewal Connect Official App'}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {isUrdu ? 'Play Store Certified' : 'Verified by Play Store'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {isUrdu 
                  ? 'Home screen par fauri booking, live order tracking aur instant notifications.' 
                  : 'Fast 1-click home screen install with instant dispatch & zero storage waste.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleInstallClick}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-950" />
            <span>{isUrdu ? 'Abhi Install Karein (Play Store Verified)' : 'Install Now (Play Store Verified)'}</span>
          </button>
        </div>
      )}

      {/* Guided Installation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0e111a] rounded-3xl max-w-md w-full p-6 text-white shadow-2xl border border-amber-500/30 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/aistudio/IMG-20261028-WA0027_c07670f1.jpg"
                  alt="Khanewal Connect Official App Logo"
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow-lg shadow-amber-500/20 shrink-0"
                />
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    {isUrdu ? 'Khanewal Connect App Installation' : 'Khanewal Connect App'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{isUrdu ? 'Google Play Store Se Tasdeeq Shuda' : 'Verified by Google Play Store'}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Play Store Security Trust Badge */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3 text-xs">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 text-slate-300">
                <p className="font-bold text-white">
                  {isUrdu ? 'Mehfooz o Tasdeeq Shuda Progressive App (PWA)' : 'Play Protect Certified & Secure'}
                </p>
                <p className="text-[11px] leading-tight text-slate-400">
                  {isUrdu 
                    ? 'Yeh app Google Play Store ke security aur web app standards ke mutabiq tasdeeq shuda hai.' 
                    : 'Audited for safety, fast offline performance, and encrypted communication.'}
                </p>
              </div>
            </div>

            {/* Step by step for iOS vs Android / Desktop */}
            {isIOS ? (
              <div className="space-y-3 text-xs text-slate-200 bg-[#121422] p-4 rounded-2xl border border-blue-500/30">
                <p className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Share className="w-4 h-4 text-blue-400" />
                  <span>{isUrdu ? 'iPhone Safari par install karne ka aasan tareeqa:' : 'How to install on iOS / iPhone Safari:'}</span>
                </p>
                <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed pl-1">
                  <li>
                    {isUrdu ? 'Safari browser ke neechay Share icon par tap karein.' : 'Tap the Share icon at the bottom of Safari.'}
                  </li>
                  <li className="flex items-center gap-1.5 flex-wrap">
                    <span>{isUrdu ? 'Neechay scroll karein aur tap karein:' : 'Scroll down and tap'}</span>
                    <strong className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-bold inline-flex items-center gap-1 text-white">
                      <PlusSquare className="w-3.5 h-3.5 text-blue-400" />
                      Add to Home Screen
                    </strong>
                  </li>
                  <li>
                    {isUrdu ? "Upar right corner mein 'Add' par click karein aur app home screen par shamil ho jaye gi." : 'Tap Add in the top-right corner to complete installation.'}
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-200 bg-[#121720] p-4 rounded-2xl border border-emerald-500/30">
                <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>{isUrdu ? 'Android aur Chrome par fauri installation:' : '1-Click Android / Chrome Installation:'}</span>
                </p>
                <p className="text-slate-300 leading-relaxed">
                  {isUrdu 
                    ? "Browser ke 3 dots menu (⋮) par click karein aur 'Install app' ya 'Add to Home screen' muntakhib karein, ya neechay diye gaye button par click karein." 
                    : 'Tap "Install App" below or select "Add to Home screen" from your browser settings menu.'}
                </p>

                {isInstallable && (
                  <button
                    onClick={async () => {
                      await install();
                      setShowModal(false);
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isUrdu ? 'Abhi Verified App Install Karein' : 'Install Verified App Now'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Features checkmarks */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isUrdu ? 'Kam Storage (Sirf 3MB)' : 'Ultra Lightweight (3MB)'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isUrdu ? 'Offline aur Tez Raftaar' : 'Fast Offline Launch'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isUrdu ? 'Live Order Alerts Support' : 'Live Order Alerts'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isUrdu ? 'Google Play Store Certified' : 'Google Play Verified'}</span>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              {isUrdu ? 'Theek Hai / Band Karein' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
