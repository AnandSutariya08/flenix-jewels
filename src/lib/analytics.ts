// lib/analytics.ts
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const VISITOR_KEY_PREFIX = 'flenix_visitor_logged';
const VISITOR_WINDOW_MS = 24 * 60 * 60 * 1000;

const getVisitorKey = () => {
  const host = window.location.hostname;
  return `${VISITOR_KEY_PREFIX}:${host}`;
};

/**
 * Logs a visitor at most once per device per rolling 24-hour window,
 * regardless of how many times they visit or whether location/coords
 * change in that window. Shared by every trigger (page load, chat widget)
 * so "unique visitor" means the same thing for both the admin table and
 * the notification emails. Once 24 hours have passed since the last log,
 * the same device counts as a fresh visitor again. Returns true only when
 * a new visitor doc was actually written — callers use this to avoid
 * sending a notification email for a repeat visit that the admin panel
 * won't show as new.
 */
export const logVisitor = async (
  grantedLocation: boolean = false,
  coords?: GeolocationCoordinates
): Promise<boolean> => {
  // Never log admin page visits
  if (window.location.pathname.startsWith('/admin')) return false;

  const visitorKey = getVisitorKey();
  const now = Date.now();

  // Log at most once per device per rolling 24h. Claimed synchronously
  // (before any await) so two triggers firing close together — e.g. the
  // page-load flow and the chat widget — can't both pass this check.
  const lastLoggedAt = Number(localStorage.getItem(visitorKey));
  if (lastLoggedAt && now - lastLoggedAt < VISITOR_WINDOW_MS) {
    console.log('Visitor already logged within the last 24h - skipping duplicate');
    return false;
  }
  localStorage.setItem(visitorKey, String(now));

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

    console.log('New visitor logged ✅', logData);
    return true;
  } catch (err) {
    // Writing failed — release the claim so a later trigger can retry.
    localStorage.removeItem(visitorKey);
    console.warn('Failed to log visitor', err);
    return false;
  }
};

