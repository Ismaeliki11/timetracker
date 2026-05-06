import React, { useEffect, useMemo } from 'react';

export const SITE_URL = 'https://time-tracker-ismaeliki.vercel.app';
const DEFAULT_OG_IMAGE = `${SITE_URL}/seo-card.png`;

type AlternateLink = {
  href: string;
  hreflang: string;
};

type StructuredData = Record<string, unknown>;

interface SeoProps {
  title: string;
  description: string;
  path: string;
  lang?: string;
  robots?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  alternates?: AlternateLink[];
  structuredData?: StructuredData | StructuredData[];
}

const MANAGED_ATTR = 'data-seo-managed';

const upsertMeta = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  element.setAttribute(MANAGED_ATTR, 'true');

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
};

const upsertLink = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector<HTMLLinkElement>(selector);

  if (!element) {
    element = document.createElement('link');
    document.head.appendChild(element);
  }

  element.setAttribute(MANAGED_ATTR, 'true');

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
};

const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString();

export const Seo: React.FC<SeoProps> = ({
  title,
  description,
  path,
  lang,
  robots = 'index, follow',
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  twitterCard = 'summary_large_image',
  alternates = [],
  structuredData = [],
}) => {
  const canonicalUrl = useMemo(() => absoluteUrl(path), [path]);
  const serializedStructuredData = useMemo(
    () => JSON.stringify(Array.isArray(structuredData) ? structuredData : [structuredData]),
    [structuredData],
  );
  const serializedAlternates = useMemo(() => JSON.stringify(alternates), [alternates]);

  useEffect(() => {
    document.title = title;

    if (lang) {
      document.documentElement.lang = lang;
    }

    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: robots });
    upsertMeta('meta[name="googlebot"]', { name: 'googlebot', content: robots });
    upsertMeta('meta[name="author"]', { name: 'author', content: 'Time Tracker' });
    upsertMeta('meta[name="application-name"]', { name: 'application-name', content: 'Time Tracker' });
    upsertMeta('meta[name="apple-mobile-web-app-title"]', {
      name: 'apple-mobile-web-app-title',
      content: 'Time Tracker',
    });
    upsertMeta('meta[name="theme-color"]', { name: 'theme-color', content: '#ffffff' });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: ogType });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: 'Time Tracker' });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: ogImage });
    upsertMeta('meta[property="og:image:width"]', { property: 'og:image:width', content: '1200' });
    upsertMeta('meta[property="og:image:height"]', { property: 'og:image:height', content: '630' });
    upsertMeta('meta[property="og:image:alt"]', {
      property: 'og:image:alt',
      content: 'Time Tracker landing preview',
    });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: twitterCard });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    upsertMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: description,
    });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: ogImage });

    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl });

    document.head.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]').forEach((element) => {
      element.remove();
    });

    alternates.forEach(({ href, hreflang }) => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', hreflang);
      link.setAttribute('href', href);
      link.setAttribute(MANAGED_ATTR, 'true');
      document.head.appendChild(link);
    });

    document.head.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]').forEach((element) => {
      element.remove();
    });

    const parsedStructuredData = JSON.parse(serializedStructuredData) as StructuredData[];

    parsedStructuredData
      .filter((entry) => Object.keys(entry).length > 0)
      .forEach((entry) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(entry);
        script.setAttribute(MANAGED_ATTR, 'true');
        document.head.appendChild(script);
      });
  }, [
    canonicalUrl,
    description,
    lang,
    ogImage,
    ogType,
    robots,
    serializedAlternates,
    serializedStructuredData,
    title,
    twitterCard,
  ]);

  return null;
};

export const buildAbsoluteUrl = absoluteUrl;
