import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CatalogItem, Diamond } from '@/lib/storage';
import { cleanWhatsApp } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { selectGlobalData } from '@/store/contentSlice';

interface WhatsAppButtonProps {
  product: CatalogItem;
  className?: string;
}

const SITE_URL = 'https://www.flenixjewels.com';
const DEFAULT_NUMBER = '85251254000';
const SEP = '━━━━━━━━━━━━━━━━━━━';

const isDiamond = (item: CatalogItem): item is Diamond =>
  'diamondCategoryId' in item;

const stripHtml = (html: string): string =>
  html
    .replace(/<\/?[^>]+(>|$)/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/●/g, '•')
    .replace(/\s{2,}/g, ' ')
    .trim();

const val = (v: string | number | undefined | null): string =>
  (v !== undefined && v !== null && String(v).trim() !== '') ? String(v).trim() : '';

const buildMessage = (product: CatalogItem, productUrl: string): string => {
  const parts: string[] = [];

  parts.push('Hello Flenix Jewels! 👋');
  parts.push('');

  if (isDiamond(product)) {
    parts.push('I am interested in the following diamond and would like more details:');
    parts.push('');
    parts.push(SEP);
    parts.push(`💎 *${product.name}*`);
    if (val(product.price)) parts.push(`💰 *Price:* ${val(product.price)}`);
    parts.push(SEP);

    const specs = [
      val(product.carat)       ? `⚖️ *Carat:* ${val(product.carat)} ct`        : '',
      val(product.shape)       ? `🔷 *Shape:* ${val(product.shape)}`            : '',
      val(product.clarity)     ? `🔬 *Clarity:* ${val(product.clarity)}`        : '',
      val(product.colorGrade)  ? `🎨 *Colour Grade:* ${val(product.colorGrade)}`: '',
      val(product.cut)         ? `✂️ *Cut:* ${val(product.cut)}`                : '',
      val(product.polish)      ? `✨ *Polish:* ${val(product.polish)}`          : '',
      val(product.symmetry)    ? `🔁 *Symmetry:* ${val(product.symmetry)}`      : '',
      val(product.certificate) ? `📋 *Certificate:* ${val(product.certificate)}`: '',
    ].filter(Boolean);

    if (specs.length > 0) {
      parts.push('');
      parts.push(...specs);
    }

    parts.push('');
    parts.push(`🔗 *View Product:*\n${productUrl}`);
    parts.push('');
    parts.push('Could you please confirm availability, share certification details, and let me know about any customisation or setting options?');
  } else {
    parts.push('I am interested in the following product and would like more details:');
    parts.push('');
    parts.push(SEP);
    parts.push(`🏷️ *${product.name}*`);
    if (val(product.price)) parts.push(`💰 *Price:* ${val(product.price)}`);
    parts.push(SEP);

    const desc = stripHtml(product.description);
    if (desc) {
      const shortDesc = desc.length > 250
        ? desc.slice(0, 250).replace(/\s+\S*$/, '') + '…'
        : desc;
      parts.push('');
      parts.push(`📝 *Details:*`);
      parts.push(shortDesc);
    }

    parts.push('');
    parts.push(`🔗 *View Product:*\n${productUrl}`);
    parts.push('');
    parts.push('Could you please share availability, customisation options, and delivery details?');
  }

  parts.push('');
  parts.push('Thank you!');

  return parts.join('\n');
};

const WhatsAppButton = ({ product, className }: WhatsAppButtonProps) => {
  const { contactInfo } = useAppSelector(selectGlobalData);

  const handleWhatsAppClick = () => {
    const number = cleanWhatsApp(contactInfo?.whatsapp || DEFAULT_NUMBER);
    const productUrl = `${SITE_URL}/product/${product.id}`;
    const message = buildMessage(product, productUrl);
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      className={`luxury-gradient text-primary-foreground hover:opacity-90 transition-opacity ${className}`}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      Request More Details
    </Button>
  );
};

export default WhatsAppButton;
