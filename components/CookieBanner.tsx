import React from 'react';
import { Link } from 'react-router-dom';
import { useLocalization } from '../context/AppProviders';
import { useCookieConsent } from '../context/CookieConsentContext';

export const CookieBanner: React.FC = () => {
  const { t } = useLocalization();
  const { isBannerOpen, acceptAnalytics, rejectAnalytics, closeCookieSettings } = useCookieConsent();

  if (!isBannerOpen) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4">
      <div className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-2xl backdrop-blur dark:border-slate-700 dark:bg-slate-950/95">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <span className="material-symbols-outlined text-sm">cookie</span>
              {t('cookie_banner_badge')}
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('cookie_banner_title')}
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {t('cookie_banner_description')}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={rejectAnalytics}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-800 sm:min-w-44 sm:flex-none"
              >
                {t('cookie_banner_reject')}
              </button>
              <button
                type="button"
                onClick={acceptAnalytics}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-primary bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-focus sm:min-w-44 sm:flex-none"
              >
                {t('cookie_banner_accept')}
              </button>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <Link
                to="/cookies"
                onClick={closeCookieSettings}
                className="font-medium text-primary transition-colors hover:text-primary-focus hover:underline"
              >
                {t('cookie_banner_policy')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
