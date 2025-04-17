import { db } from "./server/db";
import { stains, materials, stainRemovalGuides, effectivenessEnum } from "./shared/schema";
import { and, eq } from "drizzle-orm";
import { generateGuideContent, normalizeProductName } from "./server/contentGenerator";
import * as fs from 'fs';
import * as path from 'path';

// Import the guide types
import { GuideData, normalizeGuideProducts, validateGuide } from './seed-guides';

async function validateAllGuides() {
  try {
    console.log("Starting to validate all guides...");
    
    // Get all guides from the database
    const existingGuides = await db
      .select()
      .from(stainRemovalGuides);
      
    console.log(`Found ${existingGuides.length} existing guides in the database`);
    
    const validationReport: Record<string, any> = {};
    
    // For each guide, validate the content
    for (const guide of existingGuides) {
      // Get related stain and material
      const [stain] = await db
        .select()
        .from(stains)
        .where(eq(stains.id, guide.stainId));
        
      const [material] = await db
        .select()
        .from(materials)
        .where(eq(materials.id, guide.materialId));
        
      if (!stain || !material) {
        console.log(`Skipping guide #${guide.id} - stain or material not found`);
        continue;
      }
      
      // Convert database format to GuideData format
      const guideData: GuideData = {
        stainName: stain.name,
        materialName: material.name,
        preTreatment: guide.preTreatment,
        products: JSON.parse(guide.products as string).map((p: any) => p.name),
        washMethod: guide.washMethod,
        warnings: JSON.parse(guide.warnings as string),
        effectiveness: guide.effectiveness
      };
      
      // Parse steps and other generated content
      const steps = JSON.parse(guide.steps as string);
      const faqs = JSON.parse(guide.faq as string);
      
      // Create content object for validation
      const content = {
        steps,
        faqs,
        supplies: JSON.parse(guide.products as string),
        difficulty: guide.difficulty,
        timeRequired: guide.timeRequired,
        successRate: guide.successRate
      };
      
      // Validate guide against requirements
      const { valid, validationResults } = validateGuide(guideData, content);
      
      // Record validation results
      const guideName = `${stain.name}_${material.name}`;
      validationReport[guideName] = {
        stainName: stain.name,
        materialName: material.name,
        stepCount: steps.length,
        productCount: guideData.products.length,
        warningCount: guideData.warnings.length,
        effectiveness: guideData.effectiveness,
        validation: validationResults,
        valid
      };
    }
    
    // Write validation report to file
    const reportPath = path.join(__dirname, 'guide-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(validationReport, null, 2));
    console.log(`Validation report written to ${reportPath}`);
    
    // Count validation stats
    const stats = {
      totalGuides: Object.keys(validationReport).length,
      validGuides: Object.values(validationReport).filter(v => v.valid).length,
      stepIssues: Object.values(validationReport).filter(v => !v.validation.hasSteps).length,
      productIssues: Object.values(validationReport).filter(v => !v.validation.hasProducts).length,
      warningIssues: Object.values(validationReport).filter(v => !v.validation.hasWarnings).length,
      effectivenessIssues: Object.values(validationReport).filter(v => !v.validation.hasEffectiveness).length
    };
    
    console.log('Validation summary:');
    console.log(JSON.stringify(stats, null, 2));
    
  } catch (error) {
    console.error("Error validating guides:", error);
  } finally {
    // For Neon DB with Drizzle ORM, we need to get the underlying connection pool
    try {
      if (db && db.$client && 'pool' in db.$client) {
        const pool = (db.$client as any).pool;
        await pool.end();
        console.log('Database connection pool closed successfully');
      } else {
        console.log('No database pool to close');
      }
    } catch (err) {
      console.error('Error closing database connection:', err);
    }
  }
}

// Execute the validation function
validateAllGuides().catch(console.error);