import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CatalogItem } from '@/lib/storage';
import { cleanWhatsApp } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { selectGlobalData } from '@/store/contentSlice';

interface WhatsAppButtonProps {
  product: CatalogItem;
  className?: string;
}

const SITE_URL = 'https://www.flenixjewels.com';
const DEFAULT_NUMBER = '85251254000';

const buildMessage = (product: CatalogItem, productUrl: string): string => {
  return [
    'Hello Flenix Jewels! 👋',
    '',
    'I am interested in the following product and would like more details:',
    '',
    `🏷️ *${product.name}*`,
    '',
    `🔗 *View Product:*`,
    productUrl,
    '',
    'Could you please share availability, customisation options, and delivery details?',
    '',
    'Thank you!',
  ].join('\n');
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
