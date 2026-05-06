import React, { useLayoutEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocalization } from '../context/AppProviders';

const MockAppPreview: React.FC<{ t: (key: string) => string }> = ({ t }) => (
  <div className="mx-auto w-64 rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 select-none pointer-events-none">
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-1.5">
        <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>timer</span>
        <span className="font-bold text-sm text-gray-900 dark:text-white">Time Tracker</span>
      </div>
      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">I</div>
    </div>
    <div className="p-3 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-blue-500 rounded-xl p-2.5 text-white">
          <span className="material-symbols-outlined block mb-1" style={{ fontSize: '16px' }}>code</span>
          <div className="text-xs font-bold leading-tight">{t('landing_preview_space_1')}</div>
          <div className="text-xs opacity-70 mt-0.5">28.3h</div>
        </div>
        <div className="bg-purple-500 rounded-xl p-2.5 text-white">
          <span className="material-symbols-outlined block mb-1" style={{ fontSize: '16px' }}>palette</span>
          <div className="text-xs font-bold leading-tight">{t('landing_preview_space_2')}</div>
          <div className="text-xs opacity-70 mt-0.5">12.5h</div>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('today_label')}</div>
        <div className="space-y-2">
          {[
            { color: 'bg-blue-500', label: t('landing_preview_item_1'), time: '2:30h', live: false },
            { color: 'bg-purple-500', label: t('landing_preview_item_2'), time: '1:00h', live: false },
            { color: 'bg-blue-500', label: t('landing_preview_item_3'), time: t('landing_preview_live'), live: true },
          ].map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${entry.color}`} />
              <span className="flex-1 text-xs text-gray-700 dark:text-gray-300 truncate">{entry.label}</span>
              <span className={`text-xs font-mono ${entry.live ? 'text-primary' : 'text-gray-400'}`}>{entry.time}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-primary/10 rounded-xl p-3">
        <div className="text-xs font-semibold text-primary mb-2">{t('this_week_label')} · 41.8h</div>
        <div className="flex items-end gap-1 h-8">
          {[50, 75, 40, 90, 60, 30, 0].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-primary rounded-sm opacity-80"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

interface LandingProps {
  hasAuthenticatedSession?: boolean;
  preferredLanguage: 'en' | 'es';
}

const Landing: React.FC<LandingProps> = ({ hasAuthenticatedSession = false, preferredLanguage }) => {
  const { t, language, setLanguage } = useLocalization();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (language !== preferredLanguage) {
      setLanguage(preferredLanguage);
    }
  }, [language, preferredLanguage, setLanguage]);

  const features = [
    { icon: 'folder_open', titleKey: 'landing_feat1_title', descKey: 'landing_feat1_desc' },
    { icon: 'calendar_month', titleKey: 'landing_feat2_title', descKey: 'landing_feat2_desc' },
    { icon: 'bar_chart', titleKey: 'landing_feat3_title', descKey: 'landing_feat3_desc' },
    { icon: 'sync', titleKey: 'landing_feat4_title', descKey: 'landing_feat4_desc' },
  ];

  const steps = [
    { num: '01', titleKey: 'landing_step1_title', descKey: 'landing_step1_desc' },
    { num: '02', titleKey: 'landing_step2_title', descKey: 'landing_step2_desc' },
    { num: '03', titleKey: 'landing_step3_title', descKey: 'landing_step3_desc' },
  ];

  const useCases = [
    t('landing_use_case_1'),
    t('landing_use_case_2'),
    t('landing_use_case_3'),
    t('landing_use_case_4'),
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">

      {/* NAV */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }}>timer</span>
            <span className="font-bold text-lg tracking-tight">Time Tracker</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate(preferredLanguage === 'en' ? '/' : '/en')}
              className="text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle language"
            >
              {language === 'en' ? 'ES' : 'EN'}
            </button>
            {hasAuthenticatedSession ? (
              <Link
                to="/spaces"
                className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                {t('landing_nav_app')}
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:block text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {t('auth_sign_in')}
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
                >
                  {t('landing_cta_primary')}
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main id="main-content">

        {/* HERO */}
        <section className="relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-96 h-96 sm:w-[600px] sm:h-[600px] bg-primary/5 rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none"
            aria-hidden="true"
          />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
              <div className="mb-12 lg:mb-0">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-3 py-1.5 rounded-full mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
                  {t('landing_hero_badge')}
                </div>
                <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.05] mb-6 text-gray-900 dark:text-white">
                  {t('landing_hero_title_1')}<br />
                  <span className="text-primary">{t('landing_hero_title_2')}</span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-lg leading-relaxed">
                  {t('landing_hero_subtitle')}
                </p>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-8 max-w-2xl leading-relaxed">
                  {t('landing_hero_supporting')}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/register"
                    className="bg-primary text-white font-bold px-6 py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 text-base"
                  >
                    {t('landing_cta_primary')} →
                  </Link>
                  <Link
                    to="/login"
                    className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold px-6 py-3.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-base"
                  >
                    {t('auth_sign_in')}
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2 mt-5">
                  {useCases.map((useCase) => (
                    <span
                      key={useCase}
                      className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300"
                    >
                      {useCase}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  <div
                    className="absolute inset-0 bg-primary/20 rounded-3xl blur-3xl scale-75 translate-y-4 pointer-events-none"
                    aria-hidden="true"
                  />
                  <MockAppPreview t={t} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <span className="text-primary text-sm font-bold uppercase tracking-widest">
                {t('landing_features_label')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-2 mb-4 text-gray-900 dark:text-white">
                {t('landing_features_title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
                {t('landing_features_subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {features.map((f) => (
                <article
                  key={f.titleKey}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:border-primary/40 dark:hover:border-primary/40 transition-colors"
                >
                  <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px' }}>
                      {f.icon}
                    </span>
                  </div>
                  <h3 className="font-bold text-base mb-2 text-gray-900 dark:text-white">{t(f.titleKey)}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{t(f.descKey)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <span className="text-primary text-sm font-bold uppercase tracking-widest">
                {t('landing_how_label')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-2 mb-4 text-gray-900 dark:text-white">
                {t('landing_how_title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
                {t('landing_how_subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {steps.map((step) => (
                <div
                  key={step.num}
                  className="flex flex-col items-center text-center md:items-start md:text-left"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-2xl font-black text-primary">{step.num}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{t(step.titleKey)}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{t(step.descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FREE CTA */}
        <section className="py-24 bg-primary relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative">
            <div className="inline-flex items-center gap-2 bg-white/15 text-white text-sm font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">
                check_circle
              </span>
              {t('landing_free_badge')}
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
              {t('landing_free_title')}
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              {t('landing_free_subtitle')}
            </p>
            <Link
              to="/register"
              className="bg-white text-primary font-black px-8 py-4 rounded-xl hover:bg-gray-50 transition-all text-lg shadow-xl"
            >
              {t('landing_free_cta')} →
            </Link>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="py-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-500">
          <div className="flex items-center gap-1.5">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontSize: '16px' }}
              aria-hidden="true"
            >
              timer
            </span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">Time Tracker</span>
            <span>· © {new Date().getFullYear()} · {t('landing_footer_copy')}</span>
          </div>
          <nav aria-label="Footer" className="flex items-center gap-4 sm:gap-6">
            <Link to="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              {t('auth_privacy_policy')}
            </Link>
            <Link to="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              {t('auth_terms_of_service')}
            </Link>
            <Link to="/cookies" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              {t('landing_footer_cookies')}
            </Link>
          </nav>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
