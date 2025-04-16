/**
 * Content Generator for Stain Removal Guides
 * 
 * This module generates human-readable content from the database schema
 * following the content structure guidelines.
 */

import { 
  type Stain, 
  type Material, 
  type InsertStainRemovalGuide,
  effectivenessEnum
} from "@shared/schema";

// Types for generated content
interface Step {
  title: string;
  description: string;
}

interface Supply {
  name: string;
  description: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface GeneratedContent {
  intro: string;
  steps: Step[];
  supplies: Supply[];
  warnings: string[];
  effectiveness: {
    rating: string;
    description: string;
    freshStains: number;
    oldStains: number;
    setInStains: number;
  };
  faqs: FAQ[];
  difficulty: string;
  timeRequired: string;
  successRate: number;
}

/**
 * Normalize product names to avoid duplication with slightly different wording
 */
export function normalizeProductName(name: string): string {
  // Convert to lowercase and trim
  let normalized = name.toLowerCase().trim();
  
  // Normalize common variations
  const replacements: Record<string, string> = {
    'dish soap': 'liquid dish soap',
    'dishwashing liquid': 'liquid dish soap',
    'dish washing soap': 'liquid dish soap',
    'dishwashing soap': 'liquid dish soap',
    'laundry detergent': 'liquid laundry detergent',
    'detergent': 'liquid laundry detergent',
    'washing powder': 'powdered laundry detergent',
    'white vinegar': 'distilled white vinegar',
    'vinegar': 'distilled white vinegar',
    'hydrogen peroxide 3%': 'hydrogen peroxide',
    '3% hydrogen peroxide': 'hydrogen peroxide',
    'baking soda': 'baking soda',
    'sodium bicarbonate': 'baking soda',
    'rubbing alcohol': 'isopropyl alcohol',
    'isopropyl': 'isopropyl alcohol',
    'club soda': 'carbonated water',
    'enzyme cleaner': 'enzymatic stain remover',
    'enzyme stain remover': 'enzymatic stain remover',
    'ammonia solution': 'household ammonia',
    'diluted ammonia': 'household ammonia'
  };
  
  // Apply replacements
  for (const [pattern, replacement] of Object.entries(replacements)) {
    if (normalized === pattern || normalized.includes(pattern)) {
      normalized = replacement;
      break;
    }
  }
  
  return normalized;
}

/**
 * Generate an introduction paragraph for a stain-material pair
 */
export function generateIntro(stain: Stain, material: Material): string {
  const stainName = stain.displayName.toLowerCase();
  const materialName = material.displayName.toLowerCase();
  const isMaterialDelicate = ['silk', 'wool', 'suede', 'leather'].includes(material.name);
  const isStainOily = ['oil', 'grease', 'lipstick'].includes(stain.name);
  const isStainProtein = ['blood', 'egg', 'milk', 'sweat'].includes(stain.name);
  
  let intro = `Removing ${stainName} stains from ${materialName} can be tricky, but with the right technique, it's usually fixable. This guide walks you through step-by-step how to get rid of ${stainName} stains on ${materialName} using common household supplies.`;
  
  // Add material-specific context
  if (isMaterialDelicate) {
    intro += ` Since ${materialName} is a delicate material, you'll need to take extra care to avoid damaging the fibers while removing the stain.`;
  } else if (material.type === 'hard_surface') {
    intro += ` ${material.displayName} surfaces require special care to remove stains without causing damage to the finish or material.`;
  }
  
  // Add stain-specific context
  if (isStainOily) {
    intro += ` ${stain.displayName} stains contain oils that can be particularly stubborn to remove, especially after they've had time to set into the fabric.`;
  } else if (isStainProtein) {
    intro += ` As a protein-based stain, ${stainName} requires careful treatment—hot water can make it set permanently into the fibers.`;
  } else if (stain.category === 'beverage') {
    intro += ` Like most beverage stains, ${stainName} can contain sugars and tannins that bond with fibers over time, making quick action important.`;
  }
  
  return intro;
}

/**
 * Generate step-by-step instructions based on pre-treatment and wash method
 */
export function generateSteps(preTreatment: string, washMethod: string): Step[] {
  // Split the pre-treatment into its own step
  const steps: Step[] = [
    {
      title: "Immediate Response",
      description: preTreatment
    }
  ];
  
  // Split wash method into logical steps (approximately 2-4 steps)
  const washSentences = washMethod.split(/(?<=\.)\s+/);
  
  if (washSentences.length <= 2) {
    // If wash method is short, make it one step
    steps.push({
      title: "Cleaning Process",
      description: washMethod
    });
  } else {
    // Split into multiple logical steps
    let currentStep = "";
    let stepCount = 0;
    
    for (let i = 0; i < washSentences.length; i++) {
      currentStep += washSentences[i] + " ";
      
      // Create a new step after every 1-2 sentences, or at the end
      if ((i + 1) % 2 === 0 || i === washSentences.length - 1) {
        stepCount++;
        let title = "";
        
        // Generate logical step titles
        if (stepCount === 1) {
          title = "Apply Cleaning Solution";
        } else if (i === washSentences.length - 1) {
          title = "Final Rinse and Dry";
        } else {
          title = "Work the Solution";
        }
        
        steps.push({
          title,
          description: currentStep.trim()
        });
        
        currentStep = "";
      }
    }
  }
  
  // Always add a final step for checking results
  steps.push({
    title: "Check Results",
    description: "Allow the area to dry completely and check if the stain is fully removed. If traces remain, repeat the process. For stubborn stains that persist after multiple attempts, professional cleaning may be necessary."
  });
  
  return steps;
}

/**
 * Generate a list of supplies with descriptions
 */
export function generateSupplies(products: string[]): Supply[] {
  const normalizedProducts = products.map(normalizeProductName);
  // Convert to array to avoid TypeScript iteration issues with Set
  const uniqueProductsSet = new Set(normalizedProducts);
  const uniqueProducts = Array.from(uniqueProductsSet);
  
  // Product descriptions for common items
  const productDescriptions: Record<string, string> = {
    'liquid dish soap': 'Gentle degreaser that helps break down many types of stains',
    'liquid laundry detergent': 'Formulated to remove a variety of stains from fabrics',
    'powdered laundry detergent': 'Contains enzymes that help break down protein-based stains',
    'distilled white vinegar': 'Mild acid that helps dissolve stains and odors',
    'hydrogen peroxide': 'Mild bleaching agent safe for many fabrics',
    'baking soda': 'Absorbent powder that helps neutralize odors and lift stains',
    'isopropyl alcohol': 'Solvent that can dissolve many oil-based stains',
    'carbonated water': 'The bubbles help lift fresh stains from fabric fibers',
    'enzymatic stain remover': 'Contains enzymes that break down specific types of stains',
    'household ammonia': 'Strong cleaner effective on grease and some stubborn stains',
    'clean white cloth': 'For blotting stains without transferring dyes',
    'soft-bristled brush': 'For gently working cleaner into stains',
    'cold water': 'For rinsing and diluting stain-removing solutions',
    'warm water': 'Helps activate cleaning agents for better stain removal',
    'cotton swabs': 'For precise application of cleaning solutions',
    'spray bottle': 'For applying cleaning solutions evenly',
    'paper towels': 'For absorbing excess moisture and blotting stains',
    'sponge': 'For applying and working in cleaning solutions',
    'gloves': 'To protect hands from cleaning chemicals',
    'lemon juice': 'Natural acid that helps brighten and remove some stains',
    'salt': 'Abrasive agent that can help lift stains when combined with other cleaners',
    'ice cubes': 'For hardening substances like gum or wax for easier removal',
    'stain remover stick': 'Concentrated pre-treatment for stubborn stains',
    'oxygen bleach': 'Color-safe bleach that is effective on many organic stains',
    'shaving cream': 'Contains surfactants that help lift grease and oil stains'
  };
  
  // Add common supplies that might be needed but not explicitly listed
  const additionalSupplies = ['clean white cloth', 'soft-bristled brush', 'gloves'];
  
  const supplies: Supply[] = [];
  
  // Add all normalized products with descriptions
  uniqueProducts.forEach(product => {
    supplies.push({
      name: product.charAt(0).toUpperCase() + product.slice(1), // Capitalize first letter
      description: productDescriptions[product] || 'Helps remove the stain effectively'
    });
  });
  
  // Add any missing but commonly needed supplies
  additionalSupplies.forEach(supply => {
    if (!uniqueProducts.includes(supply)) {
      supplies.push({
        name: supply.charAt(0).toUpperCase() + supply.slice(1), // Capitalize first letter
        description: productDescriptions[supply] || 'Necessary for the stain removal process'
      });
    }
  });
  
  return supplies;
}

/**
 * Generate an effectiveness description based on the effectiveness rating
 */
export function generateEffectivenessData(
  effectiveness: string, 
  stain: Stain, 
  material: Material
): {
  rating: string;
  description: string;
  freshStains: number;
  oldStains: number;
  setInStains: number;
} {
  const stainName = stain.displayName.toLowerCase();
  const materialName = material.displayName.toLowerCase();
  
  // Map effectiveness to rating and success percentages
  let rating = '';
  let freshStains = 0;
  let oldStains = 0;
  let setInStains = 0;
  
  switch (effectiveness) {
    case 'excellent':
      rating = 'excellent (highly effective)';
      freshStains = 95;
      oldStains = 85;
      setInStains = 75;
      break;
    case 'good':
      rating = 'good';
      freshStains = 85;
      oldStains = 70;
      setInStains = 55;
      break;
    case 'fair':
      rating = 'moderate';
      freshStains = 70;
      oldStains = 50;
      setInStains = 35;
      break;
    case 'poor':
      rating = 'challenging';
      freshStains = 50;
      oldStains = 30;
      setInStains = 15;
      break;
    default:
      rating = 'variable';
      freshStains = 65;
      oldStains = 45;
      setInStains = 25;
  }
  
  // Generate description based on effectiveness
  let description = `This method is rated ${rating} for ${stainName} on ${materialName}.`;
  
  if (effectiveness === 'excellent' || effectiveness === 'good') {
    description += ` It works well when applied promptly, with a high success rate for fresh stains. Even older stains respond well to this treatment in most cases.`;
  } else if (effectiveness === 'fair') {
    description += ` It works reasonably well on fresh stains, but older or set-in stains may require multiple treatments or professional cleaning.`;
  } else {
    description += ` ${stain.displayName} stains can be particularly difficult to remove from ${materialName}, especially after they've had time to set. For best results, treat the stain immediately and consider professional cleaning for valuable items.`;
  }
  
  return {
    rating,
    description,
    freshStains,
    oldStains,
    setInStains
  };
}

/**
 * Generate FAQ questions and answers based on the guide data
 */
export function generateFAQs(
  stain: Stain, 
  material: Material, 
  preTreatment: string, 
  washMethod: string, 
  warnings: string[]
): FAQ[] {
  const stainName = stain.displayName.toLowerCase();
  const materialName = material.displayName.toLowerCase();
  
  // Generate standard FAQs based on material type
  const faqs: FAQ[] = [];
  
  // FAQ about prevention
  faqs.push({
    question: `How can I prevent ${stainName} stains on ${materialName}?`,
    answer: `The best prevention is quick action. For ${materialName}, immediately blot (don't rub) any spills with a clean cloth. ${material.type === 'natural' ? 'Consider applying a fabric protector designed for natural fibers.' : material.type === 'synthetic' ? 'Many synthetic fabrics come with stain resistance, but reapplying fabric protector after several washes helps maintain this property.' : 'Regular maintenance and prompt cleaning of spills is the best prevention strategy.'}`
  });
  
  // FAQ about stain setting
  faqs.push({
    question: `How long before a ${stainName} stain becomes permanent on ${materialName}?`,
    answer: `${stainName} stains can begin to set within 24-48 hours on ${materialName}. The longer a stain remains untreated, the more difficult it becomes to remove. Heat (including hot water, dryers, or ironing) can permanently set the stain, making it nearly impossible to remove completely.`
  });
  
  // Material-specific FAQ
  if (material.type === 'natural') {
    faqs.push({
      question: `Can I use bleach to remove ${stainName} stains from ${materialName}?`,
      answer: `${material.name === 'cotton' ? 'Chlorine bleach can be used on white cotton items but may weaken fibers over time. For colored cotton, use only oxygen bleach to avoid color damage.' : 'Bleach is not recommended for ' + materialName + ' as it can damage the fibers and cause discoloration. Stick to the gentler methods described in this guide.'}`
    });
  } else if (material.type === 'leather') {
    faqs.push({
      question: `Will treating this ${stainName} stain damage my ${materialName}?`,
      answer: `When done properly, the methods described should not damage your ${materialName}. However, always test any cleaning solution on an inconspicuous area first. ${materialName} is sensitive to water and harsh chemicals, so use minimal moisture and dry thoroughly to prevent water stains or material damage.`
    });
  } else if (material.type === 'hard_surface') {
    faqs.push({
      question: `Can ${stainName} permanently stain ${materialName}?`,
      answer: `${material.name === 'marble' ? 'Yes, marble is porous and can be permanently stained by acidic substances like wine, coffee, or fruit juices. Sealing your marble periodically helps prevent staining.' : material.name === 'wood' ? 'Yes, wood can be permanently stained, especially if the finish is damaged or worn. The faster you treat the stain, the better chance you have of preventing permanent damage.' : 'With proper care and prompt cleaning, most stains can be removed from ' + materialName + ' without permanent damage.'}`
    });
  }
  
  // Stain-specific FAQ
  if (stain.category === 'beverage' || stain.category === 'food') {
    faqs.push({
      question: `Does the temperature of water matter when treating ${stainName} stains?`,
      answer: `Yes, temperature is crucial. ${stain.category === 'food' && stain.name.includes('protein') ? 'Never use hot water on protein-based food stains as it cooks the protein into the fabric. Always use cold water initially.' : 'For ' + stainName + ' stains, start with cold water to flush out the stain before it sets. Hot water can set some components of the stain making it permanent.'}`
    });
  } else if (stain.category === 'oil') {
    faqs.push({
      question: `Why do I need dish soap for ${stainName} stains?`,
      answer: `Dish soap is formulated to break down grease and oils, which is why it's effective on ${stainName} stains. The surfactants in dish soap help to dissolve the oil molecules so they can be rinsed away from the ${materialName} fibers.`
    });
  } else if (stain.category === 'ink') {
    faqs.push({
      question: `Are some types of ${stainName} stains harder to remove than others?`,
      answer: `Yes, permanent markers and certain ink formulations are designed to be waterproof and can be extremely difficult to remove completely. Ballpoint ink is typically easier to remove than permanent marker or India ink. The age of the stain also makes a significant difference—fresh ink stains are much more responsive to treatment.`
    });
  }
  
  return faqs;
}

/**
 * Generate a complete stain removal guide content
 */
export function generateGuideContent(
  stain: Stain,
  material: Material,
  preTreatment: string,
  products: string[],
  washMethod: string,
  warnings: string[],
  effectiveness: string
): GeneratedContent {
  // Generate content components
  const intro = generateIntro(stain, material);
  const steps = generateSteps(preTreatment, washMethod);
  const supplies = generateSupplies(products);
  const effectivenessData = generateEffectivenessData(effectiveness, stain, material);
  const faqs = generateFAQs(stain, material, preTreatment, washMethod, warnings);
  
  // Generate time required based on steps complexity
  let timeRequired = "5-10 minutes";
  if (steps.length > 4) {
    timeRequired = "15-20 minutes";
  }
  if (washMethod.includes("overnight") || washMethod.includes("hours")) {
    timeRequired = "Several hours";
  }
  
  // Generate difficulty based on effectiveness and number of steps
  let difficulty = "Easy";
  if (effectiveness === 'fair' || steps.length > 5) {
    difficulty = "Moderate";
  }
  if (effectiveness === 'poor') {
    difficulty = "Difficult";
  }
  
  // Generate success rate percentage based on effectiveness
  let successRate = 95;
  if (effectiveness === 'good') {
    successRate = 80;
  } else if (effectiveness === 'fair') {
    successRate = 65;
  } else if (effectiveness === 'poor') {
    successRate = 45;
  }
  
  return {
    intro,
    steps,
    supplies,
    warnings,
    effectiveness: effectivenessData,
    faqs,
    difficulty,
    timeRequired,
    successRate
  };
}

/**
 * Prepare a stain removal guide for database insertion
 */
export function prepareGuideForDatabase(
  stainId: number,
  materialId: number,
  preTreatment: string,
  products: string[],
  washMethod: string,
  warnings: string[],
  effectiveness: string
): InsertStainRemovalGuide {
  // Get stain and material data
  // In a real application, these would be fetched from the database
  // For now, we'll need to pass these in from wherever this function is called
  
  // Generate guide content
  const content = generateGuideContent({
    id: stainId,
    name: '',
    displayName: '',
    color: '',
    category: '' as any,
    description: '',
    icon: ''
  }, {
    id: materialId,
    name: '',
    displayName: '',
    type: '' as any,
    careNotes: '',
    description: '',
    commonUses: '',
    icon: ''
  }, preTreatment, products, washMethod, warnings, effectiveness);
  
  // Prepare for database insertion
  return {
    stainId,
    materialId,
    preTreatment,
    products: JSON.stringify(content.supplies.map(s => ({ name: s.name, description: s.description }))),
    washMethod,
    warnings: JSON.stringify(warnings),
    effectiveness: effectiveness as any,
    difficulty: content.difficulty,
    timeRequired: content.timeRequired,
    successRate: content.successRate,
    faq: JSON.stringify(content.faqs),
    steps: JSON.stringify(content.steps)
  };
}