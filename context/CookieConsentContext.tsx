import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { disableGoogleTracking, enableGoogleTracking } from '../services/googleTracking';

export type CookieConsentStatus = 'accepted' | 'rejected';

type CookieConsentRecord = {
  status: CookieConsentStatus;
  updatedAt: string;
  version: number;
};

type CookieConsentContextType = {
  consentStatus: CookieConsentStatus | null;
  isBannerOpen: boolean;
  acceptAnalytics: () => void;
  rejectAnalytics: () => void;
  openCookieSettings: () => void;
  closeCookieSettings: () => void;
};

const COOKIE_CONSENT_STORAGE_KEY = 'cookieConsent';
const COOKIE_CONSENT_VERSION = 1;

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

const readStoredConsent = (): CookieConsentRecord | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as Partial<CookieConsentRecord> | null;

    if (
      !parsedValue ||
      (parsedValue.status !== 'accepted' && parsedValue.status !== 'rejected') ||
      parsedValue.version !== COOKIE_CONSENT_VERSION
    ) {
      return null;
    }

    return {
      status: parsedValue.status,
      updatedAt: parsedValue.updatedAt || new Date(0).toISOString(),
      version: COOKIE_CONSENT_VERSION,
    };
  } catch (error) {
    console.error('Failed to read cookie consent preference', error);
    return null;
  }
};

export const CookieConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [consent, setConsent] = useState<CookieConsentRecord | null>(() => readStoredConsent());
  const [isBannerOpen, setIsBannerOpen] = useState(() => readStoredConsent() === null);

  useEffect(() => {
    if (consent?.status === 'accepted') {
      enableGoogleTracking();
      return;
    }

    disableGoogleTracking();
  }, [consent]);

  useEffect(() => {
    const syncConsent = () => {
      const latestValue = readStoredConsent();
      setConsent(latestValue);
      setIsBannerOpen(latestValue === null);
    };

    window.addEventListener('storage', syncConsent);

    return () => {
      window.removeEventListener('storage', syncConsent);
    };
  }, []);

  const saveConsent = (status: CookieConsentStatus) => {
    const nextValue: CookieConsentRecord = {
      status,
      updatedAt: new Date().toISOString(),
      version: COOKIE_CONSENT_VERSION,
    };

    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(nextValue));
    setConsent(nextValue);
    setIsBannerOpen(false);
  };

  const value = useMemo<CookieConsentContextType>(
    () => ({
      consentStatus: consent?.status ?? null,
      isBannerOpen,
      acceptAnalytics: () => saveConsent('accepted'),
      rejectAnalytics: () => saveConsent('rejected'),
      openCookieSettings: () => setIsBannerOpen(true),
      closeCookieSettings: () => setIsBannerOpen(false),
    }),
    [consent?.status, isBannerOpen],
  );

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
};

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);

  if (!context) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }

  return context;
};
