import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bellaweddingai.com';

  // Static routes
  const routes = [
    '',
    '/auth',
    '/dashboard',
    '/vendors',
    '/checklist',
    '/budget',
    '/timeline',
    '/guests',
    '/photos',
    '/registry',
    '/seating',
    '/ai',
    '/rsvp',
    '/website',
    '/vendor-questions',
    '/recommendations',
    '/analytics',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' as const : 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Vendor-specific routes
  const vendorRoutes = [
    '/vendor-dashboard',
    '/admin/import-venues',
    '/admin/verify-vendors',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...routes, ...vendorRoutes];
}
