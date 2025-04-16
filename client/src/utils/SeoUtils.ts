interface StructuredDataOptions {
  type: 'HowTo' | 'FAQPage' | 'WebSite' | 'CollectionPage';
  name: string;
  description: string;
  steps?: Array<{
    "@type": string;
    position: number;
    name: string;
    text: string;
  }>;
  supplies?: Array<{
    "@type": string;
    name: string;
  }>;
  mainEntity?: Array<{
    "@type": string;
    name: string;
    acceptedAnswer: {
      "@type": string;
      text: string;
    };
  }>;
  url?: string;
}

export const generateStructuredData = (options: StructuredDataOptions) => {
  const { type, name, description } = options;
  
  const baseStructuredData = {
    "@context": "https://schema.org",
    "@type": type,
    "name": name,
    "description": description,
  };
  
  switch (type) {
    case 'HowTo':
      return {
        ...baseStructuredData,
        "step": options.steps,
        "supply": options.supplies,
        "totalTime": "PT30M", // Default time of 30 minutes
      };
    
    case 'FAQPage':
      return {
        ...baseStructuredData,
        "mainEntity": options.mainEntity,
      };
    
    case 'WebSite':
      return {
        ...baseStructuredData,
        "url": options.url,
      };
    
    case 'CollectionPage':
      return {
        ...baseStructuredData,
        "url": options.url,
      };
    
    default:
      return baseStructuredData;
  }
};

export const generateSitemap = (baseUrl: string, urls: string[]) => {
  const today = new Date().toISOString();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(url => `
  <url>
    <loc>${baseUrl}${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${url === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
</urlset>
  `;
};
