import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Loader2, ChevronRight, Gem, Sparkles } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectGlobalData } from '@/store/contentSlice';
import { getProductsByCategory, getDiamondsByCategory, saveContactSubmission } from '@/lib/storage';
import { sendAdminChatStartEmail, sendAdminInquiryEmail, sendCustomerConfirmationEmail } from '@/lib/emailService';
import type { Product, Diamond, Category, DiamondCategory } from '@/lib/storage';

type ChatStep =
  | 'welcome'
  | 'interest'
  | 'category'
  | 'products'
  | 'inquiry_prompt'
  | 'collect_name'
  | 'collect_phone'
  | 'collect_email'
  | 'submitting'
  | 'done';

interface Message {
  id: string;
  type: 'bot' | 'user';
  text: string;
  options?: { label: string; value: string }[];
  products?: (Product | Diamond)[];
  isTyping?: boolean;
}

const GOLD = 'linear-gradient(135deg,#9B6844 0%,#C4906A 55%,#D4A96A 100%)';

const validateName = (v: string) => {
  const trimmed = v.trim();
  if (trimmed.length < 3) return 'Name must be at least 3 characters.';
  if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) return 'Please enter a real name (letters only).';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return 'Please enter your full name (first and last name).';
  if (parts.some(p => p.length < 2)) return 'Each part of your name should be at least 2 characters.';
  if (/(.)\1{3,}/.test(trimmed.toLowerCase())) return 'Please enter a valid name.';
  return '';
};

const validatePhone = (v: string) => {
  const digits = v.replace(/\D/g, '');
  if (digits.length < 7) return 'Phone number must have at least 7 digits.';
  if (digits.length > 15) return 'Phone number is too long.';
  if (!/^[\d\s\+\-\(\)\.]+$/.test(v.trim())) return 'Please enter a valid phone number.';
  return '';
};

const validateEmail = (v: string) => {
  const trimmed = v.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) return 'Please enter a valid email address.';
  const [local, domain] = trimmed.split('@');
  if (local.length < 2) return 'Please enter a valid email address.';
  if (!domain.includes('.')) return 'Please enter a valid email address.';
  const fakeDomains = ['test.com', 'fake.com', 'example.com', 'abc.com', 'temp.com', 'mailinator.com'];
  if (fakeDomains.some(d => domain.toLowerCase() === d)) return 'Please enter your real email address.';
  return '';
};

let adminNotified = false;

const AIChatWidget = () => {
  const { categories, diamondCategories, products, diamonds } = useAppSelector(selectGlobalData);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState<ChatStep>('welcome');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [selectedInterest, setSelectedInterest] = useState<'jewellery' | 'diamond' | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | DiamondCategory | null>(null);
  const [shownProducts, setShownProducts] = useState<(Product | Diamond)[]>([]);
  const [collected, setCollected] = useState({ name: '', phone: '', email: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  }, []);

  const addMessage = useCallback((msg: Omit<Message, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setMessages(prev => [...prev, { ...msg, id }]);
    scrollToBottom();
    return id;
  }, [scrollToBottom]);

  const addBotMessage = useCallback((text: string, options?: Message['options'], prods?: (Product | Diamond)[]) => {
    const typingId = Math.random().toString(36).slice(2);
    setMessages(prev => [...prev, { id: typingId, type: 'bot', text: '', isTyping: true }]);
    scrollToBottom();
    setTimeout(() => {
      setMessages(prev => prev.map(m =>
        m.id === typingId ? { ...m, text, isTyping: false, options, products: prods } : m
      ));
      scrollToBottom();
    }, 600);
  }, [scrollToBottom]);

  const handleOpen = useCallback(() => {
    setOpen(true);
    if (messages.length === 0) {
      setTimeout(() => {
        addBotMessage(
          "Welcome to Flenix Jewels! ✨ I'm here to help you find the perfect piece. What are you looking for today?",
          [
            { label: '💍 Jewellery', value: 'jewellery' },
            { label: '💎 Diamond', value: 'diamond' },
          ]
        );
        setStep('interest');
        if (!adminNotified) {
          adminNotified = true;
          sendAdminChatStartEmail(window.location.href, navigator.userAgent).catch(() => {});
        }
      }, 200);
    }
  }, [messages.length, addBotMessage]);

  const handleInterestSelect = useCallback((value: string) => {
    const label = value === 'jewellery' ? '💍 Jewellery' : '💎 Diamond';
    addMessage({ type: 'user', text: label });
    setSelectedInterest(value as 'jewellery' | 'diamond');
    const cats = value === 'jewellery' ? categories : diamondCategories;
    if (!cats.length) {
      addBotMessage("Hmm, I couldn't find any categories right now. Please try WhatsApp for immediate help!", [
        { label: 'WhatsApp Us', value: '_whatsapp' }
      ]);
      return;
    }
    setTimeout(() => {
      addBotMessage(
        `Great choice! Which category interests you?`,
        cats.map(c => ({ label: c.name, value: c.id }))
      );
      setStep('category');
    }, 300);
  }, [addMessage, addBotMessage, categories, diamondCategories]);

  const handleCategorySelect = useCallback(async (catId: string, catName: string) => {
    addMessage({ type: 'user', text: catName });
    const cats = selectedInterest === 'jewellery' ? categories : diamondCategories;
    const cat = cats.find(c => c.id === catId) || null;
    setSelectedCategory(cat);

    const typingId = Math.random().toString(36).slice(2);
    setMessages(prev => [...prev, { id: typingId, type: 'bot', text: '', isTyping: true }]);
    scrollToBottom();

    try {
      let prods: (Product | Diamond)[] = [];
      if (selectedInterest === 'jewellery') {
        const fromStore = products.filter(p => p.categoryId === catId);
        prods = fromStore.length ? fromStore : await getProductsByCategory(catId);
      } else {
        const fromStore = diamonds.filter(d => d.diamondCategoryId === catId);
        prods = fromStore.length ? fromStore : await getDiamondsByCategory(catId);
      }
      setShownProducts(prods.slice(0, 6));
      setTimeout(() => {
        setMessages(prev => prev.map(m =>
          m.id === typingId
            ? { ...m, text: prods.length
                ? `Here are some beautiful pieces from our ${catName} collection:`
                : `No pieces available in ${catName} right now. Would you like to make an inquiry?`,
              isTyping: false,
              products: prods.slice(0, 6) }
            : m
        ));
        scrollToBottom();
        setTimeout(() => {
          addBotMessage(
            'Would you like to make an inquiry about any of these? Our team will personally assist you.',
            [
              { label: '✅ Yes, I want to inquire', value: 'yes_inquiry' },
              { label: '↩ View other categories', value: 'back_category' },
            ]
          );
          setStep('inquiry_prompt');
        }, 800);
      }, 700);
    } catch {
      setMessages(prev => prev.filter(m => m.id !== typingId));
      addBotMessage("I couldn't load the products. Would you like to try again or reach us on WhatsApp?", [
        { label: 'Try again', value: `cat_${catId}_${catName}` },
        { label: 'WhatsApp Us', value: '_whatsapp' },
      ]);
    }
  }, [addMessage, addBotMessage, categories, diamondCategories, diamonds, products, scrollToBottom, selectedInterest]);

  const handleOption = useCallback((value: string, label: string) => {
    if (value === '_whatsapp') {
      window.open('https://wa.me/85251254000', '_blank');
      return;
    }
    if (step === 'interest') { handleInterestSelect(value); return; }
    if (step === 'category') { handleCategorySelect(value, label); return; }
    if (step === 'inquiry_prompt') {
      if (value === 'yes_inquiry') {
        addMessage({ type: 'user', text: label });
        setTimeout(() => {
          addBotMessage("Perfect! Let me collect a few details so our team can reach you. 😊\n\nWhat is your full name?");
          setStep('collect_name');
          setTimeout(() => inputRef.current?.focus(), 700);
        }, 200);
      } else if (value === 'back_category') {
        addMessage({ type: 'user', text: label });
        const cats = selectedInterest === 'jewellery' ? categories : diamondCategories;
        setTimeout(() => {
          addBotMessage('Sure! Which category would you like to explore?',
            cats.map(c => ({ label: c.name, value: c.id }))
          );
          setStep('category');
        }, 200);
      }
      return;
    }
  }, [addBotMessage, addMessage, categories, diamondCategories, handleCategorySelect, handleInterestSelect, selectedInterest, step]);

  const handleInputSubmit = useCallback(async () => {
    const val = inputValue.trim();
    let error = '';

    if (step === 'collect_name') {
      error = validateName(val);
      if (error) { setInputError(error); return; }
      setInputError('');
      addMessage({ type: 'user', text: val });
      setCollected(prev => ({ ...prev, name: val }));
      setInputValue('');
      setTimeout(() => {
        addBotMessage(`Nice to meet you, ${val.split(' ')[0]}! 😊\n\nWhat is your phone number?`);
        setStep('collect_phone');
        setTimeout(() => inputRef.current?.focus(), 700);
      }, 200);
    } else if (step === 'collect_phone') {
      error = validatePhone(val);
      if (error) { setInputError(error); return; }
      setInputError('');
      addMessage({ type: 'user', text: val });
      setCollected(prev => ({ ...prev, phone: val }));
      setInputValue('');
      setTimeout(() => {
        addBotMessage('Almost done! What is your email address?');
        setStep('collect_email');
        setTimeout(() => inputRef.current?.focus(), 700);
      }, 200);
    } else if (step === 'collect_email') {
      error = validateEmail(val);
      if (error) { setInputError(error); return; }
      setInputError('');
      addMessage({ type: 'user', text: val });
      const finalData = { ...collected, email: val };
      setCollected(finalData);
      setInputValue('');
      setStep('submitting');

      setTimeout(() => {
        addBotMessage('Just a moment, submitting your details... ⏳');
      }, 200);

      try {
        const interestLabel = selectedInterest === 'jewellery' ? 'Jewellery' : 'Diamond';
        const catName = selectedCategory?.name || 'General';
        const productNames = shownProducts.map(p => p.name);

        await saveContactSubmission({
          name: finalData.name,
          email: finalData.email,
          phone: finalData.phone,
          subject: `AI Chat Inquiry – ${interestLabel} > ${catName}`,
          message: `Interest: ${interestLabel}\nCategory: ${catName}\nProducts shown: ${productNames.join(', ') || 'None'}`,
        });

        await Promise.allSettled([
          sendAdminInquiryEmail({
            name: finalData.name,
            phone: finalData.phone,
            email: finalData.email,
            interest: interestLabel,
            category: catName,
            products: productNames,
          }),
          sendCustomerConfirmationEmail({
            name: finalData.name,
            email: finalData.email,
            interest: interestLabel,
            category: catName,
          }),
        ]);

        setStep('done');
        setTimeout(() => {
          addBotMessage(
            `✅ Thank you, ${finalData.name.split(' ')[0]}! Your inquiry has been submitted.\n\nOur team will reach you on ${finalData.phone} or ${finalData.email} very soon. We've also sent a confirmation to your email.\n\nIs there anything else I can help you with?`,
            [
              { label: '🔄 Start over', value: '_restart' },
              { label: '💬 WhatsApp Us', value: '_whatsapp' },
            ]
          );
        }, 400);
      } catch {
        setStep('collect_email');
        addBotMessage('Something went wrong. Please try again or reach us on WhatsApp.', [
          { label: '💬 WhatsApp Us', value: '_whatsapp' },
        ]);
      }
    }
  }, [addBotMessage, addMessage, collected, selectedCategory, selectedInterest, shownProducts, step, inputValue]);

  const handleRestart = useCallback(() => {
    setMessages([]);
    setStep('welcome');
    setSelectedInterest('');
    setSelectedCategory(null);
    setShownProducts([]);
    setCollected({ name: '', phone: '', email: '' });
    setInputValue('');
    setInputError('');
    setTimeout(() => {
      addBotMessage(
        'Welcome back! What are you looking for today?',
        [{ label: '💍 Jewellery', value: 'jewellery' }, { label: '💎 Diamond', value: 'diamond' }]
      );
      setStep('interest');
    }, 200);
  }, [addBotMessage]);

  const handleOptionClick = useCallback((value: string, label: string) => {
    if (value === '_restart') { handleRestart(); return; }
    handleOption(value, label);
  }, [handleOption, handleRestart]);

  useEffect(() => {
    if (inputRef.current && (step === 'collect_name' || step === 'collect_phone' || step === 'collect_email')) {
      inputRef.current.focus();
    }
  }, [step]);

  const showInput = step === 'collect_name' || step === 'collect_phone' || step === 'collect_email';
  const inputPlaceholder =
    step === 'collect_name' ? 'Enter your full name…' :
    step === 'collect_phone' ? 'Enter your phone number…' :
    step === 'collect_email' ? 'Enter your email address…' : '';

  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-2.5 select-none">
      {/* Chat Panel */}
      {open && (
        <div
          className="flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={{
            width: 'min(360px, calc(100vw - 24px))',
            height: 'min(520px, calc(100vh - 120px))',
            background: '#fff',
            border: '1px solid rgba(196,144,106,0.22)',
            boxShadow: '0 16px 64px -12px rgba(0,0,0,0.22)',
          }}
        >
          {/* Header */}
          <div style={{ background: GOLD }} className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight">Flenix AI Assistant</p>
              <p className="text-white/75 text-[11px] leading-tight">Jewelry & Diamond Expert</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3" style={{ background: '#faf7f3' }}>
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${msg.type === 'user' ? '' : ''}`}>
                  {msg.type === 'bot' && (
                    <div className="flex items-start gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: GOLD }}
                      >
                        <Gem className="w-3 h-3 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {msg.isTyping ? (
                          <div
                            className="inline-flex items-center gap-1 px-3 py-2.5 rounded-2xl rounded-tl-sm"
                            style={{ background: '#fff', border: '1px solid rgba(196,144,106,0.18)' }}
                          >
                            {[0, 1, 2].map(i => (
                              <div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full animate-bounce"
                                style={{ background: '#C4906A', animationDelay: `${i * 0.15}s` }}
                              />
                            ))}
                          </div>
                        ) : (
                          <>
                            <div
                              className="px-3 py-2.5 rounded-2xl rounded-tl-sm text-sm leading-relaxed whitespace-pre-line"
                              style={{
                                background: '#fff',
                                border: '1px solid rgba(196,144,106,0.18)',
                                color: '#1C0D05',
                              }}
                            >
                              {msg.text}
                            </div>

                            {/* Products */}
                            {msg.products && msg.products.length > 0 && (
                              <div className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                {msg.products.map(p => (
                                  <div
                                    key={p.id}
                                    className="flex-shrink-0 rounded-xl overflow-hidden"
                                    style={{
                                      width: 110,
                                      border: '1px solid rgba(196,144,106,0.2)',
                                      background: '#fff',
                                    }}
                                  >
                                    {p.image && (
                                      <img
                                        src={p.image}
                                        alt={p.name}
                                        className="w-full object-cover"
                                        style={{ height: 80 }}
                                        loading="lazy"
                                      />
                                    )}
                                    <div className="px-2 py-1.5">
                                      <p className="text-[11px] font-semibold text-[#1C0D05] leading-tight truncate">{p.name}</p>
                                      {p.price && (
                                        <p className="text-[10px] mt-0.5" style={{ color: '#C4906A' }}>{p.price}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Options */}
                            {msg.options && msg.options.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {msg.options.map(opt => (
                                  <button
                                    key={opt.value}
                                    onClick={() => handleOptionClick(opt.value, opt.label)}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-150 hover:scale-[1.03] active:scale-95"
                                    style={{
                                      background: 'rgba(196,144,106,0.1)',
                                      border: '1px solid rgba(196,144,106,0.35)',
                                      color: '#9B6844',
                                    }}
                                  >
                                    {opt.label}
                                    <ChevronRight className="w-3 h-3 opacity-60" />
                                  </button>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {msg.type === 'user' && (
                    <div
                      className="px-3 py-2.5 rounded-2xl rounded-tr-sm text-sm text-white leading-relaxed"
                      style={{ background: GOLD }}
                    >
                      {msg.text}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          {showInput && (
            <div
              className="flex-shrink-0 px-3 py-2.5"
              style={{ background: '#fff', borderTop: '1px solid rgba(196,144,106,0.15)' }}
            >
              {inputError && (
                <p className="text-[11px] text-red-500 mb-1.5 px-1">{inputError}</p>
              )}
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type={step === 'collect_email' ? 'email' : step === 'collect_phone' ? 'tel' : 'text'}
                  value={inputValue}
                  onChange={e => { setInputValue(e.target.value); setInputError(''); }}
                  onKeyDown={e => { if (e.key === 'Enter') handleInputSubmit(); }}
                  placeholder={inputPlaceholder}
                  className="flex-1 px-3 py-2 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: '#faf7f3',
                    border: `1px solid ${inputError ? '#ef4444' : 'rgba(196,144,106,0.3)'}`,
                    color: '#1C0D05',
                  }}
                  disabled={step === 'submitting'}
                />
                <button
                  onClick={handleInputSubmit}
                  disabled={!inputValue.trim() || step === 'submitting'}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                  style={{ background: GOLD }}
                  aria-label="Send"
                >
                  {step === 'submitting'
                    ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                    : <Send className="w-4 h-4 text-white" />
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Button Row */}
      <div className="flex items-center gap-2.5">
        {!dismissed && !open && (
          <div
            className="flex items-center gap-2 cursor-pointer group animate-in fade-in slide-in-from-right-4 duration-300"
            onClick={handleOpen}
          >
            <div
              className="relative flex items-center pl-4 pr-5 py-2.5 rounded-full shadow-lg transition-all duration-200 group-hover:shadow-xl group-hover:-translate-y-0.5"
              style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)' }}
            >
              <button
                onClick={e => { e.stopPropagation(); setDismissed(true); }}
                className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'rgba(120,120,120,0.15)', color: '#666' }}
                aria-label="Close"
              >
                <X className="h-3 w-3" />
              </button>
              <div>
                <p className="text-[13px] font-semibold leading-tight" style={{ color: '#111' }}>
                  Have a question?
                </p>
                <p className="text-[11px] leading-tight" style={{ color: '#666' }}>
                  We're happy to help
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={open ? () => setOpen(false) : handleOpen}
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl flex-shrink-0"
          style={{ background: '#1a1a2e' }}
          aria-label="Open AI Chat"
        >
          {open ? (
            <X className="h-5 w-5 text-white" />
          ) : (
            <Sparkles className="h-5 w-5 text-white" />
          )}
        </button>
      </div>
    </div>
  );
};

export default AIChatWidget;
