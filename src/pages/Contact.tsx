import { useMemo, useState, useRef, useEffect } from "react";
import Header from '@/components/Header';
import MiniHeader from '@/components/MiniHeader';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import PageHero from "@/components/PageHero";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalData } from "@/store/contentSlice";
import { useHeaderOffset } from "@/hooks/useHeaderOffset";
import { cleanWhatsApp } from "@/lib/utils";
import { SITE } from "@/lib/seo";
import { saveContactSubmission } from "@/lib/storage";
import { sendAdminContactFormEmail, sendCustomerContactConfirmationEmail } from "@/lib/emailService";
import { MapPin, Phone, Mail, Clock, Send, Flag, Loader2, Gem, MessageCircle, ChevronRight } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from 'sonner';
import hero5 from "@/assets/hero5.png";

const GOLD = 'linear-gradient(135deg, #9B6844 0%, #C4906A 55%, #D4A96A 100%)';
const CONTACT_WHATSAPP_NUMBER = '+852 51254000';

function useReveal(_threshold = 0.1) {
  const ref = useRef<HTMLElement>(null);
  return { ref, visible: true };
}

const Contact = () => {
  const { categories, promoHeader, contactInfo, offices } = useAppSelector(selectGlobalData);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formReveal = useReveal(0.08);
  const infoReveal = useReveal(0.08);
  const officesReveal = useReveal(0.08);

  const paddingTop = useHeaderOffset();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const submissionData = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject: subject.trim(),
        message: message.trim(),
      };
      await saveContactSubmission(submissionData);
      await Promise.allSettled([
        sendAdminContactFormEmail(submissionData),
        sendCustomerContactConfirmationEmail({ name: submissionData.name, email: submissionData.email, subject: submissionData.subject }),
      ]);
      setName(''); setEmail(''); setPhone(''); setSubject(''); setMessage('');
      toast.success('Message sent! We will get back to you soon.');
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedOffices = useMemo(
    () => [...offices].sort((a, b) => (a.isHeadquarters ? -1 : 0) - (b.isHeadquarters ? -1 : 0)),
    [offices]
  );

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "@id": `${SITE.url}/contact#contactpage`,
      name: "Contact Flenix Jewels Ltd — Diamond Jewelry Store",
      description:
        "Contact Flenix Jewels Ltd for GIA certified diamonds, custom jewelry designs, engagement rings, wholesale orders. Global offices. 24/7 WhatsApp support.",
      url: `${SITE.url}/contact`,
      inLanguage: "en-US",
      mainEntityOfPage: `${SITE.url}/contact`,
    },
    {
      "@context": "https://schema.org",
      "@type": ["JewelryStore", "LocalBusiness"],
      "@id": `${SITE.url}/#local-business`,
      name: SITE.name,
      description:
        "Premium diamond and gold jewelry store. GIA and IGI certified natural and lab-grown diamonds. Engagement rings, wedding bands, necklaces, earrings, bracelets. Worldwide shipping.",
      url: SITE.url,
      telephone: contactInfo?.phone || SITE.phonePrimary,
      email: contactInfo?.email || SITE.email,
      logo: SITE.logo,
      image: SITE.ogImage,
      priceRange: "$$$",
      currenciesAccepted: "USD",
      paymentAccepted: "Credit Card, Bank Transfer, Wire Transfer",
      address: [
        {
          "@type": "PostalAddress",
          streetAddress: SITE.addressUsa.street,
          addressLocality: SITE.addressUsa.locality,
          addressRegion: SITE.addressUsa.region,
          postalCode: SITE.addressUsa.postalCode,
          addressCountry: SITE.addressUsa.country,
        },
        {
          "@type": "PostalAddress",
          addressLocality: SITE.addressIndia.locality,
          addressRegion: SITE.addressIndia.region,
          addressCountry: SITE.addressIndia.country,
        },
      ],
      geo: {
        "@type": "GeoCoordinates",
        latitude: SITE.geo.latitude,
        longitude: SITE.geo.longitude,
      },
      hasMap: `https://maps.google.com/?q=${SITE.geo.latitude},${SITE.geo.longitude}`,
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "09:00",
          closes: "18:00",
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Saturday"],
          opens: "10:00",
          closes: "16:00",
        },
      ],
      areaServed: SITE.areaServed,
      sameAs: [...SITE.sameAs],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "1250",
        bestRating: "5",
        worstRating: "1",
      },
    },
  ];
  const faqItems = [
    {
      question: "How can I contact Flenix Jewels Ltd?",
      answer: `You can contact us via WhatsApp at ${SITE.phoneWhatsApp}, email at ${SITE.email}, or through our online contact form. We respond within a few hours on business days.`,
    },
    {
      question: "Do you offer custom jewelry design?",
      answer: "Yes. We provide full bespoke design and manufacturing for engagement rings, wedding bands, necklaces, earrings, and bracelets in 14KT and 18KT gold and platinum.",
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes. We offer free insured express shipping to USA, Canada, Australia, Germany, UK, India, and 15+ more countries worldwide.",
    },
    {
      question: "What are your business hours?",
      answer: "We are available Monday to Friday, 9:00 AM – 6:00 PM IST, and Saturday 10:00 AM – 4:00 PM IST. WhatsApp messages are monitored outside these hours.",
    },
    {
      question: "Do you handle wholesale diamond jewelry orders?",
      answer: "Yes. We supply wholesale diamond and gold jewelry to retailers and designers globally. Please contact us via WhatsApp or the enquiry form with your requirements.",
    },
    {
      question: "Where are your offices located?",
      answer: `Our manufacturing headquarters is in Surat, Gujarat, India — the world's diamond polishing capital. We also have a US office at ${SITE.addressUsa.street}, ${SITE.addressUsa.locality}, ${SITE.addressUsa.region}.`,
    },
  ];

  const inputBase = "w-full px-4 py-3.5 rounded-xl text-sm font-medium outline-none transition-all duration-200 bg-[#F5EDE3] dark:bg-[#1a0c06] text-[#1C0D05] dark:text-[#F5E8D8] placeholder:text-[#C4A080] dark:placeholder:text-[#5A4030] border border-transparent focus:border-[#C4906A] dark:focus:border-[#C4906A]";

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F2] dark:bg-[#0a0603]">
      <SEOHead
        title="Contact Us - Diamond Jewelry Inquiries & Custom Orders | Flenix Jewels Ltd"
        description="Contact Flenix Jewels Ltd for GIA certified diamonds, custom jewelry designs, engagement rings, wholesale orders. Global offices. 24/7 WhatsApp support."
        keywords="contact flenix jewels, jewelry store contact, diamond jewelry inquiries, custom jewelry design, wholesale diamond jewelry"
        canonicalUrl="https://www.flenixjewels.com/contact"
        structuredData={structuredData}
        breadcrumbs={[{ name: "Home", url: "https://www.flenixjewels.com" }, { name: "Contact", url: "https://www.flenixjewels.com/contact" }]}
        faqItems={faqItems}
      />
      <Header promoHeader={promoHeader} />
      {/* <MiniHeader categories={categories} promoHeight={promoHeight} /> */}

      <main className="flex-1" style={{ paddingTop: `${paddingTop}px` }}>

        {/* ── Hero ── */}
        <PageHero
          backgroundImage={hero5}
          eyebrow={
            <span className="inline-flex items-center justify-center gap-2">
              <MessageCircle className="h-3 w-3" />
              <span>Reach Out</span>
            </span>
          }
          title={
            <>
              Let's{" "}
              <span style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Talk
              </span>
            </>
          }
          subtitle="Whether you have a question, a custom design in mind, or a wholesale inquiry — our team is ready to help."
        />

        {/* Quick contact pills (kept separate so hero height stays consistent) */}
    

        {/* ── Form + Info ── */}
        <section className="py-16 md:py-24 bg-[#FDF8F2] dark:bg-[#0e0805]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 grid lg:grid-cols-[1fr_420px] gap-10 xl:gap-14">

            {/* Form */}
            <div
              ref={formReveal.ref as React.RefObject<HTMLDivElement>}
              style={{ opacity: formReveal.visible ? 1 : 0, transform: formReveal.visible ? 'translateX(0)' : 'translateX(-24px)', transition: 'opacity 0.8s ease, transform 0.8s ease' }}
            >
              <div
                className="rounded-3xl p-8 md:p-10 bg-white dark:bg-[#150a04]"
                style={{ border: '1px solid rgba(196,144,106,0.18)', boxShadow: '0 8px 48px -12px rgba(0,0,0,0.10)' }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-px w-6" style={{ background: GOLD }} />
                  <span className="text-[10px] tracking-[0.32em] uppercase font-black" style={{ color: '#C4906A' }}>Send a Message</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-8 text-[#1C0D05] dark:text-[#F5E8D8]">
                  How can we help you?
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] tracking-[0.18em] uppercase font-black mb-2 text-[#9B8070] dark:text-[#7A6050]">Your Name *</label>
                      <input
                        id="name" type="text" value={name} onChange={e => setName(e.target.value)}
                        placeholder="John Doe" required
                        className={inputBase}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] tracking-[0.18em] uppercase font-black mb-2 text-[#9B8070] dark:text-[#7A6050]">Your Email *</label>
                      <input
                        id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="john@example.com" required
                        className={inputBase}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] tracking-[0.18em] uppercase font-black mb-2 text-[#9B8070] dark:text-[#7A6050]">Phone Number</label>
                      <input
                        id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                        placeholder="+1 234 567 8900"
                        className={inputBase}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] tracking-[0.18em] uppercase font-black mb-2 text-[#9B8070] dark:text-[#7A6050]">Subject *</label>
                      <input
                        id="subject" type="text" value={subject} onChange={e => setSubject(e.target.value)}
                        placeholder="e.g. Custom engagement ring inquiry" required
                        className={inputBase}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] tracking-[0.18em] uppercase font-black mb-2 text-[#9B8070] dark:text-[#7A6050]">Message *</label>
                    <textarea
                      id="message" value={message} onChange={e => setMessage(e.target.value)}
                      placeholder="Tell us more about what you're looking for..." rows={6} required
                      className={`${inputBase} resize-none`}
                    />
                  </div>
                  <button
                    type="submit" disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-3 font-bold text-sm tracking-[0.12em] uppercase py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: GOLD, color: '#fff', boxShadow: '0 8px 28px -8px rgba(155,104,68,0.55)' }}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Sending…</>
                    ) : (
                      <><Send className="h-4 w-4" />Send Message</>
                    )}
                  </button>
                  <p className="text-center text-[11px] text-[#B89878] dark:text-[#6A5040]">
                    We will review your message and get back to you shortly.
                  </p>
                </form>
              </div>
            </div>

            {/* Info panel */}
            <div
              ref={infoReveal.ref as React.RefObject<HTMLDivElement>}
              className="flex flex-col gap-5"
              style={{ opacity: infoReveal.visible ? 1 : 0, transform: infoReveal.visible ? 'translateX(0)' : 'translateX(24px)', transition: 'opacity 0.8s ease 0.15s, transform 0.8s ease 0.15s' }}
            >
              {/* WhatsApp CTA card */}
              <div
                className="relative overflow-hidden rounded-3xl p-7"
                style={{ background: 'linear-gradient(160deg, #0d2d23 0%, #114b3b 55%, #16614b 100%)', border: '1px solid rgba(37,211,102,0.24)', boxShadow: '0 12px 42px -10px rgba(18,140,126,0.34)' }}
              >
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(37,211,102,0.16), transparent 70%)' }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <FaWhatsapp className="h-5 w-5" style={{ color: '#25D366' }} />
                    <span className="text-[10px] tracking-[0.28em] uppercase font-black" style={{ color: '#9BF0C0' }}>Fastest Response</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Chat on WhatsApp</h3>
                  <p className="text-sm mb-5" style={{ color: 'rgba(236,255,244,0.72)' }}>Get a reply within minutes for product queries, pricing, or custom designs.</p>
                  <a
                    href={`https://wa.me/${cleanWhatsApp(CONTACT_WHATSAPP_NUMBER)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 w-full font-bold text-sm tracking-wider uppercase py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.03] active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #1ea672, #25D366)', color: '#fff', boxShadow: '0 10px 26px -8px rgba(37,211,102,0.52)' }}
                  >
                    <FaWhatsapp className="h-4 w-4" />
                    Start Chat
                  </a>
                </div>
              </div>

              {/* Contact info cards */}
              {[
               
                contactInfo?.phone && {
                  icon: Phone, label: 'Phone', value: contactInfo.phone, href: `tel:${contactInfo.phone}`,
                },
                contactInfo?.email && {
                  icon: Mail, label: 'Email', value: contactInfo.email, href: `mailto:${contactInfo.email}`,
                },
                {
                  icon: Clock, label: 'Business Hours',
                  value: 'Mon–Sat: 10:00 AM – 8:00 PM', sub: 'Sunday: Closed', href: null,
                },
              ].filter(Boolean).map((item: any, i) => (
                <div
                  key={i}
                  className="flex gap-4 items-start p-5 rounded-2xl bg-white dark:bg-[#150a04]"
                  style={{ border: '1px solid rgba(196,144,106,0.16)', boxShadow: '0 2px 16px -4px rgba(0,0,0,0.07)' }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: item.iconBackground || 'rgba(196,144,106,0.12)', border: item.iconBorder || '1px solid rgba(196,144,106,0.2)' }}
                  >
                    <item.icon className="h-4.5 w-4.5 h-[18px] w-[18px]" style={{ color: item.iconColor || '#C4906A' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] tracking-[0.2em] uppercase font-black mb-1 text-[#9B8070] dark:text-[#6A5040]">{item.label}</p>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.label === 'WhatsApp' ? '_blank' : undefined}
                        rel={item.label === 'WhatsApp' ? 'noopener noreferrer' : undefined}
                        className="text-sm font-bold text-[#1C0D05] dark:text-[#F5E8D8] hover:text-[#C4906A] dark:hover:text-[#C4906A] transition-colors truncate block"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm font-bold text-[#1C0D05] dark:text-[#F5E8D8]">{item.value}</p>
                    )}
                    {item.sub && <p className="text-xs text-[#9B8070] dark:text-[#6A5040] mt-0.5">{item.sub}</p>}
                  </div>
                  {item.href && <ChevronRight className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'rgba(196,144,106,0.4)' }} />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Offices ── */}
        {sortedOffices.length > 0 && (
          <section
            ref={officesReveal.ref as React.RefObject<HTMLElement>}
            className="py-16 md:py-24 bg-[#F5EDE3] dark:bg-[#0a0603]"
            style={{ opacity: officesReveal.visible ? 1 : 0, transform: officesReveal.visible ? 'translateY(0)' : 'translateY(28px)', transition: 'opacity 0.8s ease, transform 0.8s ease' }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, transparent, #C4906A)' }} />
                  <Gem className="h-3.5 w-3.5" style={{ color: '#C4906A' }} />
                  <span className="text-[10px] tracking-[0.35em] uppercase font-black" style={{ color: '#C4906A' }}>Worldwide</span>
                  <Gem className="h-3.5 w-3.5" style={{ color: '#C4906A' }} />
                  <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, #C4906A, transparent)' }} />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-[#1C0D05] dark:text-[#F5E8D8]">Our Global Presence</h2>
                <p className="mt-3 text-base text-[#9B8070] dark:text-[#7A6050]">Visit us at any of our offices worldwide</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {sortedOffices.map((office) => (
                  <div
                    key={office.id}
                    className="group relative overflow-hidden rounded-2xl p-6 bg-white dark:bg-[#150a04]"
                    style={{ border: '1px solid rgba(196,144,106,0.16)', boxShadow: '0 4px 24px -6px rgba(0,0,0,0.09)', transition: 'border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(196,144,106,0.45)'; el.style.boxShadow = '0 12px 40px -10px rgba(196,144,106,0.2)'; el.style.transform = 'translateY(-4px)'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(196,144,106,0.16)'; el.style.boxShadow = '0 4px 24px -6px rgba(0,0,0,0.09)'; el.style.transform = 'translateY(0)'; }}
                  >
                    {/* HQ badge */}
                    {office.isHeadquarters && (
                      <div className="absolute top-4 right-4 text-[9px] font-black tracking-[0.2em] uppercase px-3 py-1.5 rounded-full" style={{ background: GOLD, color: '#fff' }}>
                        HQ
                      </div>
                    )}

                    {/* Flag + city */}
                    <div className="flex items-start gap-3.5 mb-5">
                      {office.flagImage ? (
                        <img
                          src={office.flagImage}
                          alt={`${office.country} flag`}
                          className="w-12 h-8 object-cover rounded-md flex-shrink-0 shadow-sm"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(196,144,106,0.1)' }}>
                          <Flag className="h-5 w-5" style={{ color: '#C4906A' }} />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-[#1C0D05] dark:text-[#F5E8D8] leading-tight">{office.city}</h3>
                        <p className="text-[11px] tracking-[0.15em] uppercase font-bold text-[#9B8070] dark:text-[#6A5040]">{office.country}</p>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px mb-5" style={{ background: 'rgba(196,144,106,0.16)' }} />

                    {/* Details */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: '#C4906A' }} />
                        <p className="text-sm leading-relaxed text-[#5A3D2A] dark:text-[#B89880]">{office.address}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 flex-shrink-0" style={{ color: '#C4906A' }} />
                        <a href={`tel:${office.phone}`} className="text-sm font-bold text-[#1C0D05] dark:text-[#F5E8D8] hover:text-[#C4906A] dark:hover:text-[#C4906A] transition-colors">
                          {office.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 flex-shrink-0" style={{ color: '#C4906A' }} />
                        <a href={`mailto:${office.email}`} className="text-sm font-bold text-[#1C0D05] dark:text-[#F5E8D8] hover:text-[#C4906A] dark:hover:text-[#C4906A] transition-colors truncate">
                          {office.email}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
