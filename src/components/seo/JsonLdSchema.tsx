import { Helmet } from 'react-helmet-async';

// Organization Schema
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Fix Price Pro',
    url: window.location.origin,
    logo: `${window.location.origin}/logo.svg`,
    description: 'Магазин товаров для дома и быта с бесплатной доставкой и программой лояльности',
    sameAs: [
      'https://www.facebook.com/fixpricepro',
      'https://www.instagram.com/fixpricepro',
      'https://www.vk.com/fixpricepro',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      telephone: '+7-999-999-9999',
      email: 'support@fixprice.ru',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'RU',
      addressRegion: 'Москва',
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// Product Schema
interface ProductSchemaProps {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  sku?: string;
}

export function ProductSchema({
  name,
  description,
  image,
  price,
  currency = 'RUB',
  rating = 4.5,
  reviewCount = 10,
  availability = 'InStock',
  sku,
}: ProductSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    sku: sku || name.toLowerCase().replace(/\s+/g, '-'),
    brand: {
      '@type': 'Brand',
      name: 'Fix Price Pro',
    },
    offers: {
      '@type': 'Offer',
      url: window.location.href,
      priceCurrency: currency,
      price: price.toString(),
      availability: `https://schema.org/${availability}`,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating.toString(),
      bestRating: '5',
      worstRating: '1',
      ratingCount: reviewCount.toString(),
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// Breadcrumb Schema
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${window.location.origin}${item.url}`,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// LocalBusiness Schema
export function LocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': window.location.origin,
    name: 'Fix Price Pro',
    image: `${window.location.origin}/logo.svg`,
    url: window.location.origin,
    telephone: '+7-999-999-9999',
    priceRange: '₽₽',
    areaServed: {
      '@type': 'City',
      name: 'Москва',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '09:00',
      closes: '22:00',
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// E-commerce Schema
export function ECommerceSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: window.location.origin,
    name: 'Fix Price Pro',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${window.location.origin}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
