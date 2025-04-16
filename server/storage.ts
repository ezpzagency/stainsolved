import { users, type User, type InsertUser } from "@shared/schema";
import { 
  stains, 
  materials, 
  stainRemovalGuides, 
  type Stain, 
  type Material, 
  type StainRemovalGuide, 
  type InsertStain, 
  type InsertMaterial, 
  type InsertStainRemovalGuide 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, asc, desc, or, sql } from "drizzle-orm";

// Interface for all storage operations
export interface IStorage {
  // Users (keeping for compatibility)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Stains
  getStain(id: number): Promise<Stain | undefined>;
  getStainByName(name: string): Promise<Stain | undefined>;
  getAllStains(): Promise<Stain[]>;
  createStain(stain: InsertStain): Promise<Stain>;
  
  // Materials
  getMaterial(id: number): Promise<Material | undefined>;
  getMaterialByName(name: string): Promise<Material | undefined>;
  getAllMaterials(): Promise<Material[]>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  
  // Stain removal guides
  getStainRemovalGuide(id: number): Promise<StainRemovalGuide | undefined>;
  getGuideByStainAndMaterial(stainId: number, materialId: number): Promise<StainRemovalGuide | undefined>;
  getGuideByStainAndMaterialNames(stainName: string, materialName: string): Promise<StainRemovalGuide | undefined>;
  getAllStainRemovalGuides(): Promise<StainRemovalGuide[]>;
  createStainRemovalGuide(guide: InsertStainRemovalGuide): Promise<StainRemovalGuide>;
  
  // Get guides with related stain and material data
  getRelatedGuides(stainId: number, materialId: number): Promise<StainRemovalGuide[]>;
}

// Database implementation of storage interface
export class DatabaseStorage implements IStorage {
  // User methods (keeping for compatibility)
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Stain methods
  async getStain(id: number): Promise<Stain | undefined> {
    const [stain] = await db.select().from(stains).where(eq(stains.id, id));
    return stain;
  }
  
  async getStainByName(name: string): Promise<Stain | undefined> {
    const [stain] = await db.select().from(stains).where(eq(stains.name, name));
    return stain;
  }
  
  async getAllStains(): Promise<Stain[]> {
    return db.select().from(stains).orderBy(asc(stains.name));
  }
  
  async createStain(insertStain: InsertStain): Promise<Stain> {
    const [stain] = await db
      .insert(stains)
      .values(insertStain)
      .returning();
    return stain;
  }
  
  // Material methods
  async getMaterial(id: number): Promise<Material | undefined> {
    const [material] = await db.select().from(materials).where(eq(materials.id, id));
    return material;
  }
  
  async getMaterialByName(name: string): Promise<Material | undefined> {
    const [material] = await db.select().from(materials).where(eq(materials.name, name));
    return material;
  }
  
  async getAllMaterials(): Promise<Material[]> {
    return db.select().from(materials).orderBy(asc(materials.name));
  }
  
  async createMaterial(insertMaterial: InsertMaterial): Promise<Material> {
    const [material] = await db
      .insert(materials)
      .values(insertMaterial)
      .returning();
    return material;
  }
  
  // Stain removal guide methods
  async getStainRemovalGuide(id: number): Promise<StainRemovalGuide | undefined> {
    const [guide] = await db.select().from(stainRemovalGuides).where(eq(stainRemovalGuides.id, id));
    return guide;
  }
  
  async getGuideByStainAndMaterial(stainId: number, materialId: number): Promise<StainRemovalGuide | undefined> {
    const [guide] = await db
      .select()
      .from(stainRemovalGuides)
      .where(
        and(
          eq(stainRemovalGuides.stainId, stainId),
          eq(stainRemovalGuides.materialId, materialId)
        )
      );
    return guide;
  }
  
  async getGuideByStainAndMaterialNames(stainName: string, materialName: string): Promise<StainRemovalGuide | undefined> {
    const result = await db
      .select({
        guide: stainRemovalGuides,
        stain: stains,
        material: materials
      })
      .from(stainRemovalGuides)
      .innerJoin(stains, eq(stainRemovalGuides.stainId, stains.id))
      .innerJoin(materials, eq(stainRemovalGuides.materialId, materials.id))
      .where(
        and(
          eq(stains.name, stainName),
          eq(materials.name, materialName)
        )
      );
    
    if (result.length === 0) return undefined;
    return result[0].guide;
  }
  
  async getAllStainRemovalGuides(): Promise<StainRemovalGuide[]> {
    return db.select().from(stainRemovalGuides);
  }
  
  async createStainRemovalGuide(insertGuide: InsertStainRemovalGuide): Promise<StainRemovalGuide> {
    const [guide] = await db
      .insert(stainRemovalGuides)
      .values(insertGuide)
      .returning();
    return guide;
  }
  
  async getRelatedGuides(stainId: number, materialId: number): Promise<StainRemovalGuide[]> {
    const guides = await db
      .select()
      .from(stainRemovalGuides)
      .where(
        or(
          eq(stainRemovalGuides.stainId, stainId),
          eq(stainRemovalGuides.materialId, materialId)
        )
      )
      .limit(4);
    
    return guides;
  }
}

// Use Database Storage
export const storage = new DatabaseStorage();
