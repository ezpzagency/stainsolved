import { pgTable, text, serial, integer, pgEnum, timestamp, varchar, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const stainCategoryEnum = pgEnum('stain_category', [
  'beverage', 'food', 'oil', 'ink', 'dirt', 'bodily_fluid', 'makeup', 'grass', 'other'
]);

export const materialTypeEnum = pgEnum('material_type', [
  'natural', 'synthetic', 'leather', 'upholstery', 'hard_surface', 'other'
]);

export const effectivenessEnum = pgEnum('effectiveness', [
  'excellent', 'good', 'fair', 'poor'
]);

// Tables
export const stains = pgTable('stains', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  displayName: text('display_name').notNull(),
  color: text('color').notNull(),
  category: stainCategoryEnum('category').notNull(),
  description: text('description'),
  icon: text('icon').default('stain'),
});

export const materials = pgTable('materials', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  displayName: text('display_name').notNull(),
  type: materialTypeEnum('type').notNull(),
  careNotes: text('care_notes'),
  description: text('description'),
  commonUses: text('common_uses'),
  icon: text('icon').default('material'),
});

export const stainRemovalGuides = pgTable('stain_removal_guides', {
  id: serial('id').primaryKey(),
  stainId: integer('stain_id').notNull().references(() => stains.id),
  materialId: integer('material_id').notNull().references(() => materials.id),
  preTreatment: text('pre_treatment').notNull(),
  products: json('products').notNull(),
  washMethod: text('wash_method').notNull(),
  warnings: json('warnings').notNull(),
  effectiveness: effectivenessEnum('effectiveness').notNull(),
  difficulty: text('difficulty').notNull(),
  timeRequired: text('time_required').notNull(),
  successRate: integer('success_rate').notNull(),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
  faq: json('faq').notNull(),
  steps: json('steps').notNull(),
});

// Relations
export const stainsRelations = relations(stains, ({ many }) => ({
  guides: many(stainRemovalGuides),
}));

export const materialsRelations = relations(materials, ({ many }) => ({
  guides: many(stainRemovalGuides),
}));

export const stainRemovalGuidesRelations = relations(stainRemovalGuides, ({ one }) => ({
  stain: one(stains, {
    fields: [stainRemovalGuides.stainId],
    references: [stains.id],
  }),
  material: one(materials, {
    fields: [stainRemovalGuides.materialId],
    references: [materials.id],
  }),
}));

// Legacy user schema (keeping for compatibility)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Zod schemas
export const insertStainSchema = createInsertSchema(stains).omit({ id: true });
export const insertMaterialSchema = createInsertSchema(materials).omit({ id: true });
export const insertStainRemovalGuideSchema = createInsertSchema(stainRemovalGuides).omit({ id: true, lastUpdated: true });
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Types
export type InsertStain = z.infer<typeof insertStainSchema>;
export type Stain = typeof stains.$inferSelect;

export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Material = typeof materials.$inferSelect;

export type InsertStainRemovalGuide = z.infer<typeof insertStainRemovalGuideSchema>;
export type StainRemovalGuide = typeof stainRemovalGuides.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
