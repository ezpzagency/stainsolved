/**
 * Content Validation Script
 * 
 * This script validates all stain removal guides to ensure they meet quality standards.
 * It will fail the build if any guide doesn't meet the requirements:
 * - At least 3 steps
 * - At least 1 warning
 * - At least 3 products
 * - Valid JSON-LD schema for HowTo and FAQPage
 * 
 * Run with: npm run validate-content
 */

import { db } from './server/db';
import { stainRemovalGuides, stains, materials } from './shared/schema';
import { eq } from 'drizzle-orm';
import { generateStructuredData } from './client/src/utils/SeoUtils';

interface ValidationError {
  guideId: number;
  stainName: string;
  materialName: string;
  errors: string[];
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
}

/**
 * Validates JSON-LD schema for HowTo
 */
function validateHowToSchema(stainName: string, materialName: string, steps: any[], products: any[]): string[] {
  const errors: string[] = [];
  
  // Create structured data
  const howToData = generateStructuredData({
    type: 'HowTo',
    name: `How to Remove ${stainName} from ${materialName}`,
    description: `Step-by-step guide on removing ${stainName.toLowerCase()} stains from ${materialName.toLowerCase()}.`,
    steps: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: step.description
    })),
    supplies: products.map(product => ({
      "@type": "HowToSupply",
      name: product.name
    }))
  });
  
  // Validate required fields for Schema.org HowTo
  if (!howToData["@context"] || howToData["@context"] !== "https://schema.org") {
    errors.push("HowTo schema missing @context or incorrect context value");
  }
  
  if (!howToData["@type"] || howToData["@type"] !== "HowTo") {
    errors.push("HowTo schema missing @type or incorrect type value");
  }
  
  if (!howToData.name || typeof howToData.name !== 'string' || howToData.name.trim() === '') {
    errors.push("HowTo schema missing name or name is empty");
  }
  
  if (!howToData.description || typeof howToData.description !== 'string' || howToData.description.trim() === '') {
    errors.push("HowTo schema missing description or description is empty");
  }
  
  if (!howToData.step || !Array.isArray(howToData.step) || howToData.step.length === 0) {
    errors.push("HowTo schema missing steps or steps array is empty");
  } else {
    // Validate each step
    howToData.step.forEach((step: any, index: number) => {
      if (!step["@type"] || step["@type"] !== "HowToStep") {
        errors.push(`Step ${index + 1} has missing or incorrect @type`);
      }
      
      if (!step.position || typeof step.position !== 'number') {
        errors.push(`Step ${index + 1} has missing or incorrect position`);
      }
      
      if (!step.name || typeof step.name !== 'string' || step.name.trim() === '') {
        errors.push(`Step ${index + 1} has missing or empty name`);
      }
      
      if (!step.text || typeof step.text !== 'string' || step.text.trim() === '') {
        errors.push(`Step ${index + 1} has missing or empty text`);
      }
    });
  }
  
  return errors;
}

/**
 * Validates JSON-LD schema for FAQPage
 */
function validateFAQSchema(faqItems: any[]): string[] {
  const errors: string[] = [];
  
  // Create structured data
  const faqData = generateStructuredData({
    type: 'FAQPage',
    name: 'Frequently Asked Questions',
    description: 'Common questions and answers about stain removal',
    mainEntity: faqItems.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  });
  
  // Validate required fields for Schema.org FAQPage
  if (!faqData["@context"] || faqData["@context"] !== "https://schema.org") {
    errors.push("FAQPage schema missing @context or incorrect context value");
  }
  
  if (!faqData["@type"] || faqData["@type"] !== "FAQPage") {
    errors.push("FAQPage schema missing @type or incorrect type value");
  }
  
  if (!faqData.mainEntity || !Array.isArray(faqData.mainEntity) || faqData.mainEntity.length === 0) {
    errors.push("FAQPage schema missing mainEntity or mainEntity array is empty");
  } else {
    // Validate each FAQ item
    faqData.mainEntity.forEach((item: any, index: number) => {
      if (!item["@type"] || item["@type"] !== "Question") {
        errors.push(`FAQ item ${index + 1} has missing or incorrect @type`);
      }
      
      if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
        errors.push(`FAQ item ${index + 1} has missing or empty question`);
      }
      
      if (!item.acceptedAnswer || !item.acceptedAnswer["@type"] || item.acceptedAnswer["@type"] !== "Answer") {
        errors.push(`FAQ item ${index + 1} has missing or incorrect acceptedAnswer`);
      }
      
      if (!item.acceptedAnswer.text || typeof item.acceptedAnswer.text !== 'string' || item.acceptedAnswer.text.trim() === '') {
        errors.push(`FAQ item ${index + 1} has missing or empty answer`);
      }
    });
  }
  
  return errors;
}

/**
 * Main validation function - validates a single guide
 */
async function validateGuide(guideId: number): Promise<ValidationError | null> {
  // Fetch the guide
  const guide = await db.query.stainRemovalGuides.findFirst({
    where: eq(stainRemovalGuides.id, guideId),
  });
  
  if (!guide) {
    console.error(`Guide with ID ${guideId} not found`);
    return null;
  }
  
  // Fetch related stain and material data
  const stainData = await db.query.stains.findFirst({
    where: eq(stains.id, guide.stainId),
  });
  
  const materialData = await db.query.materials.findFirst({
    where: eq(materials.id, guide.materialId),
  });
  
  if (!stainData || !materialData) {
    console.error(`Stain or material data not found for guide ${guideId}`);
    return null;
  }
  
  const errors: string[] = [];
  
  // Parse JSON fields from the guide
  const products = Array.isArray(guide.products) ? guide.products : JSON.parse(guide.products as string);
  const warnings = Array.isArray(guide.warnings) ? guide.warnings : JSON.parse(guide.warnings as string);
  const steps = Array.isArray(guide.steps) ? guide.steps : JSON.parse(guide.steps as string);
  const faqItems = Array.isArray(guide.faq) ? guide.faq : JSON.parse(guide.faq as string);
  
  // Validate minimum content requirements
  if (!steps || steps.length < 3) {
    errors.push(`Guide needs at least 3 steps, found ${steps?.length || 0}`);
  }
  
  if (!warnings || warnings.length < 1) {
    errors.push(`Guide needs at least 1 warning, found ${warnings?.length || 0}`);
  }
  
  if (!products || products.length < 3) {
    errors.push(`Guide needs at least 3 products, found ${products?.length || 0}`);
  }
  
  // Validate JSON-LD schemas
  if (steps && steps.length > 0 && products && products.length > 0) {
    const howToSchemaErrors = validateHowToSchema(
      stainData.displayName, 
      materialData.displayName, 
      steps, 
      products
    );
    errors.push(...howToSchemaErrors);
  }
  
  if (faqItems && faqItems.length > 0) {
    const faqSchemaErrors = validateFAQSchema(faqItems);
    errors.push(...faqSchemaErrors);
  }
  
  // Return null if no errors, otherwise return the validation error
  if (errors.length === 0) {
    return null;
  }
  
  return {
    guideId,
    stainName: stainData.name,
    materialName: materialData.name,
    errors
  };
}

/**
 * Validates all guides in the database
 */
export async function validateAllGuides(): Promise<ValidationResult> {
  // Fetch all guides
  const guides = await db.query.stainRemovalGuides.findMany();
  
  console.log(`Starting validation of ${guides.length} guides...`);
  
  const allErrors: ValidationError[] = [];
  let validCount = 0;
  
  // Validate each guide
  for (const guide of guides) {
    const errors = await validateGuide(guide.id);
    
    if (errors) {
      allErrors.push(errors);
    } else {
      validCount++;
    }
  }
  
  // Create validation result
  const result: ValidationResult = {
    valid: allErrors.length === 0,
    errors: allErrors,
    summary: {
      total: guides.length,
      valid: validCount,
      invalid: allErrors.length
    }
  };
  
  return result;
}

/**
 * Run validation and output results
 */
async function main() {
  try {
    console.log('Starting content validation...');
    const startTime = Date.now();
    
    const result = await validateAllGuides();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\nValidation completed in ${duration}s`);
    console.log(`\nSummary:`);
    console.log(`- Total guides: ${result.summary.total}`);
    console.log(`- Valid guides: ${result.summary.valid}`);
    console.log(`- Invalid guides: ${result.summary.invalid}`);
    
    if (result.errors.length > 0) {
      console.log('\nErrors found:');
      result.errors.forEach(error => {
        console.log(`\n► Guide: ${error.stainName} on ${error.materialName} (ID: ${error.guideId})`);
        error.errors.forEach(err => {
          console.log(`  ✘ ${err}`);
        });
      });
      
      // Export error report to JSON file
      const fs = require('fs');
      fs.writeFileSync(
        'content-validation-report.json', 
        JSON.stringify(result, null, 2)
      );
      console.log('\nDetailed report saved to content-validation-report.json');
      
      // Exit with error code to fail the build
      process.exit(1);
    } else {
      console.log('\n✓ All guides passed validation');
    }
  } catch (error) {
    console.error('Error during validation:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main()
    .then(() => console.log('Validation complete'))
    .catch(err => {
      console.error('Validation failed:', err);
      process.exit(1);
    });
}

// Export validation functions for testing
export {
  validateGuide,
  validateHowToSchema,
  validateFAQSchema
};