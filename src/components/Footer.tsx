import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Linkedin,
  Youtube,
} from "lucide-react";
import logo from "@/assets/flenix-logo-full.png";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalData } from "@/store/contentSlice";
import { useTheme } from "next-themes";
import { cleanWhatsApp } from "@/lib/utils";
import { FaWhatsapp } from "react-icons/fa";
import GIA from "@/assets/paylogo/GIA_Logo.png";
import Rapaport from "@/assets/paylogo/Rapaport-header-20250120083212-20250210092659-20250227142926-20250310094122.svg";
import IGI from "@/assets/igi-logo.png";
import VDB from "@/assets/vdb-logo.png";

const FOOTER_WHATSAPP_NUMBER = "+852 51254000";

export default function Footer() {
  const { contactInfo } = useAppSelector(selectGlobalData);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const whatsappUrl = `https://wa.me/${cleanWhatsApp(FOOTER_WHATSAPP_NUMBER)}`;

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
            certBg: "rgba(255,255,255,0.05)",
            certBorder: "rgba(196,144,106,0.12)",
          }
        : {
            footerBg:
              "linear-gradient(180deg, rgba(255,252,248,1) 0%, rgba(250,244,236,1) 100%)",
            border: "rgba(196,144,106,0.22)",
            borderSoft: "rgba(155,104,68,0.14)",
            panelBg: "rgba(155,104,68,0.05)",
            chipBg: "rgba(255,255,255,0.70)",
            chipBorder: "rgba(196,144,106,0.18)",
            gold: "rgba(155,104,68,0.85)",
            text: "rgba(20,12,6,0.78)",
            muted: "rgba(20,12,6,0.55)",
            hover: "#130900",
            certBg: "rgba(255,255,255,0.80)",
            certBorder: "rgba(196,144,106,0.15)",
          },
    [isDark],
  );

  const certifications = useMemo(
    () => [
      { name: "GIA", logo: GIA },
      { name: "IGI", logo: IGI },
      { name: "Rapaport", logo: Rapaport },
      { name: "VDB", logo: VDB },
    ],
    [],
  );

  const links = useMemo(
    () => [
      { label: "Home", path: "/" },
      { label: "Categories", path: "/categories" },
      { label: "Diamond", path: "/diamond" },
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
        {/* Certifications & Memberships Strip — top of footer */}
        <div
          className="pb-8 mb-8 border-b"
          style={{ borderColor: C.borderSoft }}
        >
          <p
            className="text-sm font-black tracking-[0.28em] uppercase text-center mb-5"
            style={{ color: C.muted }}
          >
            Certified &amp; Trusted By
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {certifications.map((cert) => (
              <div
                key={cert.name}
                className="flex items-center justify-center rounded-2xl px-5 py-3 transition-opacity hover:opacity-80"
                style={{
                  background: C.certBg,
                  border: `1px solid ${C.certBorder}`,
                  minWidth: 90,
                  height: 56,
                }}
                title={cert.name}
              >
                <img
                  src={cert.logo}
                  alt={cert.name}
                  className="max-h-8 w-auto object-contain"
                  style={{
                    filter: isDark ? "brightness(0.85) saturate(0.65)" : "none",
                  }}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
          {/* Column 1: Brand */}
          <div className="space-y-4 flex flex-col items-center text-center">
            <img
              src={logo}
              alt="Flenix Jewels Ltd"
              className="h-10 w-auto object-contain"
              style={{ filter: isDark ? "brightness(1.1)" : "none" }}
            />
            <p
              className="text-sm font-black tracking-[0.22em] uppercase"
              style={{ color: C.gold }}
            >
              Flenix Jewels Ltd
            </p>
            <p className="text-sm leading-relaxed" style={{ color: C.text }}>
              Elegant jewellery crafted with precision, authenticity, and
              timeless beauty. Discover our natural and lab-grown diamond
              jewellery collections for every occasion.
            </p>
            {/* <div className="flex flex-row gap-2 w-full">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-[11px] font-black tracking-[0.18em] uppercase transition-all hover:opacity-80"
                style={{
                  background: isDark
                    ? "rgba(196,144,106,0.12)"
                    : "rgba(155,104,68,0.08)",
                  border: `1px solid ${C.chipBorder}`,
                  color: C.gold,
                }}
              >
                <FaWhatsapp className="h-4 w-4 flex-shrink-0" />
                WhatsApp
              </a>
              <a
                href={`mailto:${contactInfo?.email || "info@flenixjewels.com"}`}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-[11px] font-black tracking-[0.18em] uppercase transition-all hover:opacity-80"
                style={{
                  background: isDark
                    ? "rgba(196,144,106,0.12)"
                    : "rgba(155,104,68,0.08)",
                  border: `1px solid ${C.chipBorder}`,
                  color: C.gold,
                }}
              >
                <Mail className="h-4 w-4 flex-shrink-0" />
                Email
              </a>
            </div> */}
          </div>

          {/* Column 2: Explore */}
          <div className="space-y-4">
            <p
              className="text-sm font-black tracking-[0.22em] uppercase"
              style={{ color: C.gold }}
            >
              Explore
            </p>
            <ul className="space-y-2.5">
              {links.map((l) => (
                <li key={l.path}>
                  <Link
                    to={l.path}
                    className="group inline-flex items-center gap-2 text-sm transition-colors"
                    style={{ color: C.text }}
                  >
                    <ChevronRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      style={{
                        color: isDark
                          ? "rgba(196,144,106,0.7)"
                          : "rgba(155,104,68,0.55)",
                      }}
                    />
                    <span
                      className="transition-colors"
                      style={{ color: "inherit" }}
                    >
                      {l.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-4">
            <p
              className="text-sm font-black tracking-[0.22em] uppercase"
              style={{ color: C.gold }}
            >
              Contact Us
            </p>
            <ul className="space-y-3 text-sm" style={{ color: C.text }}>
              {contactInfo?.address && (
                <li className="flex items-start gap-3">
                  <MapPin
                    className="h-4 w-4 mt-0.5 flex-shrink-0"
                    style={{ color: C.gold }}
                  />
                  <span className="leading-relaxed">{contactInfo.address}</span>
                </li>
              )}
              <li className="flex items-center gap-3">
                <FaWhatsapp
                  className="h-4 w-4 flex-shrink-0"
                  style={{ color: C.gold }}
                />
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors"
                  style={{ color: "inherit" }}
                >
                  {FOOTER_WHATSAPP_NUMBER}
                </a>
              </li>
              {contactInfo?.phone ? (
                <li className="flex items-center gap-3">
                  <Phone
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: C.gold }}
                  />
                  <a
                    href={`tel:${contactInfo.phone}`}
                    className="transition-colors"
                    style={{ color: "inherit" }}
                  >
                    {contactInfo.phone}
                  </a>
                </li>
              ) : null}
              {contactInfo?.email && (
                <li className="flex items-center gap-3">
                  <Mail
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: C.gold }}
                  />
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="transition-colors break-all"
                    style={{ color: "inherit" }}
                  >
                    {contactInfo.email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Column 4: Follow + Map */}
          <div className="space-y-4">
            <p
              className="text-sm font-black tracking-[0.22em] uppercase"
              style={{ color: C.gold }}
            >
              Follow Us
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative group w-11 h-11 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: C.chipBg,
                  border: `1px solid ${C.chipBorder}`,
                  color: isDark
                    ? "rgba(196,144,106,0.9)"
                    : "rgba(155,104,68,0.9)",
                }}
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="h-5 w-5" />
                <span
                  className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-wide px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                  style={{
                    background: C.chipBg,
                    color: C.gold,
                    border: `1px solid ${C.chipBorder}`,
                  }}
                >
                  WhatsApp
                </span>
              </a>
              {contactInfo?.facebook && (
                <a
                  href={contactInfo.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group w-11 h-11 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: C.chipBg,
                    border: `1px solid ${C.chipBorder}`,
                    color: isDark
                      ? "rgba(196,144,106,0.9)"
                      : "rgba(155,104,68,0.9)",
                  }}
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                  <span
                    className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-wide px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    style={{
                      background: C.chipBg,
                      color: C.gold,
                      border: `1px solid ${C.chipBorder}`,
                    }}
                  >
                    Facebook
                  </span>
                </a>
              )}
              {contactInfo?.instagram && (
                <a
                  href={contactInfo.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group w-11 h-11 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: C.chipBg,
                    border: `1px solid ${C.chipBorder}`,
                    color: isDark
                      ? "rgba(196,144,106,0.9)"
                      : "rgba(155,104,68,0.9)",
                  }}
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                  <span
                    className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-wide px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    style={{
                      background: C.chipBg,
                      color: C.gold,
                      border: `1px solid ${C.chipBorder}`,
                    }}
                  >
                    Instagram
                  </span>
                </a>
              )}
              {contactInfo?.twitter && (
                <a
                  href={contactInfo.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group w-11 h-11 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: C.chipBg,
                    border: `1px solid ${C.chipBorder}`,
                    color: isDark
                      ? "rgba(196,144,106,0.9)"
                      : "rgba(155,104,68,0.9)",
                  }}
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                  <span
                    className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-wide px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    style={{
                      background: C.chipBg,
                      color: C.gold,
                      border: `1px solid ${C.chipBorder}`,
                    }}
                  >
                    Twitter
                  </span>
                </a>
              )}
              {contactInfo?.pinterest && (
                <a
                  href={contactInfo.pinterest}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group w-11 h-11 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: C.chipBg,
                    border: `1px solid ${C.chipBorder}`,
                    color: isDark
                      ? "rgba(196,144,106,0.9)"
                      : "rgba(155,104,68,0.9)",
                  }}
                  aria-label="Pinterest"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 19c-.721 0-1.418-.109-2.073-.312.286-.465.713-1.227.87-1.835l.437-1.664c.229.436.895.804 1.604.804 2.111 0 3.633-1.941 3.633-4.354 0-2.312-1.888-4.042-4.383-4.042-3.104 0-4.688 2.029-4.688 4.191 0 1.025.388 1.938 1.221 2.279.137.056.21.031.243-.084l.23-.944c.019-.081.01-.15-.056-.23-.213-.263-.384-.746-.384-1.194 0-1.16.876-2.278 2.364-2.278 1.289 0 2.211.878 2.211 2.132 0 1.428-.708 2.413-1.622 2.413-.504 0-.883-.417-.762-.928.144-.609.424-1.267.424-1.707 0-.394-.211-.723-.649-.723-.515 0-.928.533-.928 1.249 0 .456.154.764.154.764l-.624 2.642c-.148.621-.082 1.584-.021 2.144C5.757 17.998 3.5 15.238 3.5 12c0-4.687 3.813-8.5 8.5-8.5s8.5 3.813 8.5 8.5-3.813 8.5-8.5 8.5z" />
                  </svg>
                  <span
                    className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-wide px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    style={{
                      background: C.chipBg,
                      color: C.gold,
                      border: `1px solid ${C.chipBorder}`,
                    }}
                  >
                    Pinterest
                  </span>
                </a>
              )}
              {contactInfo?.youtube && (
                <a
                  href={contactInfo.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group w-11 h-11 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: C.chipBg,
                    border: `1px solid ${C.chipBorder}`,
                    color: isDark
                      ? "rgba(196,144,106,0.9)"
                      : "rgba(155,104,68,0.9)",
                  }}
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                  <span
                    className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-wide px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    style={{
                      background: C.chipBg,
                      color: C.gold,
                      border: `1px solid ${C.chipBorder}`,
                    }}
                  >
                    YouTube
                  </span>
                </a>
              )}
              {contactInfo?.linkedin && (
                <a
                  href={contactInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group w-11 h-11 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: C.chipBg,
                    border: `1px solid ${C.chipBorder}`,
                    color: isDark
                      ? "rgba(196,144,106,0.9)"
                      : "rgba(155,104,68,0.9)",
                  }}
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                  <span
                    className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-wide px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    style={{
                      background: C.chipBg,
                      color: C.gold,
                      border: `1px solid ${C.chipBorder}`,
                    }}
                  >
                    LinkedIn
                  </span>
                </a>
              )}
            </div>
            <p className="text-xs leading-relaxed" style={{ color: C.muted }}>
              New arrivals, behind-the-scenes, and diamond education — follow
              along.
            </p>

            {/* Google Maps embed */}
            <div
              className="mt-2 overflow-hidden rounded-xl"
              style={{
                border: `1px solid ${C.border}`,
                boxShadow: isDark
                  ? "0 4px 16px rgba(0,0,0,0.35)"
                  : "0 2px 10px rgba(0,0,0,0.08)",
              }}
            >
              <iframe
                title="Flenix Jewels Ltd Location"
                src="https://maps.google.com/maps?q=Hart+Avenue+Plaza,+5-9+Hart+Avenue,+Tsim+Sha+Tsui,+Kowloon,+Hong+Kong&output=embed&z=16"
                width="100%"
                height="180"
                style={{
                  display: "block",
                  border: 0,
                  filter: isDark ? "brightness(0.85) saturate(0.8)" : "none",
                }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="mt-8 pt-6 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-3"
          style={{ borderColor: C.borderSoft }}
        >
          <p className="text-xs" style={{ color: C.muted }}>
            © {new Date().getFullYear()} Flenix Jewels Ltd. All rights
            reserved.
          </p>
          {/* <div
            className="flex items-center gap-4 text-xs"
            style={{ color: C.muted }}
          >
            <Link
              to="/contact"
              className="transition-colors"
              style={{ color: "inherit" }}
            >
              Support
            </Link>
            <span style={{ opacity: 0.35 }}>•</span>
            <Link
              to="/buying-guide"
              className="transition-colors"
              style={{ color: "inherit" }}
            >
              Buying Guide
            </Link>
          </div> */}
        </div>
      </div>
    </footer>
  );
}
