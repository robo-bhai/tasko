import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Store } from '../services/store';
import { SystemSettings } from '../types';

interface FloatingWhatsAppButtonProps {
  isUrdu?: boolean;
}

export const FloatingWhatsAppButton: React.FC<FloatingWhatsAppButtonProps> = ({ isUrdu = true }) => {
  const [settings, setSettings] = useState<SystemSettings>(() => Store.getSettings());
  const [isOpenTooltip, setIsOpenTooltip] = useState(true);

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(Store.getSettings());
    };
    window.addEventListener('omniserve_store_updated', handleUpdate);
    return () => window.removeEventListener('omniserve_store_updated', handleUpdate);
  }, []);

  // Clean phone number for wa.me link (digits only, e.g. 923001234567)
  const cleanNumber = (settings.whatsappSupportPhone || '+923001234567').replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(
    settings.whatsappDefaultMessage || 'السلام علیکم! مجھے سروس کے بارے میں کچھ معلومات چاہیے/مدد چاہیے۔'
  );
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

  return (
    <aside aria-label="Support Assistance" className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2 group">
      {/* Tooltip speech bubble */}
      {isOpenTooltip && (
        <div className="bg-white text-slate-800 text-xs font-medium py-2 px-3.5 rounded-2xl shadow-xl border border-slate-200/90 flex items-center gap-2 max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
              {isUrdu ? 'خانیوال کنیکٹ لائیو سپورٹ' : 'Khanewal Connect Support'}
            </span>
            <span className="text-[11px] text-slate-600">
              {isUrdu ? 'کیا آپ کو کسی سروس میں مدد چاہیے؟ واٹس ایپ کریں' : 'Need help or want to book? Chat on WhatsApp'}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpenTooltip(false);
            }}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="relative flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-full shadow-lg hover:shadow-xl shadow-emerald-500/30 transition-all duration-300 group-hover:scale-105"
      >
        {/* Pulse glow effect */}
        <span className="absolute -inset-1 rounded-full bg-emerald-400 opacity-40 animate-pulse pointer-events-none"></span>

        {/* WhatsApp Icon */}
        <svg
          className="w-8 h-8 fill-current relative z-10"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.405z" />
        </svg>

        {/* Status indicator dot */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></span>
      </a>
    </aside>
  );
};
