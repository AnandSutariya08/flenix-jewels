// lib/analytics.ts
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const VISITOR_KEY_PREFIX = 'flenix_visitor_logged';

const getDailyVisitorKey = () => {
  const host = window.location.hostname;
  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `${VISITOR_KEY_PREFIX}:${host}:${day}`;
};

/**
 * Logs a visitor at most once per browser per day per host.
 * Returns true only when a new visitor doc was actually written —
 * callers use this to avoid sending a notification email for a
 * duplicate/repeat visit that the admin panel won't show as new.
 */
export const logVisitor = async (
  grantedLocation: boolean = false,
  coords?: GeolocationCoordinates
): Promise<boolean> => {
  // Never log admin page visits
  if (window.location.pathname.startsWith('/admin')) return false;

  const dailyKey = getDailyVisitorKey();

  // Log at most once per browser per day per host
  if (localStorage.getItem(dailyKey) === 'true') {
    console.log('Visitor already logged today - skipping duplicate');
    return false;
  }

  try {
    const ipResponse = await fetch('https://ipapi.co/json/');
    const ipData = await ipResponse.json();

    // Parse user agent for device and browser info
    const userAgent = navigator.userAgent;
    const browserInfo = {
      browser: userAgent.includes('Edg') ? 'Edge' :
              userAgent.includes('Chrome') ? 'Chrome' :
              userAgent.includes('Firefox') ? 'Firefox' :
              userAgent.includes('Safari') ? 'Safari' : 'Other',
      device: /Mobile|Android|iPhone|iPad/.test(userAgent) ? 'Mobile' : 'Desktop',
      os: userAgent.includes('Windows') ? 'Windows' :
          userAgent.includes('Mac') ? 'MacOS' :
          userAgent.includes('Android') ? 'Android' :
          /iPhone|iPad|iPod/.test(userAgent) ? 'iOS' :
          userAgent.includes('Linux') ? 'Linux' : 'Other'
    };

    const logData: any = {
      hostname: window.location.hostname,
      origin: window.location.origin,
      referrer: document.referrer || null,

      ip: ipData.ip || 'unknown',
      country: ipData.country_name || null,
      region: ipData.region || null,
      city: ipData.city || null,
      postal: ipData.postal || null,
      timezone: ipData.timezone || null,

      userAgent,
      browser: browserInfo.browser,
      device: browserInfo.device,
      os: browserInfo.os,

      page: window.location.pathname + window.location.search,
      timestamp: serverTimestamp(),
      grantedLocation,
    };

    if (grantedLocation && coords) {
      logData.latitude = coords.latitude;
      logData.longitude = coords.longitude;
      logData.accuracy = coords.accuracy;
    }

    await addDoc(collection(db, 'visitors'), logData);

    localStorage.setItem(dailyKey, 'true');
    console.log('New daily visitor logged ✅', logData);
    return true;
  } catch (err) {
    console.warn('Failed to log visitor', err);
    return false;
  }
};

