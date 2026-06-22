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

const WhatsAppButton = ({ product, className }: WhatsAppButtonProps) => {
  const { contactInfo } = useAppSelector(selectGlobalData);

  const handleWhatsAppClick = () => {
    const number = cleanWhatsApp(contactInfo?.whatsapp || DEFAULT_NUMBER);
    const productUrl = `${SITE_URL}/product/${product.id}`;

    let message: string;

    if (isDiamond(product)) {
      const specs = [
        product.carat    ? `⚖️ *Carat:* ${product.carat} ct`           : '',
        product.shape    ? `🔷 *Shape:* ${product.shape}`               : '',
        product.clarity  ? `🔬 *Clarity:* ${product.clarity}`           : '',
        product.colorGrade ? `🎨 *Colour Grade:* ${product.colorGrade}` : '',
        product.cut      ? `✂️ *Cut:* ${product.cut}`                   : '',
        product.polish   ? `✨ *Polish:* ${product.polish}`             : '',
        product.symmetry ? `🔁 *Symmetry:* ${product.symmetry}`        : '',
        product.certificate ? `📋 *Certificate:* ${product.certificate}` : '',
      ].filter(Boolean).join('\n');

      message =
`Hello Flenix Jewels! 👋

I am interested in the following diamond and would like more details:

━━━━━━━━━━━━━━━━━━━
💎 *${product.name}*
💰 *Price:* ${product.price}
━━━━━━━━━━━━━━━━━━━
${specs ? `\n${specs}\n` : ''}
🔗 *View Product:*
${productUrl}

Could you please confirm availability, share certification details, and let me know about any customisation or setting options?

Thank you!`;
    } else {
      const desc = stripHtml(product.description);
      const shortDesc = desc.length > 250
        ? desc.slice(0, 250).replace(/\s+\S*$/, '') + '…'
        : desc;

      message =
`Hello Flenix Jewels! 👋

I am interested in the following product and would like more details:

━━━━━━━━━━━━━━━━━━━
🏷️ *${product.name}*
💰 *Price:* ${product.price}
━━━━━━━━━━━━━━━━━━━
${shortDesc ? `\n📝 *Details:*\n${shortDesc}\n` : ''}
🔗 *View Product:*
${productUrl}

Could you please share availability, customisation options, and delivery details?

Thank you!`;
    }

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
