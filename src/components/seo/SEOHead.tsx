import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterCreator?: string;
}

export function SEOHead({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  ogUrl,
  twitterCard = 'summary_large_image',
  twitterCreator = '@fixpricepro',
}: SEOHeadProps) {
  const fullTitle = `${title} | Fix Price Pro`;
  const siteUrl = window.location.origin;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

      {/* Canonical Link */}
      <link rel="canonical" href={canonical || siteUrl + window.location.pathname} />

      {/* Open Graph (Social Media) */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || description} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:url" content={ogUrl || siteUrl + window.location.pathname} />
      <meta property="og:site_name" content="Fix Price Pro" />

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={ogTitle || fullTitle} />
      <meta name="twitter:description" content={ogDescription || description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      <meta name="twitter:creator" content={twitterCreator} />

      {/* Additional SEO */}
      <meta name="language" content="Russian" />
      <meta name="author" content="Fix Price Pro" />
      <meta name="robots" content="index, follow" />
      <link rel="alternate" hrefLang="ru" href={siteUrl} />
    </Helmet>
  );
}
