import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertStainSchema, insertMaterialSchema, insertStainRemovalGuideSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Logger for AI crawler detection
function logRequest(req: Request, info: string) {
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const referer = req.headers['referer'] || 'None';
  const isAICrawler = isAI(userAgent);
  
  console.log(`[${new Date().toISOString()}] ${info} | UA: ${userAgent.substring(0, 100)} | Referer: ${referer} | AI: ${isAICrawler}`);
}

// Check if user agent is an AI crawler
function isAI(userAgent: string): boolean {
  const aiSignatures = [
    'gpt', 'chatgpt', 'openai', 'bingbot', 'perplexity', 'claude', 'anthropic', 
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 'yandex'
  ];
  
  const lowerAgent = userAgent.toLowerCase();
  return aiSignatures.some(sig => lowerAgent.includes(sig));
}

// Cache configuration for Incremental Static Regeneration (ISR)
interface CacheItem {
  data: any;
  cachedAt: number;
  revalidate: boolean;
}

// Simple in-memory ISR cache implementation
class ISRCache {
  private cache: Map<string, CacheItem>;
  private revalidationInterval: number; // milliseconds
  
  constructor(revalidationInterval = 5 * 60 * 1000) { // Default: 5 minutes
    this.cache = new Map();
    this.revalidationInterval = revalidationInterval;
  }
  
  get(key: string): any {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check if cache needs revalidation
    const now = Date.now();
    const isStale = (now - item.cachedAt) > this.revalidationInterval;
    
    if (isStale) {
      // Mark for revalidation, but still return cached data
      item.revalidate = true;
      this.cache.set(key, item);
    }
    
    return {
      data: item.data,
      isStale
    };
  }
  
  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      cachedAt: Date.now(),
      revalidate: false
    });
  }
  
  shouldRevalidate(key: string): boolean {
    const item = this.cache.get(key);
    return item ? item.revalidate : false;
  }
  
  keys(): string[] {
    return Array.from(this.cache.keys());
  }
}

// Initialize ISR cache with revalidation interval of 5 minutes
const isrCache = new ISRCache(5 * 60 * 1000);

// Function to pre-cache top guides for ISR
async function preloadTopGuidesForISR() {
  try {
    console.log('Preloading top guides for ISR cache...');
    
    // Get all guides
    const allGuides = await storage.getAllStainRemovalGuides();
    
    // Prioritize frequently edited or high-interest stains
    const priorityStains = ['blood', 'red_wine', 'coffee', 'ink', 'oil', 'makeup', 'grass', 'chocolate', 'mud', 'sweat'];
    
    // Sort guides by priority stains, then by last updated date
    const sortedGuides = allGuides.sort((a, b) => {
      // Get stain names for both guides (if available)
      const stainA = priorityStains.indexOf(a.stainName || '');
      const stainB = priorityStains.indexOf(b.stainName || '');
      
      // First sort by priority stains
      if (stainA !== -1 && stainB === -1) return -1;
      if (stainA === -1 && stainB !== -1) return 1;
      if (stainA !== -1 && stainB !== -1) {
        if (stainA !== stainB) return stainA - stainB;
      }
      
      // Then sort by last updated
      const dateA = new Date(a.lastUpdated).getTime();
      const dateB = new Date(b.lastUpdated).getTime();
      return dateB - dateA;
    });
    
    // Get the top 10 guides
    const topGuides = sortedGuides.slice(0, 10);
    
    // Cache each of the top guides
    for (const guide of topGuides) {
      try {
        const stain = await storage.getStain(guide.stainId);
        const material = await storage.getMaterial(guide.materialId);
        
        if (!stain || !material) continue;
        
        const relatedGuides = await storage.getRelatedGuides(stain.id, material.id);
        
        const cacheKey = `guide:${stain.name}:${material.name}`;
        
        // Cache the complete guide data
        isrCache.set(cacheKey, {
          stain,
          material,
          guide,
          relatedGuides
        });
        
        console.log(`Pre-cached guide: ${stain.name}/${material.name}`);
      } catch (err) {
        console.error(`Failed to pre-cache guide ID ${guide.id}:`, err);
      }
    }
    
    console.log(`Successfully pre-cached ${topGuides.length} top guides for ISR`);
  } catch (error) {
    console.error('Failed to preload top guides for ISR:', error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  const httpServer = createServer(app);
  
  // Preload top guides for ISR on server start
  preloadTopGuidesForISR();

  // Stains endpoints
  app.get("/api/stains", async (req, res) => {
    try {
      logRequest(req, "Get all stains");
      const stains = await storage.getAllStains();
      res.json(stains);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to get stains" });
    }
  });

  app.get("/api/stains/:name", async (req, res) => {
    try {
      const { name } = req.params;
      logRequest(req, `Get stain: ${name}`);
      const stain = await storage.getStainByName(name);
      
      if (!stain) {
        return res.status(404).json({ message: "Stain not found" });
      }
      
      res.json(stain);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to get stain" });
    }
  });

  app.post("/api/stains", async (req, res) => {
    try {
      const stainData = insertStainSchema.parse(req.body);
      const stain = await storage.createStain(stainData);
      res.status(201).json(stain);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error(error);
      res.status(500).json({ message: "Failed to create stain" });
    }
  });

  // Materials endpoints
  app.get("/api/materials", async (req, res) => {
    try {
      logRequest(req, "Get all materials");
      const materials = await storage.getAllMaterials();
      res.json(materials);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to get materials" });
    }
  });

  app.get("/api/materials/:name", async (req, res) => {
    try {
      const { name } = req.params;
      logRequest(req, `Get material: ${name}`);
      const material = await storage.getMaterialByName(name);
      
      if (!material) {
        return res.status(404).json({ message: "Material not found" });
      }
      
      res.json(material);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to get material" });
    }
  });

  app.post("/api/materials", async (req, res) => {
    try {
      const materialData = insertMaterialSchema.parse(req.body);
      const material = await storage.createMaterial(materialData);
      res.status(201).json(material);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error(error);
      res.status(500).json({ message: "Failed to create material" });
    }
  });

  // Stain Removal Guides endpoints
  app.get("/api/guides", async (req, res) => {
    try {
      logRequest(req, "Get all guides");
      const guides = await storage.getAllStainRemovalGuides();
      res.json(guides);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to get guides" });
    }
  });

  // Endpoint to get top guides for ISR prioritization
  app.get("/api/guides/top", async (req, res) => {
    try {
      logRequest(req, "Get top guides for ISR");
      
      // Get all guides
      const allGuides = await storage.getAllStainRemovalGuides();
      
      // Prioritize frequently edited or high-interest stains
      const priorityStains = ['blood', 'red_wine', 'coffee', 'ink', 'oil', 'makeup', 'grass', 'chocolate', 'mud', 'sweat'];
      
      // Sort guides by priority stains, then by last updated date
      const sortedGuides = allGuides.sort((a, b) => {
        // Get stain names for both guides (if available)
        const stainA = priorityStains.indexOf(a.stainName || '');
        const stainB = priorityStains.indexOf(b.stainName || '');
        
        // First sort by priority stains
        if (stainA !== -1 && stainB === -1) return -1;
        if (stainA === -1 && stainB !== -1) return 1;
        if (stainA !== -1 && stainB !== -1) {
          if (stainA !== stainB) return stainA - stainB;
        }
        
        // Then sort by last updated
        const dateA = new Date(a.lastUpdated).getTime();
        const dateB = new Date(b.lastUpdated).getTime();
        return dateB - dateA;
      });
      
      // Return the top 10 guides
      res.json(sortedGuides.slice(0, 10));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to get top guides" });
    }
  });

  app.get("/api/guides/:stainName/:materialName", async (req, res) => {
    try {
      const { stainName, materialName } = req.params;
      const cacheKey = `guide:${stainName}:${materialName}`;
      logRequest(req, `Get guide: ${stainName}/${materialName}`);
      
      // Check if we have cached data for ISR
      const cachedResult = isrCache.get(cacheKey);
      
      // If we have valid cached data, return it immediately
      if (cachedResult && !cachedResult.isStale) {
        // Add cache header for client-side caching
        res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
        res.json(cachedResult.data);
        return;
      }
      
      // If we have stale data, return it but trigger revalidation
      if (cachedResult && cachedResult.isStale) {
        // Return stale data immediately
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
        res.json(cachedResult.data);
        
        // Revalidate data in the background
        setTimeout(async () => {
          try {
            console.log(`Revalidating stale data for ${stainName}/${materialName}`);
            
            // Get fresh data
            const stain = await storage.getStainByName(stainName);
            const material = await storage.getMaterialByName(materialName);
            
            if (!stain || !material) return;
            
            const guide = await storage.getGuideByStainAndMaterial(stain.id, material.id);
            if (!guide) return;
            
            const relatedGuides = await storage.getRelatedGuides(stain.id, material.id);
            
            // Update the cache with fresh data
            isrCache.set(cacheKey, {
              stain,
              material,
              guide,
              relatedGuides
            });
            
            console.log(`Successfully revalidated data for ${stainName}/${materialName}`);
          } catch (error) {
            console.error(`Failed to revalidate data for ${stainName}/${materialName}:`, error);
          }
        }, 100); // Small delay to avoid blocking the response
        
        return;
      }
      
      // No cached data, fetch from database
      
      // Get stain and material
      const stain = await storage.getStainByName(stainName);
      const material = await storage.getMaterialByName(materialName);
      
      if (!stain || !material) {
        return res.status(404).json({ 
          message: !stain ? "Stain not found" : "Material not found" 
        });
      }
      
      // Get guide
      const guide = await storage.getGuideByStainAndMaterial(stain.id, material.id);
      
      if (!guide) {
        return res.status(404).json({ message: "Guide not found" });
      }
      
      // Get related guides
      const relatedGuides = await storage.getRelatedGuides(stain.id, material.id);
      
      // Prepare complete response
      const responseData = {
        stain,
        material,
        guide,
        relatedGuides
      };
      
      // Cache the data for future requests (ISR)
      isrCache.set(cacheKey, responseData);
      
      // Set cache headers for client-side caching
      res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
      
      // Return complete response
      res.json(responseData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to get guide" });
    }
  });

  app.post("/api/guides", async (req, res) => {
    try {
      const guideData = insertStainRemovalGuideSchema.parse(req.body);
      const guide = await storage.createStainRemovalGuide(guideData);
      res.status(201).json(guide);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error(error);
      res.status(500).json({ message: "Failed to create guide" });
    }
  });

  // Sitemap endpoint
  app.get("/api/sitemap", async (req, res) => {
    try {
      logRequest(req, "Generate sitemap");
      const stains = await storage.getAllStains();
      const materials = await storage.getAllMaterials();
      
      // Generate all possible URLs
      const stainUrls = stains.map(stain => `/stains/${stain.name}`);
      const materialUrls = materials.map(material => `/materials/${material.name}`);
      
      // Generate all possible combinations
      const guideUrls = [];
      for (const stain of stains) {
        for (const material of materials) {
          const guide = await storage.getGuideByStainAndMaterial(stain.id, material.id);
          if (guide) {
            guideUrls.push(`/remove/${stain.name}/${material.name}`);
          }
        }
      }
      
      const staticUrls = ['/', '/stains', '/materials', '/guides'];
      
      res.json({
        total: staticUrls.length + stainUrls.length + materialUrls.length + guideUrls.length,
        urls: [...staticUrls, ...stainUrls, ...materialUrls, ...guideUrls]
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to generate sitemap" });
    }
  });

  return httpServer;
}
