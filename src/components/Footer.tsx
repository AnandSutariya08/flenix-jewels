import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, MessageCircle, ChevronRight } from "lucide-react";
import logo from "@/assets/flenix-logo-full.png";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalData } from "@/store/contentSlice";
import { useTheme } from "next-themes";
import Zelle from "@/assets/paylogo/Zelle_(payment_service)-Logo.wine.png";
import Venmo from "@/assets/paylogo/Venmo-Logo.wine.png";
import Google from "@/assets/paylogo/Google_Pay-Logo.wine.png";
import Visa from "@/assets/paylogo/Visa_Inc.-Logo.wine.png";
import Bank from "@/assets/paylogo/Wells_Fargo-Logo.wine.png";
import GIA from "@/assets/paylogo/GIA_Logo.png";
import Rapaport from "@/assets/paylogo/Rapaport-header-20250120083212-20250210092659-20250227142926-20250310094122.svg";
import SDA from "@/assets/paylogo/sda.png";
import Bourse from "@/assets/paylogo/SDB LOGO.png";

const GOLD = "linear-gradient(135deg, #9B6844 0%, #C4906A 55%, #D4A96A 100%)";

export default function Footer() {
  const { contactInfo } = useAppSelector(selectGlobalData);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const C = useMemo(
    () =>
      isDark
        ? {
            footerBg: "linear-gradient(180deg, #0b0603 0%, #070402 100%)",
            border: "rgba(196,144,106,0.18)",
            borderSoft: "rgba(196,144,106,0.14)",
            panelBg: "rgba(255,255,255,0.03)",
            chipBg: "rgba(255,255,255,0.04)",
            chipBorder: "rgba(196,144,106,0.14)",
            gold: "rgba(196,144,106,0.85)",
            text: "rgba(245,232,216,0.70)",
            muted: "rgba(245,232,216,0.55)",
            hover: "#ffffff",
          }
        : {
            footerBg: "linear-gradient(180deg, rgba(255,252,248,1) 0%, rgba(250,244,236,1) 100%)",
            border: "rgba(196,144,106,0.22)",
            borderSoft: "rgba(155,104,68,0.14)",
            panelBg: "rgba(155,104,68,0.05)",
            chipBg: "rgba(255,255,255,0.70)",
            chipBorder: "rgba(196,144,106,0.18)",
            gold: "rgba(155,104,68,0.85)",
            text: "rgba(20,12,6,0.78)",
            muted: "rgba(20,12,6,0.55)",
            hover: "#130900",
          },
    [isDark],
  );

  const paymentMethods = useMemo(
    () => [
      { name: "Zelle", logo: Zelle },
      { name: "Venmo", logo: Venmo },
      { name: "Google Pay", logo: Google },
      { name: "Visa", logo: Visa },
      { name: "Bank Wire", logo: Bank },
    ],
    [],
  );

  const trustedBadges = useMemo(
    () => [
      { name: "GIA", logo: GIA },
      { name: "Rapaport", logo: Rapaport },
      { name: "Surat Diamond Assoc.", logo: SDA },
      { name: "Surat Diamond Bourse", logo: Bourse },
      { name: "Surat Jewellery Assoc.", logo: "https://sjma.in/cdn/shop/files/SJMA_Logo.png?v=1755163553&width=210" },
    ],
    [],
  );

  const links = useMemo(
    () => [
      { label: "Home", path: "/" },
      { label: "Categories", path: "/categories" },
      { label: "Gallery", path: "/gallery" },
      { label: "Blog", path: "/blog" },
      { label: "Buying Guide", path: "/buying-guide" },
      { label: "About", path: "/about" },
      { label: "Contact", path: "/contact" },
    ],
    [],
  );

  return (
    <footer
      className="mt-20 border-t"
      style={{
        borderColor: C.border,
        background: C.footerBg,
      }}
    >
      <div
        className="h-px w-full"
        style={{
          background: isDark
            ? "linear-gradient(90deg, transparent 8%, rgba(196,144,106,0.55) 50%, transparent 92%)"
            : "linear-gradient(90deg, transparent 8%, rgba(155,104,68,0.35) 50%, transparent 92%)",
        }}
      />

      <div className="w-full px-4 sm:px-6 lg:px-10 py-12">
        {/* Trust + payments */}
        <div
          className="rounded-2xl border px-5 py-5 mb-10"
          style={{ borderColor: C.borderSoft, background: C.panelBg }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="space-y-2">
              <p className="text-[10px] tracking-[0.32em] uppercase font-black" style={{ color: C.gold }}>
                Certified &amp; Trusted
              </p>
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
                {trustedBadges.map((b) => (
                  <div
                    key={b.name}
                    className="flex-shrink-0 rounded-xl p-2"
                    style={{ background: C.chipBg, border: `1px solid ${C.chipBorder}` }}
                  >
                    <img src={b.logo} alt={b.name} title={b.name} className="h-10 w-10 object-contain" loading="lazy" decoding="async" fetchpriority="low" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <img
                src={logo}
                alt="Flenix Jewels"
                className="h-20 w-auto object-contain opacity-95"
                style={{ filter: isDark ? undefined : "brightness(0.9) contrast(1.1)" }}
                loading="lazy"
                decoding="async"
                fetchpriority="low"
              />
            </div>

            <div className="space-y-2">
              <p className="text-[10px] tracking-[0.32em] uppercase font-black lg:text-right" style={{ color: C.gold }}>
                Payment Methods
              </p>
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 lg:justify-end">
                {paymentMethods.map((m) => (
                  <div
                    key={m.name}
                    className="flex-shrink-0 rounded-xl p-2"
                    style={{ background: C.chipBg, border: `1px solid ${C.chipBorder}` }}
                  >
                    <img src={m.logo} alt={m.name} title={m.name} className="h-10 w-10 object-contain" loading="lazy" decoding="async" fetchpriority="low" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
          <div className="space-y-4">
            <p className="text-sm font-black tracking-[0.22em] uppercase" style={{ color: C.gold }}>
              Flenix Jewels
            </p>
            <p className="text-sm leading-relaxed" style={{ color: C.text }}>
              Premium lab-grown &amp; natural diamond jewelry — crafted with timeless elegance and trusted certification.
            </p>
            {contactInfo?.whatsapp && (
              <a
                href={`https://wa.me/${contactInfo.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-black tracking-[0.18em] uppercase transition-all"
                style={{
                  background: "linear-gradient(135deg, rgba(18,140,126,0.25), rgba(37,211,102,0.18))",
                  border: "1px solid rgba(37,211,102,0.25)",
                  color: "#7FE8A0",
                }}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Support
              </a>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-sm font-black tracking-[0.22em] uppercase" style={{ color: C.gold }}>
              Explore
            </p>
            <ul className="space-y-2.5">
              {links.map((l) => (
                <li key={l.path}>
                  <Link to={l.path} className="group inline-flex items-center gap-2 text-sm transition-colors" style={{ color: C.text }}>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" style={{ color: isDark ? "rgba(196,144,106,0.7)" : "rgba(155,104,68,0.55)" }} />
                    <span className="transition-colors" style={{ color: "inherit" }}>
                      {l.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-black tracking-[0.22em] uppercase" style={{ color: C.gold }}>
              Contact
            </p>
            <ul className="space-y-3 text-sm" style={{ color: C.text }}>
              {contactInfo?.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: C.gold }} />
                  <span className="leading-relaxed">{contactInfo.address}</span>
                </li>
              )}
              {contactInfo?.phone && (
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 flex-shrink-0" style={{ color: C.gold }} />
                  <a href={`tel:${contactInfo.phone}`} className="transition-colors" style={{ color: "inherit" }}>
                    {contactInfo.phone}
                  </a>
                </li>
              )}
              {contactInfo?.email && (
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 flex-shrink-0" style={{ color: C.gold }} />
                  <a href={`mailto:${contactInfo.email}`} className="transition-colors break-all" style={{ color: "inherit" }}>
                    {contactInfo.email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-black tracking-[0.22em] uppercase" style={{ color: C.gold }}>
              Follow
            </p>
            <div className="flex flex-wrap gap-3">
              {contactInfo?.facebook && (
                <a
                  href={contactInfo.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all"
                  style={{ background: C.chipBg, border: `1px solid ${C.chipBorder}`, color: isDark ? "rgba(196,144,106,0.9)" : "rgba(155,104,68,0.9)" }}
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {contactInfo?.instagram && (
                <a
                  href={contactInfo.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all"
                  style={{ background: C.chipBg, border: `1px solid ${C.chipBorder}`, color: isDark ? "rgba(196,144,106,0.9)" : "rgba(155,104,68,0.9)" }}
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {contactInfo?.twitter && (
                <a
                  href={contactInfo.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all"
                  style={{ background: C.chipBg, border: `1px solid ${C.chipBorder}`, color: isDark ? "rgba(196,144,106,0.9)" : "rgba(155,104,68,0.9)" }}
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {contactInfo?.pinterest && (
                <a
                  href={contactInfo.pinterest}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all"
                  style={{ background: C.chipBg, border: `1px solid ${C.chipBorder}`, color: isDark ? "rgba(196,144,106,0.9)" : "rgba(155,104,68,0.9)" }}
                  aria-label="Pinterest"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 19c-.721 0-1.418-.109-2.073-.312.286-.465.713-1.227.87-1.835l.437-1.664c.229.436.895.804 1.604.804 2.111 0 3.633-1.941 3.633-4.354 0-2.312-1.888-4.042-4.383-4.042-3.104 0-4.688 2.029-4.688 4.191 0 1.025.388 1.938 1.221 2.279.137.056.21.031.243-.084l.23-.944c.019-.081.01-.15-.056-.23-.213-.263-.384-.746-.384-1.194 0-1.16.876-2.278 2.364-2.278 1.289 0 2.211.878 2.211 2.132 0 1.428-.708 2.413-1.622 2.413-.504 0-.883-.417-.762-.928.144-.609.424-1.267.424-1.707 0-.394-.211-.723-.649-.723-.515 0-.928.533-.928 1.249 0 .456.154.764.154.764l-.624 2.642c-.148.621-.082 1.584-.021 2.144C5.757 17.998 3.5 15.238 3.5 12c0-4.687 3.813-8.5 8.5-8.5s8.5 3.813 8.5 8.5-3.813 8.5-8.5 8.5z" />
                  </svg>
                </a>
              )}
            </div>
            <p className="text-xs leading-relaxed" style={{ color: C.muted }}>
              New arrivals, behind-the-scenes, and diamond education — follow along.
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-3" style={{ borderColor: C.borderSoft }}>
          <p className="text-xs" style={{ color: C.muted }}>
            © {new Date().getFullYear()} Flenix Jewels Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs" style={{ color: C.muted }}>
            <Link to="/contact" className="transition-colors" style={{ color: "inherit" }}>
              Support
            </Link>
            <span style={{ opacity: 0.35 }}>•</span>
            <Link to="/buying-guide" className="transition-colors" style={{ color: "inherit" }}>
              Buying Guide
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
