const API_BASE = 'https://flenixjewelsbackend-7ehw.vercel.app';
const ADMIN_EMAIL = 'info@flenixjewels.com';

export const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE}/api/send-mail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html }),
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
};

export const getAIResponse = async (prompt: string): Promise<string> => {
  try {
    const res = await fetch(`${API_BASE}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    return data.data || '';
  } catch {
    return '';
  }
};

const baseTemplate = (bodyContent: string) => `
<div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f3ef;padding:32px 0;margin:0;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#9B6844 0%,#C4906A 55%,#D4A96A 100%);padding:28px 36px;text-align:center;">
      <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.04em;">FLENIX JEWELS LTD</h1>
      <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.8);letter-spacing:0.12em;text-transform:uppercase;">Fine Jewelry · Est. 2015</p>
    </div>
    <div style="padding:32px 36px;">
      ${bodyContent}
    </div>
    <div style="padding:0 36px 28px;text-align:center;">
      <p style="margin:0 0 12px;font-size:13px;color:#9B8070;">Need a faster response? Reach us directly on WhatsApp:</p>
      <a href="https://wa.me/85251254000?text=Hello%20Flenix%20Jewels!%20I%20have%20a%20question." 
         style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#1ea672,#25D366);color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:50px;letter-spacing:0.03em;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18" height="18" style="flex-shrink:0;vertical-align:middle;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        Chat on WhatsApp
      </a>
    </div>
    <div style="background:#f7f3ef;padding:16px 36px;text-align:center;border-top:1px solid #ede5db;">
      <p style="margin:0;font-size:12px;color:#9B8070;">© 2025 Flenix Jewels Ltd · <a href="mailto:info@flenixjewels.com" style="color:#C4906A;text-decoration:none;">info@flenixjewels.com</a></p>
    </div>
  </div>
</div>`;

export const sendAdminChatStartEmail = async (pageUrl: string, userAgent: string) => {
  const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
  const device = /Mobile|Android|iPhone|iPad/.test(userAgent) ? 'Mobile' : 'Desktop';
  const browser = userAgent.includes('Edg') ? 'Edge' : userAgent.includes('Chrome') ? 'Chrome' : userAgent.includes('Firefox') ? 'Firefox' : userAgent.includes('Safari') ? 'Safari' : 'Other';

  const body = `
    <h2 style="color:#1C0D05;font-size:18px;margin:0 0 16px;">💬 New Visitor Started AI Chat</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#9B8070;font-size:13px;width:110px;">Time</td><td style="padding:8px 0;color:#1C0D05;font-size:13px;font-weight:600;">${time} IST</td></tr>
      <tr><td style="padding:8px 0;color:#9B8070;font-size:13px;">Page</td><td style="padding:8px 0;color:#C4906A;font-size:13px;font-weight:600;">${pageUrl}</td></tr>
      <tr><td style="padding:8px 0;color:#9B8070;font-size:13px;">Device</td><td style="padding:8px 0;color:#1C0D05;font-size:13px;font-weight:600;">${device} · ${browser}</td></tr>
    </table>
    <div style="margin-top:20px;padding:14px;background:#fdf8f2;border-radius:8px;border-left:3px solid #C4906A;">
      <p style="margin:0;font-size:13px;color:#9B8070;">A visitor has opened the AI chat widget and may be interested in your jewelry collection.</p>
    </div>`;

  return sendEmail(ADMIN_EMAIL, '💬 New Visitor Started AI Chat – Flenix Jewels', baseTemplate(body));
};

export const sendAdminInquiryEmail = async (data: {
  name: string; phone: string; email: string;
  interest: string; category: string; products: string[];
}) => {
  const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
  const productList = data.products.length
    ? `<ul style="margin:8px 0 0;padding-left:20px;">${data.products.map(p => `<li style="color:#1C0D05;font-size:13px;padding:3px 0;">${p}</li>`).join('')}</ul>`
    : '<p style="color:#9B8070;font-size:13px;margin:4px 0 0;">None specified</p>';

  const body = `
    <h2 style="color:#1C0D05;font-size:18px;margin:0 0 16px;">💎 New Inquiry via AI Chat</h2>
    <div style="background:#fdf8f2;border-radius:10px;padding:20px;margin-bottom:20px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#9B8070;font-size:13px;width:110px;">Name</td><td style="padding:8px 0;color:#1C0D05;font-size:14px;font-weight:700;">${data.name}</td></tr>
        <tr><td style="padding:8px 0;color:#9B8070;font-size:13px;">Phone</td><td style="padding:8px 0;color:#1C0D05;font-size:14px;font-weight:700;">${data.phone}</td></tr>
        <tr><td style="padding:8px 0;color:#9B8070;font-size:13px;">Email</td><td style="padding:8px 0;color:#C4906A;font-size:14px;font-weight:700;">${data.email}</td></tr>
        <tr><td style="padding:8px 0;color:#9B8070;font-size:13px;">Interested In</td><td style="padding:8px 0;color:#1C0D05;font-size:14px;font-weight:700;">${data.interest}</td></tr>
        <tr><td style="padding:8px 0;color:#9B8070;font-size:13px;">Category</td><td style="padding:8px 0;color:#1C0D05;font-size:14px;font-weight:700;">${data.category}</td></tr>
        <tr><td style="padding:8px 0;color:#9B8070;font-size:13px;">Time</td><td style="padding:8px 0;color:#1C0D05;font-size:13px;">${time} IST</td></tr>
      </table>
    </div>
    <p style="color:#1C0D05;font-size:13px;font-weight:600;margin:0 0 4px;">Products Shown:</p>
    ${productList}
    <div style="margin-top:24px;padding:14px;background:#fdf8f2;border-radius:8px;border-left:3px solid #C4906A;">
      <p style="margin:0;font-size:13px;color:#9B8070;">Please follow up with this customer within 24 hours.</p>
    </div>`;

  return sendEmail(ADMIN_EMAIL, `💎 New Inquiry from ${data.name} – Flenix Jewels`, baseTemplate(body));
};

export const sendCustomerConfirmationEmail = async (data: {
  name: string; email: string; interest: string; category: string;
}) => {
  const body = `
    <h2 style="color:#1C0D05;font-size:20px;margin:0 0 8px;">Thank you, ${data.name}! 🌟</h2>
    <p style="color:#5A3D2A;font-size:14px;margin:0 0 20px;">We have received your inquiry and our team will get back to you shortly.</p>
    <div style="background:#fdf8f2;border-radius:10px;padding:20px;margin-bottom:20px;">
      <p style="margin:0 0 12px;font-size:13px;color:#9B8070;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">Your Inquiry Details</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#9B8070;font-size:13px;width:120px;">Interested In</td><td style="padding:6px 0;color:#1C0D05;font-size:13px;font-weight:600;">${data.interest}</td></tr>
        <tr><td style="padding:6px 0;color:#9B8070;font-size:13px;">Category</td><td style="padding:6px 0;color:#1C0D05;font-size:13px;font-weight:600;">${data.category}</td></tr>
      </table>
    </div>
    <p style="color:#5A3D2A;font-size:13px;margin:0 0 6px;">📞 For urgent inquiries, reach us on WhatsApp:</p>
    <p style="margin:0 0 20px;"><a href="https://wa.me/85251254000" style="color:#C4906A;font-weight:700;font-size:14px;">+852 5125 4000</a></p>
    <p style="color:#9B8070;font-size:12px;margin:0;">Flenix Jewels Ltd · GIA Certified · IGI Graded · Worldwide Shipping</p>`;

  return sendEmail(data.email, 'Your Inquiry Received – Flenix Jewels Ltd', baseTemplate(body));
};

export const sendAdminLocationEmail = async (locationData: {
  granted: boolean; city?: string; country?: string; region?: string;
  latitude?: number; longitude?: number; ip?: string; page?: string;
}) => {
  const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
  const mapLink = locationData.latitude && locationData.longitude
    ? `<a href="https://maps.google.com/?q=${locationData.latitude},${locationData.longitude}" style="color:#C4906A;font-size:12px;">View on Google Maps</a>`
    : '';

  const body = `
    <h2 style="color:#1C0D05;font-size:18px;margin:0 0 16px;">📍 Visitor ${locationData.granted ? 'Allowed' : 'Denied'} Location</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#9B8070;font-size:13px;width:110px;">Status</td><td style="padding:8px 0;font-size:13px;font-weight:700;color:${locationData.granted ? '#16a34a' : '#dc2626'};">${locationData.granted ? '✅ Location Granted' : '❌ Location Denied'}</td></tr>
      ${locationData.ip ? `<tr><td style="padding:8px 0;color:#9B8070;font-size:13px;">IP</td><td style="padding:8px 0;color:#1C0D05;font-size:13px;">${locationData.ip}</td></tr>` : ''}
      ${locationData.city ? `<tr><td style="padding:8px 0;color:#9B8070;font-size:13px;">City</td><td style="padding:8px 0;color:#1C0D05;font-size:13px;font-weight:600;">${locationData.city}, ${locationData.region || ''}, ${locationData.country || ''}</td></tr>` : ''}
      ${locationData.latitude ? `<tr><td style="padding:8px 0;color:#9B8070;font-size:13px;">Coordinates</td><td style="padding:8px 0;color:#1C0D05;font-size:13px;">${locationData.latitude.toFixed(4)}, ${locationData.longitude?.toFixed(4)} ${mapLink}</td></tr>` : ''}
      <tr><td style="padding:8px 0;color:#9B8070;font-size:13px;">Page</td><td style="padding:8px 0;color:#C4906A;font-size:13px;">${locationData.page || window.location.href}</td></tr>
      <tr><td style="padding:8px 0;color:#9B8070;font-size:13px;">Time</td><td style="padding:8px 0;color:#1C0D05;font-size:13px;">${time} IST</td></tr>
    </table>`;

  return sendEmail(ADMIN_EMAIL, `📍 Visitor Location ${locationData.granted ? 'Granted' : 'Denied'} – Flenix Jewels`, baseTemplate(body));
};

export const sendAdminContactFormEmail = async (data: {
  name: string; email: string; phone?: string; subject: string; message: string;
}) => {
  const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
  const body = `
    <h2 style="color:#1C0D05;font-size:18px;margin:0 0 16px;">📩 New Contact Form Submission</h2>
    <div style="background:#fdf8f2;border-radius:10px;padding:20px;margin-bottom:20px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#9B8070;font-size:13px;width:100px;">Name</td><td style="padding:8px 0;color:#1C0D05;font-size:14px;font-weight:700;">${data.name}</td></tr>
        <tr><td style="padding:8px 0;color:#9B8070;font-size:13px;">Email</td><td style="padding:8px 0;color:#C4906A;font-size:14px;font-weight:700;">${data.email}</td></tr>
        ${data.phone ? `<tr><td style="padding:8px 0;color:#9B8070;font-size:13px;">Phone</td><td style="padding:8px 0;color:#1C0D05;font-size:14px;font-weight:700;">${data.phone}</td></tr>` : ''}
        <tr><td style="padding:8px 0;color:#9B8070;font-size:13px;">Subject</td><td style="padding:8px 0;color:#1C0D05;font-size:14px;font-weight:700;">${data.subject}</td></tr>
        <tr><td style="padding:8px 0;color:#9B8070;font-size:13px;">Time</td><td style="padding:8px 0;color:#1C0D05;font-size:13px;">${time} IST</td></tr>
      </table>
    </div>
    <p style="color:#1C0D05;font-size:13px;font-weight:600;margin:0 0 8px;">Message:</p>
    <div style="background:#fff;border:1px solid #ede5db;border-radius:8px;padding:16px;">
      <p style="margin:0;color:#5A3D2A;font-size:14px;line-height:1.6;">${data.message.replace(/\n/g, '<br/>')}</p>
    </div>
    <div style="margin-top:20px;padding:14px;background:#fdf8f2;border-radius:8px;border-left:3px solid #C4906A;">
      <p style="margin:0;font-size:13px;color:#9B8070;">Reply directly to this email to respond to the customer.</p>
    </div>`;

  return sendEmail(ADMIN_EMAIL, `📩 New Message from ${data.name} – Flenix Jewels`, baseTemplate(body));
};

export const sendCustomerContactConfirmationEmail = async (data: {
  name: string; email: string; subject: string;
}) => {
  const body = `
    <h2 style="color:#1C0D05;font-size:20px;margin:0 0 8px;">Thank you, ${data.name}! ✉️</h2>
    <p style="color:#5A3D2A;font-size:14px;margin:0 0 20px;">We've received your message and will get back to you within 24–48 hours.</p>
    <div style="background:#fdf8f2;border-radius:10px;padding:20px;margin-bottom:20px;">
      <p style="margin:0 0 8px;font-size:13px;color:#9B8070;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">Your Message Details</p>
      <p style="margin:0;font-size:13px;color:#9B8070;">Subject: <span style="color:#1C0D05;font-weight:600;">${data.subject}</span></p>
    </div>
    <p style="color:#5A3D2A;font-size:13px;margin:0 0 6px;">📞 For urgent inquiries, reach us on WhatsApp:</p>
    <p style="margin:0 0 20px;"><a href="https://wa.me/85251254000" style="color:#C4906A;font-weight:700;font-size:14px;">+852 5125 4000</a></p>
    <p style="color:#9B8070;font-size:12px;margin:0;">Flenix Jewels Ltd · GIA Certified · IGI Graded · Worldwide Shipping</p>`;

  return sendEmail(data.email, 'We received your message – Flenix Jewels Ltd', baseTemplate(body));
};
