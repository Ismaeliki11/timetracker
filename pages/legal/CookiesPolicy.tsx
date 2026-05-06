import React from 'react';
import { LegalPageLayout } from '../../components/LegalPageLayout';
import { useLocalization } from '../../context/AppProviders';
import { useCookieConsent } from '../../context/CookieConsentContext';

const CookiesPolicy = () => {
  const { t, language } = useLocalization();
  const { openCookieSettings } = useCookieConsent();

  return (
    <LegalPageLayout title={t('cookies_title')} lastUpdated={t('legal_last_updated_value')}>
      <div className="mb-8 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <p className="m-0 flex items-center gap-2 text-blue-900 dark:text-blue-100">
          <span className="material-symbols-outlined">info</span>
          <strong>{t('cookies_intro')}</strong>
        </p>
      </div>

      <section className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
          <span className="material-symbols-outlined text-primary">help</span>
          {t('cookies_section_about')}
        </h3>
        <p>{t('cookies_about_body')}</p>
      </section>

      <section className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
          <span className="material-symbols-outlined text-primary">cookie</span>
          {t('cookies_section_types')}
        </h3>
        <p className="mb-4">{t('cookies_types_intro')}</p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: 'vpn_key',
              title: t('cookies_essential_title'),
              text: t('cookies_essential_text'),
            },
            {
              icon: 'settings',
              title: t('cookies_local_title'),
              text: t('cookies_local_text'),
            },
            {
              icon: 'analytics',
              title: t('cookies_analytics_title'),
              text: t('cookies_analytics_text'),
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4 transition-colors dark:border-slate-700 dark:bg-slate-800/50"
            >
              <div className="rounded bg-white p-2 text-primary shadow-sm dark:bg-slate-700">
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <div>
                <h4 className="mb-1 font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/10 dark:text-amber-100">
          {t('cookies_search_console_note')}
        </div>
      </section>

      <section className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
          <span className="material-symbols-outlined text-primary">settings_applications</span>
          {t('cookies_section_management')}
        </h3>
        <p>{t('cookies_management_body_1')}</p>
        <p className="mt-2">{t('cookies_management_body_2')}</p>
        <p className="mt-2">{t('cookies_management_body_3')}</p>
        <button
          type="button"
          onClick={openCookieSettings}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          {t('cookie_settings')}
        </button>
        <p className="mt-2 text-sm text-slate-500">{t('cookie_settings_description')}</p>
      </section>

      <section className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
          <span className="material-symbols-outlined text-primary">public</span>
          {t('cookies_section_third_parties')}
        </h3>
        <p>{t('cookies_third_parties_intro')}</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <a
              href={`https://policies.google.com/privacy?hl=${language}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('legal_link_google_privacy')}
            </a>
          </li>
          <li>
            <a
              href={`https://policies.google.com/technologies/partner-sites?hl=${language}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('legal_link_google_partner_sites')}
            </a>
          </li>
          <li>
            <a
              href={`https://support.google.com/analytics/answer/10000067?hl=${language}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('legal_link_google_consent')}
            </a>
          </li>
          <li>
            <a
              href={`https://support.google.com/webmasters/answer/9008080?hl=${language}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('legal_link_search_console')}
            </a>
          </li>
        </ul>
      </section>

      <section>
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
          <span className="material-symbols-outlined text-primary">shield</span>
          {t('cookies_section_browser')}
        </h3>
        <p>{t('cookies_browser_body')}</p>
      </section>
    </LegalPageLayout>
  );
};

export default CookiesPolicy;
