/**
 * Utility functions for generating SEO-optimized content, structured data,
 * and metadata for stain removal guides.
 */

interface StructuredDataOptions {
  type: 'HowTo' | 'FAQPage' | 'WebSite' | 'CollectionPage' | 'Product' | 'Article';
  name: string;
  description: string;
  steps?: Array<{
    "@type": string;
    position: number;
    name: string;
    text: string;
    image?: string;
    url?: string;
  }>;
  supplies?: Array<{
    "@type": string;
    name: string;
    description?: string;
    image?: string;
  }>;
  tools?: Array<{
    "@type": string;
    name: string;
    description?: string;
    image?: string;
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
  image?: string;
  timeRequired?: string;
  estimatedCost?: {
    "@type": string;
    currency: string;
    value: string;
  };
  difficulty?: string;
  published?: string;
  modified?: string;
  author?: {
    "@type": string;
    name: string;
  };
  category?: string;
}

/**
 * Generates structured data for SEO based on the provided options
 */
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
      const howToData: any = {
        ...baseStructuredData,
        "step": options.steps,
        "totalTime": options.timeRequired || "PT30M",
      };
      
      // Add optional properties if provided
      if (options.supplies && options.supplies.length > 0) {
        howToData.supply = options.supplies;
      }
      
      if (options.tools && options.tools.length > 0) {
        howToData.tool = options.tools;
      }
      
      if (options.estimatedCost) {
        howToData.estimatedCost = options.estimatedCost;
      }
      
      if (options.image) {
        howToData.image = options.image;
      }
      
      if (options.url) {
        howToData.url = options.url;
      }
      
      return howToData;
    
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
        "mainEntity": options.mainEntity,
      };
      
    case 'Product':
      return {
        ...baseStructuredData,
        "category": options.category,
        "image": options.image,
        "url": options.url,
      };
      
    case 'Article':
      return {
        ...baseStructuredData,
        "author": options.author || {
          "@type": "Organization",
          "name": "StainSolver"
        },
        "publisher": {
          "@type": "Organization",
          "name": "StainSolver",
          "logo": {
            "@type": "ImageObject",
            "url": "https://example.com/logo.png" // Would be replaced with actual logo URL
          }
        },
        "datePublished": options.published || new Date().toISOString(),
        "dateModified": options.modified || new Date().toISOString(),
        "image": options.image,
        "url": options.url,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": options.url
        }
      };
    
    default:
      return baseStructuredData;
  }
};

/**
 * Generate ISO duration string from minutes
 * e.g., 30 minutes -> PT30M, 1 hour and 15 minutes -> PT1H15M
 */
export const generateIsoDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  let duration = 'PT';
  if (hours > 0) {
    duration += `${hours}H`;
  }
  if (remainingMinutes > 0 || hours === 0) {
    duration += `${remainingMinutes}M`;
  }
  
  return duration;
};

/**
 * Converts a stain removal guide's time requirement to ISO duration
 */
export const convertTimeToIsoDuration = (timeRequired: string): string => {
  // Parse common time formats
  if (timeRequired.includes('minutes') || timeRequired.includes('mins')) {
    const minutes = parseInt(timeRequired.match(/\d+/)?.[0] || '30', 10);
    return generateIsoDuration(minutes);
  }
  
  if (timeRequired.includes('hours') || timeRequired.includes('hrs')) {
    const hours = parseInt(timeRequired.match(/\d+/)?.[0] || '1', 10);
    return generateIsoDuration(hours * 60);
  }
  
  if (timeRequired.includes('-')) {
    // Range like "5-10 minutes"
    const match = timeRequired.match(/(\d+)-(\d+)/);
    if (match) {
      const average = (parseInt(match[1], 10) + parseInt(match[2], 10)) / 2;
      return generateIsoDuration(average);
    }
  }
  
  // Default
  return 'PT30M';
};

/**
 * Generates metadata for use in HTML head
 */
export interface PageMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  ogType: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage?: string;
  twitterCard: 'summary' | 'summary_large_image';
  keywords: string[];
}

export const generatePageMetadata = (
  stainName: string,
  materialName: string,
  description: string,
  baseUrl: string = 'https://example.com'
): PageMetadata => {
  const title = `How to Remove ${stainName} from ${materialName} - Complete Guide`;
  const path = `/remove/${stainName.toLowerCase().replace(/ /g, '-')}/${materialName.toLowerCase().replace(/ /g, '-')}`;
  const canonicalUrl = `${baseUrl}${path}`;
  
  // Generate keywords
  const keywords = [
    `${stainName} stain removal`,
    `${stainName} on ${materialName}`,
    `clean ${stainName} stains`,
    `remove ${stainName}`,
    `${materialName} stain removal`,
    `how to clean ${materialName}`,
    'stain removal guide',
    'cleaning tips',
    'stain solutions'
  ];
  
  return {
    title,
    description: description.substring(0, 160), // Truncate to reasonable meta description length
    canonicalUrl,
    ogTitle: title,
    ogDescription: description.substring(0, 200),
    ogType: 'article',
    twitterTitle: title,
    twitterDescription: description.substring(0, 200),
    twitterCard: 'summary_large_image',
    keywords
  };
};

/**
 * Generates a complete sitemap XML
 */
export const generateSitemap = (baseUrl: string, urls: string[]) => {
  const today = new Date().toISOString();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(url => `
  <url>
    <loc>${baseUrl}${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${url === '/' ? '1.0' : url.includes('/remove/') ? '0.9' : '0.8'}</priority>
  </url>`).join('')}
</urlset>
  `;
};
