import React from 'react';
import { LegalPageLayout } from '../../components/LegalPageLayout';
import { useLocalization } from '../../context/AppProviders';

const TermsOfService = () => {
  const { t } = useLocalization();

  return (
    <LegalPageLayout title={t('terms_title')} lastUpdated={t('legal_last_updated_value')}>
      <div className="mb-8 rounded-r border-l-4 border-amber-500 bg-amber-50 p-4 dark:bg-amber-900/20">
        <p className="m-0 text-sm text-amber-900 dark:text-amber-100">
          <strong>{t('terms_intro')}</strong>
        </p>
      </div>

      <section className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
          <span className="material-symbols-outlined text-primary">description</span>
          {t('terms_section_service')}
        </h3>
        <p>{t('terms_service_body')}</p>
      </section>

      <section className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
          <span className="material-symbols-outlined text-primary">do_not_touch</span>
          {t('terms_section_use')}
        </h3>
        <p>{t('terms_use_intro')}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>{t('terms_use_item_1')}</li>
          <li>{t('terms_use_item_2')}</li>
          <li>{t('terms_use_item_3')}</li>
        </ul>
      </section>

      <section className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
          <span className="material-symbols-outlined text-primary">vpn_key</span>
          {t('terms_section_security')}
        </h3>
        <p>{t('terms_security_body')}</p>
      </section>

      <section className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
          <span className="material-symbols-outlined text-primary">copyright</span>
          {t('terms_section_license')}
        </h3>
        <p>{t('terms_license_body')}</p>
        <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-around gap-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
            <span className="material-symbols-outlined text-sm">check</span>
            <span>{t('terms_license_yes')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
            <span className="material-symbols-outlined text-sm">close</span>
            <span>{t('terms_license_no')}</span>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
          <span className="material-symbols-outlined text-primary">warning</span>
          {t('terms_section_liability')}
        </h3>
        <p className="text-justify">{t('terms_liability_body')}</p>
        <p className="mt-2 border-l-2 border-slate-300 pl-3 text-sm italic text-slate-500">
          {t('terms_liability_quote')}
        </p>
      </section>

      <section className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
          <span className="material-symbols-outlined text-primary">gavel</span>
          {t('terms_section_law')}
        </h3>
        <p>{t('terms_law_body')}</p>
      </section>

      <section>
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
          <span className="material-symbols-outlined text-primary">edit</span>
          {t('terms_section_changes')}
        </h3>
        <p>{t('terms_changes_body')}</p>
      </section>
    </LegalPageLayout>
  );
};

export default TermsOfService;
