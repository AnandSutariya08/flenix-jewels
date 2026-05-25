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

const logoHtml = `<img src="https://flenixjewels.com/og-image.jpg" alt="Flenix Jewels" style="height:40px;margin-bottom:12px;" onerror="this.style.display='none'" />`;

const baseTemplate = (bodyContent: string) => `
<div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f3ef;padding:32px 0;margin:0;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#9B6844 0%,#C4906A 55%,#D4A96A 100%);padding:28px 36px;text-align:center;">
      ${logoHtml}
      <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.04em;">FLENIX JEWELS LTD</h1>
      <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.8);letter-spacing:0.12em;text-transform:uppercase;">Fine Jewelry · Est. 2015</p>
    </div>
    <div style="padding:32px 36px;">
      ${bodyContent}
    </div>
    <div style="background:#f7f3ef;padding:20px 36px;text-align:center;border-top:1px solid #ede5db;">
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
