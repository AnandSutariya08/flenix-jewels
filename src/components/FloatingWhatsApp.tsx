import { useState } from 'react';
import { X } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectGlobalData } from '@/store/contentSlice';
import { cleanWhatsApp } from '@/lib/utils';

const FloatingWhatsApp = () => {
  const { contactInfo } = useAppSelector(selectGlobalData);
  const [dismissed, setDismissed] = useState(false);

  const number = cleanWhatsApp(contactInfo?.whatsapp || '85251254000');
  const message = 'Hello! I have a question about your jewelry collection.';
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  const handleOpen = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-5 z-50 flex items-center gap-2.5 select-none">
      {!dismissed && (
        <div
          className="flex items-center gap-2 cursor-pointer group animate-in fade-in slide-in-from-right-4 duration-300"
          onClick={handleOpen}
        >
          <div
            className="relative flex items-center pl-4 pr-5 py-2.5 rounded-full shadow-lg transition-all duration-200 group-hover:shadow-xl group-hover:-translate-y-0.5"
            style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)' }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
              className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'rgba(120,120,120,0.15)', color: '#666' }}
              aria-label="Close"
            >
              <X className="h-3 w-3" />
            </button>
            <div>
              <p className="text-[13px] font-semibold leading-tight" style={{ color: '#111' }}>
                Have a question?
              </p>
              <p className="text-[11px] leading-tight" style={{ color: '#666' }}>
                We're happy to help
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleOpen}
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl flex-shrink-0"
        style={{ background: '#1a1a2e' }}
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
        </svg>
      </button>
    </div>
  );
};

export default FloatingWhatsApp;
