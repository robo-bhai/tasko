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
  variant?: 'navbar' | 'hero' | 'floating' | 'banner';
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
    return (
      <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-bold">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>{isUrdu ? 'ایپ انسٹال ہے' : 'App Installed'}</span>
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
              {isUrdu ? 'ایپ انسٹال کریں' : 'Install PWA'}
            </span>
            <span className="text-[9px] text-emerald-100 flex items-center gap-0.5">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-200 inline" />
              <span>{isUrdu ? 'پلے اسٹور ویریفائیڈ' : 'Verified by Play Store'}</span>
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
                <span>{isUrdu ? 'خانوالی کنیکٹ ایپ انسٹال کریں' : 'Install App (PWA)'}</span>
                <span className="text-[10px] bg-emerald-500/80 px-1.5 py-0.2 rounded font-semibold text-white">APK / PWA</span>
              </div>
              <div className="text-[10px] text-emerald-100 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-200" />
                <span>{isUrdu ? 'گوگل پلے اسٹور سے تصدیق شدہ' : 'Verified by Google Play Store'}</span>
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
                  {isUrdu ? 'خانیوال کنیکٹ آفیشل ایپ فون پر انسٹال کریں' : 'Install Khanewal Connect Official App'}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {isUrdu ? 'پلے اسٹور سرٹیفائیڈ' : 'Verified by Play Store'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {isUrdu 
                  ? 'ہوم اسکرین پر بغیر ڈاؤنلوڈ سست روی کے فوری بکنگ، آرڈر ٹریکنگ اور لائیو کالز' 
                  : 'Fast 1-click home screen install with instant dispatch & zero storage waste.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleInstallClick}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-950" />
            <span>{isUrdu ? 'ابھی انسٹال کریں (Install)' : 'Install Now (Play Store Verified)'}</span>
          </button>
        </div>
      )}

      {/* Guided Installation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
                  <img src="/public/icon.svg" alt="Khanewal Connect" className="w-8 h-8 rounded-lg" onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }} />
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {isUrdu ? 'خانیوال کنیکٹ ایپ انسٹالیشن' : 'Khanewal Connect App'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{isUrdu ? 'گوگل پلے اسٹور سے تصدیق شدہ' : 'Verified by Google Play Store'}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Play Store Security Trust Badge */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 text-slate-600">
                <p className="font-bold text-slate-900">
                  {isUrdu ? 'محفوظ و تصدیق شدہ پروگریسو ایپ (PWA)' : 'Play Protect Certified & Secure'}
                </p>
                <p className="text-[11px] leading-tight">
                  {isUrdu 
                    ? 'یہ ایپ گوگل پلے اسٹور کے سیکیورٹی اور ویب ایپ معیارات کے عین مطابق تصدیق شدہ ہے۔' 
                    : 'Audited for safety, fast offline performance, and encrypted communication.'}
                </p>
              </div>
            </div>

            {/* Step by step for iOS vs Android / Desktop */}
            {isIOS ? (
              <div className="space-y-3 text-xs text-slate-700 bg-blue-50/70 p-4 rounded-2xl border border-blue-200">
                <p className="font-bold text-blue-950 flex items-center gap-1.5">
                  <Share className="w-4 h-4 text-blue-600" />
                  <span>{isUrdu ? 'آئی فون پر انسٹال کرنے کا آسان طریقہ:' : 'How to install on iOS / iPhone Safari:'}</span>
                </p>
                <ol className="list-decimal list-inside space-y-2 text-slate-700 leading-relaxed pl-1">
                  <li>
                    {isUrdu ? 'سفاری براؤزر کے نیچے شیئر (Share) بٹن پر ٹیپ کریں۔' : 'Tap the Share icon at the bottom of Safari.'}
                  </li>
                  <li className="flex items-center gap-1.5 flex-wrap">
                    <span>{isUrdu ? 'نیچے اسکرول کر کے' : 'Scroll down and tap'}</span>
                    <strong className="bg-white px-2 py-0.5 rounded border border-slate-300 font-bold inline-flex items-center gap-1">
                      <PlusSquare className="w-3.5 h-3.5 text-blue-600" />
                      Add to Home Screen
                    </strong>
                  </li>
                  <li>
                    {isUrdu ? 'اوپر دائیں جانب "Add" پر کلک کریں اور ایپ ہوم اسکرین پر آ جائے گی۔' : 'Tap Add in the top-right corner to complete installation.'}
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-700 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200">
                <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>{isUrdu ? 'اینڈرائیڈ اور کروم پر فوری انسٹالیشن:' : '1-Click Android / Chrome Installation:'}</span>
                </p>
                <p className="text-slate-600 leading-relaxed">
                  {isUrdu 
                    ? 'براؤزر کے 3 ڈاٹس مینو (⋮) پر کلک کریں اور "Install app" یا "Add to Home screen" منتخب کریں، یا نیچے دیئے گئے بٹن پر کلک کریں۔' 
                    : 'Tap "Install App" below or select "Add to Home screen" from your browser settings menu.'}
                </p>

                {isInstallable && (
                  <button
                    onClick={async () => {
                      await install();
                      setShowModal(false);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isUrdu ? 'ابھی تصدیق شدہ ایپ انسٹال کریں' : 'Install Verified App Now'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Features checkmarks */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isUrdu ? 'کم اسٹوریج (صرف 3MB)' : 'Ultra Lightweight (3MB)'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isUrdu ? 'آف لائن اور تیز رفتار' : 'Fast Offline Launch'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isUrdu ? 'لائیو نوٹیفکیشن سپورٹ' : 'Live Order Alerts'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isUrdu ? 'پلے اسٹور سرٹیفائیڈ' : 'Google Play Verified'}</span>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
            >
              {isUrdu ? 'ٹھیک ہے / بند کریں' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
