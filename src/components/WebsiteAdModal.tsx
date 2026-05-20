import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useAppSelector } from '@/store/hooks';
import { selectGlobalData } from '@/store/contentSlice';
import { cleanWhatsApp } from '@/lib/utils';
import { FaWhatsapp } from 'react-icons/fa';
import { Sparkles } from 'lucide-react';

const ADS_MODAL_DELAY_MS = 3000;
const ADS_MODAL_COOLDOWN_MS = 5 * 60 * 60 * 1000;
const ADS_MODAL_STORAGE_KEY = 'flenix_ads_modal_dismissed_at';
const DEFAULT_WHATSAPP_NUMBER = '85251254000';

const getDismissedAt = () => {
  if (typeof window === 'undefined') return 0;
  const rawValue = window.localStorage.getItem(ADS_MODAL_STORAGE_KEY);
  const parsed = rawValue ? Number(rawValue) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
};

const saveDismissedAt = (value: number) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ADS_MODAL_STORAGE_KEY, String(value));
};

const clearDismissedAt = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ADS_MODAL_STORAGE_KEY);
};

const WebsiteAdModal = ({ disabled = false }: { disabled?: boolean }) => {
  const { ads, contactInfo } = useAppSelector(selectGlobalData);
  const activeAd = useMemo(() => ads.find((ad) => ad.active) || null, [ads]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (disabled || !activeAd) {
      setOpen(false);
      return;
    }

    const dismissedAt = getDismissedAt();
    if (dismissedAt) {
      const elapsed = Date.now() - dismissedAt;
      if (elapsed < ADS_MODAL_COOLDOWN_MS) {
        setOpen(false);
        return;
      }
      clearDismissedAt();
    }

    const timeoutId = window.setTimeout(() => {
      setOpen(true);
    }, ADS_MODAL_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [activeAd, disabled]);

  const handleDismiss = () => {
    setOpen(false);
    saveDismissedAt(Date.now());
  };

  if (!activeAd) return null;

  const whatsappNumber = cleanWhatsApp(contactInfo?.whatsapp || DEFAULT_WHATSAPP_NUMBER);
  const defaultMessage = activeAd.title
    ? `Hello Flenix Jewels, I saw your "${activeAd.title}" offer on the website and would like more details.`
    : 'Hello Flenix Jewels, I saw your website offer and would like more details.';
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;
  const title = activeAd.title || 'Special Offer';
  const description =
    activeAd.description ||
    'Explore our latest jewellery offer and message us on WhatsApp to get pricing, images, and quick help from our team.';

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) handleDismiss(); }}>
      <DialogContent className="max-w-4xl w-[94vw] overflow-hidden rounded-[28px] border-0 p-0 shadow-2xl">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>

        <div className={`grid ${activeAd.image ? 'md:grid-cols-[1.05fr_0.95fr]' : 'grid-cols-1'} bg-white dark:bg-[#120904]`}>
          {activeAd.image && (
            <div className="relative min-h-[280px] md:min-h-[520px] bg-[#f4ede4]">
              <img
                src={activeAd.image}
                alt={title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
            </div>
          )}

          <div className="relative p-7 md:p-10 bg-[radial-gradient(circle_at_top,#fff7ef,transparent_58%),linear-gradient(160deg,#fffdfa_0%,#f8efe5_45%,#f3e6d8_100%)] dark:bg-[linear-gradient(180deg,#1b0f08_0%,#120904_100%)]">
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#25D366]/10 blur-3xl" />
            <div className="relative z-10 flex h-full flex-col">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#25D366]/20 bg-[#25D366]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#138a51] dark:text-[#8df0b4]">
                <Sparkles className="h-3.5 w-3.5" />
                Special Offer
              </div>

              <div className="mt-5">
                <h2 className="text-3xl md:text-[2.45rem] font-semibold leading-tight text-[#1C0D05] dark:text-white">
                  {title}
                </h2>
                <p className="mt-4 text-sm md:text-base leading-7 text-[#6c5240] dark:text-[#e7d3c0]">
                  {description}
                </p>
              </div>

              <div className="mt-8 rounded-2xl border border-[#25D366]/18 bg-white/80 p-4 shadow-[0_14px_34px_-28px_rgba(37,211,102,0.65)] backdrop-blur dark:border-[#25D366]/14 dark:bg-white/5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0f8f53] dark:text-[#8df0b4]">
                  Quick Support
                </p>
                <p className="mt-2 text-sm text-[#6c5240] dark:text-[#e7d3c0]">
                  Tap below and we will open WhatsApp with a ready message so the team can reply faster.
                </p>
              </div>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleDismiss}
                className="mt-6 inline-flex items-center justify-center gap-3 rounded-2xl px-5 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: 'linear-gradient(135deg, #128C7E 0%, #1EA672 45%, #25D366 100%)',
                  boxShadow: '0 20px 36px -18px rgba(37,211,102,0.75)',
                }}
              >
                <FaWhatsapp className="h-4 w-4" />
                Contact Now
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WebsiteAdModal;
