/**
 * Sitemap Generator
 * 
 * This script generates a sitemap.xml file for the website.
 * It fetches all valid paths from the API and creates an XML file.
 * 
 * Usage: npm run generate-sitemap
 */

import fs from 'fs';
import path from 'path';
import { generateSitemap } from './client/src/utils/SeoUtils';
import { db } from './server/db';
import { stains, materials, stainRemovalGuides } from './shared/schema';

const BASE_URL = 'https://stainsolver.com'; // Replace with your actual domain

async function main() {
  try {
    console.log('Generating sitemap.xml...');
    
    // Get all stains
    const allStains = await db.query.stains.findMany();
    console.log(`Found ${allStains.length} stains`);
    
    // Get all materials
    const allMaterials = await db.query.materials.findMany();
    console.log(`Found ${allMaterials.length} materials`);
    
    // Get all valid guides (combinations that actually exist)
    const allGuides = await db.query.stainRemovalGuides.findMany();
    console.log(`Found ${allGuides.length} guides`);
    
    // Generate URLs for static pages
    const staticUrls = ['/', '/stains', '/materials'];
    
    // Generate URLs for stain pages
    const stainUrls = allStains.map(stain => `/stains/${stain.name}`);
    
    // Generate URLs for material pages
    const materialUrls = allMaterials.map(material => `/materials/${material.name}`);
    
    // Generate URLs for guides
    const guideUrls = allGuides.map(guide => {
      const stain = allStains.find(s => s.id === guide.stainId);
      const material = allMaterials.find(m => m.id === guide.materialId);
      
      if (stain && material) {
        return `/remove/${stain.name}/${material.name}`;
      }
      return null;
    }).filter(Boolean) as string[];
    
    // Combine all URLs
    const allUrls = [...staticUrls, ...stainUrls, ...materialUrls, ...guideUrls];
    
    // Generate sitemap XML
    const sitemapXml = generateSitemap(BASE_URL, allUrls);
    
    // Write sitemap.xml to public directory
    fs.mkdirSync('./client/public', { recursive: true });
    fs.writeFileSync('./client/public/sitemap.xml', sitemapXml);
    
    console.log(`Sitemap generated with ${allUrls.length} URLs`);
    console.log('Sitemap written to ./client/public/sitemap.xml');
    
    return {
      success: true,
      totalUrls: allUrls.length
    };
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return {
      success: false,
      error
    };
  }
}

// Run the generator
if (require.main === module) {
  main()
    .then(result => {
      if (result.success) {
        console.log('Sitemap generation complete');
        process.exit(0);
      } else {
        console.error('Sitemap generation failed');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Unexpected error:', err);
      process.exit(1);
    });
}

export default main;