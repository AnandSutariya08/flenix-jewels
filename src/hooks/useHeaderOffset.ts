import { useAppSelector } from '@/store/hooks';
import { selectGlobalData } from '@/store/contentSlice';
import { HEADER_OFFSET_PX, PROMO_BAR_HEIGHT_PX } from '@/lib/layout';

export function useHeaderOffset(): number {
  const { promoHeader } = useAppSelector(selectGlobalData);
  const promoVisible = !!(promoHeader?.enabled && promoHeader?.text);
  return HEADER_OFFSET_PX + (promoVisible ? PROMO_BAR_HEIGHT_PX : 0);
}
