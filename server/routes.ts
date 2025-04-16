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

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  const httpServer = createServer(app);

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

  app.get("/api/guides/:stainName/:materialName", async (req, res) => {
    try {
      const { stainName, materialName } = req.params;
      logRequest(req, `Get guide: ${stainName}/${materialName}`);
      
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
      
      // Return complete response with stain, material, guide and related guides
      res.json({
        stain,
        material,
        guide,
        relatedGuides
      });
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
