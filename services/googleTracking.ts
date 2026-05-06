const GA_MEASUREMENT_ID = 'G-QKHH0S4XJE';
const GTM_CONTAINER_ID = 'GTM-MMKS75VJ';
const SCRIPT_ATTR = 'data-google-consent-managed';

declare global {
  interface Window {
    __timeTrackerGoogleLoaded?: boolean;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

const ensureManagedScript = (src: string, source: 'ga' | 'gtm') => {
  if (document.querySelector(`script[${SCRIPT_ATTR}="${source}"]`)) {
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  script.setAttribute(SCRIPT_ATTR, source);
  document.head.appendChild(script);
};

const removeManagedScripts = () => {
  document
    .querySelectorAll<HTMLScriptElement>(`script[${SCRIPT_ATTR}]`)
    .forEach((script) => script.remove());
};

const expireCookie = (name: string, domain?: string) => {
  const domainSegment = domain ? ` domain=${domain};` : '';

  document.cookie = `${name}=; Max-Age=0; path=/;${domainSegment} SameSite=Lax`;
  document.cookie = `${name}=; Max-Age=0; path=/;${domainSegment} SameSite=None; Secure`;
};

const clearGoogleCookies = () => {
  const cookieNames = document.cookie
    .split(';')
    .map((cookie) => cookie.trim().split('=')[0])
    .filter(Boolean)
    .filter(
      (name) =>
        name === '_ga' ||
        name === '_gid' ||
        name === '_gat' ||
        name.startsWith('_ga_') ||
        name.startsWith('_gcl_'),
    );

  const hostParts = window.location.hostname.split('.');
  const domains = new Set<string | undefined>([undefined, window.location.hostname]);

  for (let index = 0; index < hostParts.length - 1; index += 1) {
    domains.add(`.${hostParts.slice(index).join('.')}`);
  }

  cookieNames.forEach((name) => {
    domains.forEach((domain) => expireCookie(name, domain));
  });
};

const ensureGoogleQueue = () => {
  window.dataLayer = window.dataLayer || [];

  if (!window.gtag) {
    window.gtag = (...args: unknown[]) => {
      window.dataLayer?.push(args);
    };
  }
};

export const enableGoogleTracking = () => {
  if (typeof window === 'undefined') {
    return;
  }

  ensureGoogleQueue();
  window[`ga-disable-${GA_MEASUREMENT_ID}`] = false;

  if (window.__timeTrackerGoogleLoaded) {
    return;
  }

  window.dataLayer?.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  window.gtag?.('js', new Date());
  window.gtag?.('config', GA_MEASUREMENT_ID, {
    allow_google_signals: false,
  });

  ensureManagedScript(`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`, 'ga');
  ensureManagedScript(`https://www.googletagmanager.com/gtm.js?id=${GTM_CONTAINER_ID}`, 'gtm');

  window.__timeTrackerGoogleLoaded = true;
};

export const disableGoogleTracking = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
  window.gtag?.('consent', 'update', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });

  clearGoogleCookies();
  removeManagedScripts();

  window.__timeTrackerGoogleLoaded = false;
  window.dataLayer = [];
  window.gtag = (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };
};
