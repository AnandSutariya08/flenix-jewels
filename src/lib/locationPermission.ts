import { logVisitor } from './analytics';
import { sendAdminLocationEmail } from './emailService';

export const requestLocationAndLog = async () => {
  if (window.location.pathname.startsWith('/admin')) return;

  if (!('geolocation' in navigator)) {
    await logVisitor(false);
    return;
  }

  await new Promise(resolve => setTimeout(resolve, 5000));

  let ipData: { ip?: string; city?: string; region?: string; country_name?: string } = {};
  try {
    const res = await fetch('https://ipapi.co/json/');
    ipData = await res.json();
  } catch {
    // ignore
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      console.log('Location permission granted ✅');
      await logVisitor(true, position.coords);
      sendAdminLocationEmail({
        granted: true,
        city: ipData.city,
        region: ipData.region,
        country: ipData.country_name,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        ip: ipData.ip,
        page: window.location.href,
      }).catch(() => {});
    },
    async (error) => {
      console.log('Location denied or error:', error.message);
      await logVisitor(false);
      sendAdminLocationEmail({
        granted: false,
        city: ipData.city,
        region: ipData.region,
        country: ipData.country_name,
        ip: ipData.ip,
        page: window.location.href,
      }).catch(() => {});
    },
    {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0,
    }
  );
};
