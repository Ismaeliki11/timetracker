import React from 'react';
import { LegalPageLayout } from '../../components/LegalPageLayout';
import { useLocalization } from '../../context/AppProviders';
import { useCookieConsent } from '../../context/CookieConsentContext';

const PrivacyPolicy = () => {
  const { t, language } = useLocalization();
  const { openCookieSettings } = useCookieConsent();

  return (
    <LegalPageLayout title={t('privacy_title')} lastUpdated={t('legal_last_updated_value')}>
      <div className="mb-8 rounded-lg border-l-4 border-primary bg-blue-50 p-4 dark:bg-blue-900/20">
        <p className="m-0">{t('privacy_intro')}</p>
      </div>

      <section className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
          <span className="material-symbols-outlined text-primary">security</span>
          {t('privacy_section_controller')}
        </h3>
        <p>
          {t('privacy_controller_body')}{' '}
          <a
            href="mailto:ismaeliki11@gmail.com"
            className="rounded bg-slate-100 px-1 font-mono text-primary hover:underline dark:bg-slate-800"
          >
            ismaeliki11@gmail.com
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
          <span className="material-symbols-outlined text-primary">folder_shared</span>
          {t('privacy_section_data')}
        </h3>
        <p>{t('privacy_data_intro')}</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <strong className="mb-1 block text-primary">{t('privacy_data_account_title')}</strong>
            <span className="text-sm">{t('privacy_data_account_text')}</span>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <strong className="mb-1 block text-primary">{t('privacy_data_usage_title')}</strong>
            <span className="text-sm">{t('privacy_data_usage_text')}</span>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <strong className="mb-1 block text-primary">{t('privacy_data_technical_title')}</strong>
            <span className="text-sm">{t('privacy_data_technical_text')}</span>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <strong className="mb-1 block text-primary">{t('privacy_data_analytics_title')}</strong>
            <span className="text-sm">{t('privacy_data_analytics_text')}</span>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50 md:col-span-2">
            <strong className="mb-1 block text-primary">{t('privacy_data_search_console_title')}</strong>
            <span className="text-sm">{t('privacy_data_search_console_text')}</span>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
          <span className="material-symbols-outlined text-primary">target</span>
          {t('privacy_section_purposes')}
        </h3>
        <p>{t('privacy_purposes_intro')}</p>
        <ul className="mt-3 list-none space-y-2 pl-0">
          {[
            'privacy_purpose_service',
            'privacy_purpose_sync',
            'privacy_purpose_auth',
            'privacy_purpose_security',
            'privacy_purpose_analytics',
            'privacy_purpose_search_console',
          ].map((key) => (
            <li key={key} className="flex gap-2">
              <span className="material-symbols-outlined mt-1 text-sm text-green-500">check_circle</span>
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded border border-red-100 bg-red-50 p-3 text-center text-sm font-medium text-red-800 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-200">
          {t('privacy_no_ads')}
        </div>
      </section>

      <section className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
          <span className="material-symbols-outlined text-primary">gavel</span>
          {t('privacy_section_legal_basis')}
        </h3>
        <p>{t('privacy_legal_intro')}</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>{t('privacy_legal_service')}</li>
          <li>{t('privacy_legal_security')}</li>
          <li>{t('privacy_legal_analytics')}</li>
          <li>{t('privacy_legal_search_console')}</li>
        </ul>
      </section>

      <section className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
          <span className="material-symbols-outlined text-primary">dns</span>
          {t('privacy_section_processors')}
        </h3>
        <p>{t('privacy_processors_intro')}</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>{t('privacy_processor_supabase')}</li>
          <li>{t('privacy_processor_vercel')}</li>
          <li>{t('privacy_processor_google')}</li>
          <li>{t('privacy_processor_transfers')}</li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
            {t('legal_link_supabase')}
          </a>
          <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
            {t('legal_link_vercel')}
          </a>
          <a
            href={`https://policies.google.com/privacy?hl=${language}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('legal_link_google_privacy')}
          </a>
          <a
            href={`https://policies.google.com/technologies/partner-sites?hl=${language}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('legal_link_google_partner_sites')}
          </a>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
          <span className="material-symbols-outlined text-primary">schedule</span>
          {t('privacy_section_retention')}
        </h3>
        <p>{t('privacy_retention_intro')}</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>{t('privacy_retention_account')}</li>
          <li>{t('privacy_retention_local')}</li>
          <li>{t('privacy_retention_analytics')}</li>
          <li>{t('privacy_retention_search_console')}</li>
        </ul>
      </section>

      <section className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
          <span className="material-symbols-outlined text-primary">verified_user</span>
          {t('privacy_section_rights')}
        </h3>
        <p>{t('privacy_rights_intro')}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            'privacy_rights_access',
            'privacy_rights_rectification',
            'privacy_rights_erasure',
            'privacy_rights_portability',
            'privacy_rights_objection',
            'privacy_rights_withdrawal',
          ].map((key) => (
            <span
              key={key}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium dark:bg-slate-700"
            >
              {t(key)}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-500">{t('privacy_rights_body')}</p>
        <button
          type="button"
          onClick={openCookieSettings}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          {t('cookie_settings')}
        </button>
      </section>

      <section>
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
          <span className="material-symbols-outlined text-primary">update</span>
          {t('privacy_section_changes')}
        </h3>
        <p>{t('privacy_changes_body')}</p>
      </section>
    </LegalPageLayout>
  );
};

export default PrivacyPolicy;
