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
  '/privacy': {
    title: 'Política de privacidad | Time Tracker',
    description:
      'Consulta cómo Time Tracker recopila, utiliza y protege tus datos para ofrecer el servicio de seguimiento de tiempo y sincronización.',
  },
  '/terms': {
    title: 'Términos y condiciones | Time Tracker',
    description:
      'Lee los términos y condiciones de uso de Time Tracker, la aplicación para registrar horas y gestionar tu tiempo.',
  },
  '/cookies': {
    title: 'Política de cookies | Time Tracker',
    description:
      'Conoce qué cookies y almacenamiento local utiliza Time Tracker para autenticación, idioma y preferencias básicas.',
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

    if (pathname in LEGAL_COPY) {
      const legalEntry = LEGAL_COPY[pathname as keyof typeof LEGAL_COPY];

      return {
        title: legalEntry.title,
        description: legalEntry.description,
        path: pathname,
        lang: 'es',
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
