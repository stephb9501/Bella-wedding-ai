/**
 * SEO Utilities for Bella Wedding AI
 * Helper functions for generating SEO-optimized metadata and structured data
 */

import { Metadata } from 'next';

const SITE_NAME = 'Bella Wedding AI';
const SITE_URL = 'https://bellaweddingai.com';
const DEFAULT_IMAGE = '/wedding-photos/deltalow-560.jpg';

interface PageSEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string[];
  type?: 'website' | 'article';
}

/**
 * Generate metadata for a page
 */
export function generatePageMetadata({
  title,
  description,
  path = '',
  image = DEFAULT_IMAGE,
  keywords = [],
  type = 'website',
}: PageSEOProps): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    keywords,
    openGraph: {
      type,
      url,
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Generate structured data for a vendor
 */
export function generateVendorStructuredData(vendor: {
  id: string;
  business_name: string;
  description?: string;
  category: string;
  average_rating?: number;
  review_count?: number;
  price_range?: number;
  phone?: string;
  email?: string;
  website?: string;
  city?: string;
  state?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/vendors/${vendor.id}`,
    name: vendor.business_name,
    description: vendor.description || `${vendor.category} for your wedding`,
    url: `${SITE_URL}/vendors/${vendor.id}`,
    telephone: vendor.phone,
    email: vendor.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: vendor.city,
      addressRegion: vendor.state,
    },
    priceRange: vendor.price_range ? '$'.repeat(vendor.price_range) : undefined,
    aggregateRating: vendor.average_rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: vendor.average_rating.toFixed(1),
          reviewCount: vendor.review_count || 0,
          bestRating: '5',
          worstRating: '1',
        }
      : undefined,
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/**
 * Generate article structured data (for blog posts, guides, etc.)
 */
export function generateArticleStructuredData(article: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: `${SITE_URL}${article.image}`,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Person',
      name: article.authorName || 'Bella Wedding AI Team',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}${article.path}`,
    },
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate service structured data
 */
export function generateServiceStructuredData(service: {
  name: string;
  description: string;
  serviceType: string;
  provider: string;
  areaServed?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    serviceType: service.serviceType,
    provider: {
      '@type': 'Organization',
      name: service.provider,
    },
    areaServed: service.areaServed
      ? {
          '@type': 'Place',
          name: service.areaServed,
        }
      : undefined,
  };
}

/**
 * SEO keywords by category
 */
export const SEO_KEYWORDS = {
  wedding: [
    'wedding planning',
    'wedding planner',
    'wedding organization',
    'plan my wedding',
    'wedding preparation',
  ],
  budget: [
    'wedding budget',
    'wedding budget calculator',
    'wedding cost tracker',
    'wedding expense tracker',
    'wedding budget planner',
  ],
  guests: [
    'wedding guest list',
    'wedding RSVP',
    'guest list management',
    'wedding invitations',
    'RSVP tracking',
  ],
  vendors: [
    'wedding vendors',
    'wedding photographer',
    'wedding venue',
    'wedding caterer',
    'wedding DJ',
    'wedding florist',
  ],
  timeline: [
    'wedding timeline',
    'wedding checklist',
    'wedding planning timeline',
    'wedding schedule',
    'wedding day timeline',
  ],
};

/**
 * Generate meta description from content
 */
export function truncateDescription(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3).trim() + '...';
}
