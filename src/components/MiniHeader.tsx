import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Category } from '@/lib/storage';
import { Sparkles, ChevronRight } from 'lucide-react';

interface MiniHeaderProps {
  categories?: Category[];
  promoHeight?: number;
}

const MiniHeader = ({ categories = [], promoHeight = 0 }: MiniHeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const topPosition = promoHeight + 65;
  if (isScrolled) return null;

  return (
    <div
      className="fixed left-0 right-0 z-40 backdrop-blur-md transition-all duration-300"
      style={{
        top: `${promoHeight === 0 ? 80 : topPosition}px`,
        background: 'rgba(253,245,236,0.90)',
        borderBottom: '1px solid rgba(196,144,106,0.20)',
      }}
    >
      {/* Subtle warm decorative glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-32 h-full blur-xl"
          style={{ background: 'linear-gradient(to right, rgba(196,144,106,0.07), transparent)' }} />
        <div className="absolute top-0 right-1/4 w-32 h-full blur-xl"
          style={{ background: 'linear-gradient(to left, rgba(196,144,106,0.07), transparent)' }} />
      </div>

      <div className="relative w-full px-4 md:px-12 lg:px-16">
        <div className="flex items-center gap-4 py-3 overflow-x-auto scrollbar-hide">
          {/* Collections badge */}
          <div className="flex items-center gap-2 text-sm font-semibold whitespace-nowrap px-4 py-2 rounded-full border"
            style={{ color: '#9B6844', background: 'rgba(196,144,106,0.10)', borderColor: 'rgba(196,144,106,0.30)' }}>
            <span className="sm:inline">Collections</span>
          </div>

          <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: '#C4906A' }} />

          {/* Category links */}
          <div className="flex items-center gap-2">
            {categories.map(category => (
              <Link
                key={category.id}
                to={`/category/${category.id}`}
                className="relative text-sm font-medium whitespace-nowrap px-4 py-2 rounded-full transition-all duration-300 border shadow-sm group flex items-center gap-2"
                style={{ color: '#9B6844', background: 'rgba(255,252,248,0.9)', borderColor: 'rgba(196,144,106,0.35)' }}
                onMouseEnter={e => {
                  const el = e.currentTarget;
                  el.style.background = 'linear-gradient(135deg, #9B6844, #C4906A)';
                  el.style.color = '#fff';
                  el.style.borderColor = 'transparent';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget;
                  el.style.background = 'rgba(255,252,248,0.9)';
                  el.style.color = '#9B6844';
                  el.style.borderColor = 'rgba(196,144,106,0.35)';
                }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {category.name}
              </Link>
            ))}
            {categories.length === 0 && (
              <span className="text-sm px-4 py-2" style={{ color: '#C4906A' }}>Loading collections...</span>
            )}
          </div>

          {categories.length > 0 && (
            <Link
              to="/categories"
              className="ml-auto flex-shrink-0 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1"
              style={{ color: '#C4906A' }}
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiniHeader;
