import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://admin.aayuptechnologies.com';

  const routes = [
    '',
    '/admin',
    '/admin/jobs',
    '/admin/applications',
    '/admin/enquiry',
    '/admin/testimonals',
    '/admin/projects',
    '/admin/blogs',
    '/admin/faqs',
    '/admin/team',
    '/admin/contact',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
