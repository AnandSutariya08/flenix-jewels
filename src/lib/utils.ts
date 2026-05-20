import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Strips all non-digit characters (+, spaces, hyphens, etc.) from a WhatsApp
 * number so it is safe to embed directly in a wa.me URL.
 * e.g. '+852 51254000 ' → '85251254000'
 */
export function cleanWhatsApp(number: string): string {
  return (number || '').replace(/\D/g, '');
}

export function formatPriceRounded(value: string | number) {
  const numeric =
    typeof value === "number"
      ? value
      : parseFloat(String(value).replace(/[^0-9.]/g, ""));
  const safe = Number.isFinite(numeric) ? numeric : 0;
  return Math.round(safe).toString();
}
