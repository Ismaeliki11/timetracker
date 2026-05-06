import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useLocalization } from '../context/AppProviders';
import { Seo, buildAbsoluteUrl } from './Seo';

const LANDING_COPY = {
  es: {
    title: 'Time Tracker | App gratis para registrar horas y controlar tu tiempo',
    description:
      'Time Tracker es una app gratis para registrar horas, controlar tiempo por proyecto, revisar calendario y consultar estadísticas. Ideal para freelancers, estudiantes y trabajo personal.',
  },
  en: {
    title: 'Time Tracker | Free app to track time, log hours and view stats',
    description:
      'Time Tracker is a free app to track time, log work hours, review a calendar view, and check clear statistics. Built for freelancers, students, and focused personal projects.',
  },
} as const;

const LEGAL_COPY = {
  es: {
    '/privacy': {
      title: 'Política de privacidad | Time Tracker',
      description:
        'Consulta cómo Time Tracker trata datos de cuenta, sincronización y analítica opcional de Google Analytics y Search Console.',
    },
    '/terms': {
      title: 'Términos y condiciones | Time Tracker',
      description:
        'Lee los términos y condiciones de uso de Time Tracker, la aplicación para registrar horas y gestionar tu tiempo.',
    },
    '/cookies': {
      title: 'Política de cookies | Time Tracker',
      description:
        'Conoce qué almacenamiento esencial y cookies analíticas opcionales utiliza Time Tracker y cómo gestionar tu consentimiento.',
    },
  },
  en: {
    '/privacy': {
      title: 'Privacy Policy | Time Tracker',
      description:
        'Learn how Time Tracker handles account data, sync data, and optional analytics related to Google Analytics and Search Console.',
    },
    '/terms': {
      title: 'Terms and Conditions | Time Tracker',
      description:
        'Read the terms and conditions for using Time Tracker, the app for logging hours and managing your time.',
    },
    '/cookies': {
      title: 'Cookies Policy | Time Tracker',
      description:
        'See which essential storage and optional analytics cookies Time Tracker uses and how you can manage consent.',
    },
  },
} as const;

const pathMatches = (pathname: string, paths: string[]) => paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

const buildLandingSchemas = (language: 'es' | 'en', path: '/' | '/en') => {
  const url = buildAbsoluteUrl(path);
  const copy = LANDING_COPY[language];
  const featureList =
    language === 'es'
      ? [
          'Registro de horas por proyecto, cliente o actividad',
          'Vista de calendario para revisar y editar entradas',
          'Estadísticas claras y calculadora de ganancias',
          'Uso sencillo en escritorio y móvil',
        ]
      : [
          'Time logging by project, client, or activity',
          'Calendar view to review and edit entries',
          'Clear statistics and an earnings calculator',
          'Simple experience on desktop and mobile',
        ];

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Time Tracker',
      url,
      inLanguage: language,
      description: copy.description,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Time Tracker',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web browser',
      browserRequirements: 'Requires JavaScript and a modern browser.',
      isAccessibleForFree: true,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
      },
      inLanguage: language,
      description: copy.description,
      featureList,
      url,
    },
  ];
};

export const RouteSeo: React.FC = () => {
  const location = useLocation();
  const { language, t } = useLocalization();

  const seoData = useMemo(() => {
    const { pathname } = location;

    if (pathname === '/' || pathname === '/en') {
      const landingLanguage = pathname === '/en' ? 'en' : 'es';
      const currentPath = pathname === '/en' ? '/en' : '/';

      return {
        title: LANDING_COPY[landingLanguage].title,
        description: LANDING_COPY[landingLanguage].description,
        path: currentPath,
        lang: landingLanguage,
        robots: 'index, follow',
        alternates: [
          { hreflang: 'es', href: buildAbsoluteUrl('/') },
          { hreflang: 'en', href: buildAbsoluteUrl('/en') },
          { hreflang: 'x-default', href: buildAbsoluteUrl('/') },
        ],
        structuredData: buildLandingSchemas(landingLanguage, currentPath),
      };
    }

    if (pathname in LEGAL_COPY.es) {
      const legalEntry = LEGAL_COPY[language][pathname as keyof typeof LEGAL_COPY.es];

      return {
        title: legalEntry.title,
        description: legalEntry.description,
        path: pathname,
        lang: language,
        robots: 'index, follow',
        alternates: [],
        structuredData: [],
      };
    }

    if (pathMatches(pathname, ['/login', '/register', '/recovery', '/email-confirmed', '/update-password'])) {
      const authTitleMap = {
        '/login': t('auth_sign_in'),
        '/register': t('auth_create_account'),
        '/recovery': t('auth_forgot_password_title'),
        '/email-confirmed': t('auth_email_verified_title'),
        '/update-password': t('auth_update_password_title'),
      } as const;

      const currentTitle = authTitleMap[pathname as keyof typeof authTitleMap] || 'Time Tracker';

      return {
        title: `${currentTitle} | Time Tracker`,
        description:
          language === 'es'
            ? 'Ruta interna de autenticación de Time Tracker.'
            : 'Internal authentication page for Time Tracker.',
        path: pathname,
        lang: language,
        robots: 'noindex, nofollow',
        alternates: [],
        structuredData: [],
      };
    }

    if (pathMatches(pathname, ['/spaces', '/space', '/profile', '/welcome'])) {
      const currentTitle =
        pathname === '/profile'
          ? t('profile')
          : pathname === '/welcome'
            ? t('welcome_back')
            : t('spaces_label');

      return {
        title: `${currentTitle} | Time Tracker`,
        description:
          language === 'es'
            ? 'Ruta interna de la aplicación Time Tracker.'
            : 'Internal application route for Time Tracker.',
        path: pathname,
        lang: language,
        robots: 'noindex, nofollow',
        alternates: [],
        structuredData: [],
      };
    }

    return {
      title: 'Time Tracker',
      description:
        language === 'es'
          ? 'Aplicación sencilla para registrar horas y controlar tu tiempo.'
          : 'Simple app to track time and log hours.',
      path: pathname,
      lang: language,
      robots: 'noindex, nofollow',
      alternates: [],
      structuredData: [],
    };
  }, [language, location, t]);

  return <Seo {...seoData} />;
};
