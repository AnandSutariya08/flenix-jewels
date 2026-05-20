import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/storage';
import { cleanWhatsApp } from '@/lib/utils';

interface WhatsAppButtonProps {
  product: Product;
  className?: string;
}

const WhatsAppButton = ({ product, className }: WhatsAppButtonProps) => {
  const handleWhatsAppClick = () => {
    let cleanDescription = product.description
      .replace(/<\/?[^>]+(>|$)/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .trim();

    cleanDescription = cleanDescription.replace(/●/g, '•');

    const message = `Hi! I'm interested in:\n\n*${product.name}*\n\n${cleanDescription}`;
    const number = cleanWhatsApp('85251254000');
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
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
