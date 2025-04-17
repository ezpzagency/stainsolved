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
 * Generate an introduction paragraph for a stain-material pair with varied templates
 */
export function generateIntro(stain: Stain, material: Material): string {
  const stainName = stain.displayName.toLowerCase();
  const materialName = material.displayName.toLowerCase();
  const isMaterialDelicate = ['silk', 'wool', 'suede', 'leather'].includes(material.name);
  const isStainOily = ['oil', 'grease', 'lipstick'].includes(stain.name);
  const isStainProtein = ['blood', 'egg', 'milk', 'sweat'].includes(stain.name);
  
  // Intro paragraph variants based on stain category or material type
  const introVariants = [
    `Removing ${stainName} stains from ${materialName} can be tricky, but with the right technique, it's usually fixable. This guide walks you through step-by-step how to get rid of ${stainName} stains on ${materialName} using common household supplies.`,
    `Dealing with ${stainName} stains on ${materialName}? Don't worry—with the right approach, most ${stainName} stains can be successfully removed. Follow this comprehensive guide to restore your ${materialName} to its original condition.`,
    `Found ${stainName} on your favorite ${materialName}? This step-by-step guide will show you exactly how to tackle this common stain using household products that are both effective and gentle on your ${materialName}.`
  ];
  
  // Select intro template based on some variety factor
  const variationFactor = (stain.id + material.id) % introVariants.length;
  let intro = introVariants[variationFactor];
  
  // Add material-specific context with variations
  if (isMaterialDelicate) {
    const delicateVariants = [
      ` Since ${materialName} is a delicate material, you'll need to take extra care to avoid damaging the fibers while removing the stain.`,
      ` ${materialName.charAt(0).toUpperCase() + materialName.slice(1)} requires gentle handling, so this method is specially designed to remove stains without compromising the integrity of this delicate fabric.`,
      ` Because ${materialName} can be easily damaged, we'll use a gentler approach that's still effective against ${stainName} stains.`
    ];
    intro += delicateVariants[(stain.id + material.id + 1) % delicateVariants.length];
  } else if (material.type === 'hard_surface') {
    const hardSurfaceVariants = [
      ` ${material.displayName} surfaces require special care to remove stains without causing damage to the finish or material.`,
      ` When treating stains on ${materialName}, it's important to use methods that won't damage or etch the surface.`,
      ` The good news is that ${materialName} is quite durable, but you'll still need to use the right techniques to avoid damaging the finish.`
    ];
    intro += hardSurfaceVariants[(stain.id + material.id + 2) % hardSurfaceVariants.length];
  }
  
  // Add stain-specific context with variations
  if (isStainOily) {
    const oilyVariants = [
      ` ${stain.displayName} stains contain oils that can be particularly stubborn to remove, especially after they've had time to set into the fabric.`,
      ` The challenge with ${stainName} is that it contains oils that can penetrate deep into ${materialName} fibers, making it important to treat quickly and thoroughly.`,
      ` Because ${stainName} has oil components, you'll need to use degreasers that can break down these substances without spreading the stain.`
    ];
    intro += oilyVariants[(stain.id * material.id) % oilyVariants.length];
  } else if (isStainProtein) {
    const proteinVariants = [
      ` As a protein-based stain, ${stainName} requires careful treatment—hot water can make it set permanently into the fibers.`,
      ` ${stainName.charAt(0).toUpperCase() + stainName.slice(1)} is a protein-based stain, which means using cold water is crucial to prevent the proteins from coagulating and setting deeper.`,
      ` The protein components in ${stainName} can bond with fabric fibers when heat is applied, so we'll avoid hot water in this treatment method.`
    ];
    intro += proteinVariants[(stain.id + material.id * 2) % proteinVariants.length];
  } else if (stain.category === 'beverage') {
    const beverageVariants = [
      ` Like most beverage stains, ${stainName} can contain sugars and tannins that bond with fibers over time, making quick action important.`,
      ` Beverage stains like ${stainName} often contain sugars and coloring agents that can become more difficult to remove the longer they sit.`,
      ` The tannins and colorants in ${stainName} can bond permanently with ${materialName} if left untreated, so timing is crucial for complete removal.`
    ];
    intro += beverageVariants[(stain.id - material.id + 3) % beverageVariants.length];
  }
  
  return intro;
}

/**
 * Generate step-by-step instructions based on pre-treatment and wash method
 * with varied sentence openers and pro tips
 */
export function generateSteps(preTreatment: string, washMethod: string): Step[] {
  // Collection of pro tips to randomly insert
  const proTips = [
    "*Always test any cleaning solution on a hidden area first to check for colorfastness or damage.*",
    "*For delicate fabrics, use gentle pressure to avoid damaging the fibers while still removing the stain.*",
    "*The faster you treat a stain, the higher your chances of complete removal. Fresh stains are always easier to remove than set-in ones.*",
    "*Never use hot water on protein-based stains like blood or egg as it can cook the proteins into the fabric.*",
    "*If the fabric is colorfast, leaving the solution on for 15-30 minutes may improve results for stubborn stains.*",
    "*Working from the outside of the stain toward the center helps prevent spreading.*",
    "*Patience is key—rushing the process may spread the stain or damage the material.*",
    "*For stubborn stains, a second application is often more effective than a single aggressive treatment.*",
    "*Avoid using a dryer until you're certain the stain is completely removed, as heat can permanently set residual stains.*",
    "*Remember to rinse thoroughly after using any cleaning products to prevent residue that might attract dirt later.*"
  ];
  
  // Sentence opener variations to rotate through
  const sentenceOpeners = [
    "First", "Begin by", "Start by", "Initially",
    "Next", "Then", "After that", "Following that",
    "Continue by", "Now", "Subsequently",
    "Finally", "As a last step", "To finish", "Complete the process by"
  ];
  
  // Determine which step will get a pro tip (avoid first and last step)
  const numSteps = Math.ceil(washMethod.split(/(?<=\.)\s+/).length / 2) + 2; // Approximate number of steps
  const proTipStepIndex = 1 + Math.floor(Math.random() * (numSteps - 2)); // Random step between second and second-to-last
  
  // Select a random pro tip
  const selectedProTip = proTips[Math.floor(Math.random() * proTips.length)];
  
  // Format the pre-treatment step with varied openers
  let pretreatmentText = preTreatment;
  
  // If the pretreatment doesn't start with a sentence opener, add one
  if (!pretreatmentText.startsWith(sentenceOpeners[0]) && 
      !pretreatmentText.startsWith(sentenceOpeners[1]) && 
      !pretreatmentText.startsWith(sentenceOpeners[2])) {
    pretreatmentText = `${sentenceOpeners[0]}, ${pretreatmentText.charAt(0).toLowerCase()}${pretreatmentText.slice(1)}`;
  }
  
  // Split the pre-treatment into its own step
  const steps: Step[] = [
    {
      title: "Immediate Response",
      description: pretreatmentText
    }
  ];
  
  // Split wash method into logical steps (approximately 2-4 steps)
  const washSentences = washMethod.split(/(?<=\.)\s+/);
  
  if (washSentences.length <= 2) {
    // If wash method is short, make it one step
    // Add variation to sentence opener if needed
    let cleaningProcess = washMethod;
    if (!cleaningProcess.startsWith(sentenceOpeners[3]) && 
        !cleaningProcess.startsWith(sentenceOpeners[4]) && 
        !cleaningProcess.startsWith(sentenceOpeners[5])) {
      cleaningProcess = `${sentenceOpeners[3]}, ${cleaningProcess.charAt(0).toLowerCase()}${cleaningProcess.slice(1)}`;
    }
    
    // Add pro tip if this is the selected step
    if (proTipStepIndex === 1) {
      cleaningProcess = `${cleaningProcess} ${selectedProTip}`;
    }
    
    steps.push({
      title: "Cleaning Process",
      description: cleaningProcess
    });
  } else {
    // Split into multiple logical steps
    let currentStep = "";
    let stepCount = 0;
    let openerIndex = 3; // Start with the "Next" set of openers
    
    for (let i = 0; i < washSentences.length; i++) {
      let sentence = washSentences[i];
      
      // Replace beginning of first sentence in a step with a varied opener if needed
      if (currentStep === "" && !sentence.startsWith(sentenceOpeners[openerIndex])) {
        // Capitalize the first letter for sentence starters
        sentence = `${sentenceOpeners[openerIndex]}, ${sentence.charAt(0).toLowerCase()}${sentence.slice(1)}`;
        openerIndex = (openerIndex + 1) % sentenceOpeners.length;
      }
      
      currentStep += sentence + " ";
      
      // Create a new step after every 1-2 sentences, or at the end
      if ((i + 1) % 2 === 0 || i === washSentences.length - 1) {
        stepCount++;
        let title = "";
        
        // Generate logical step titles with more variety
        const titleVariants = {
          first: ["Apply Cleaning Solution", "Prepare Treatment", "Begin Stain Removal"],
          middle: ["Work the Solution", "Continue Treatment", "Process the Stain"],
          last: ["Final Rinse and Dry", "Complete the Process", "Finish Cleaning"]
        };
        
        if (stepCount === 1) {
          title = titleVariants.first[stepCount % titleVariants.first.length];
        } else if (i === washSentences.length - 1) {
          title = titleVariants.last[stepCount % titleVariants.last.length];
        } else {
          title = titleVariants.middle[stepCount % titleVariants.middle.length];
        }
        
        // Add pro tip if this is the selected step
        if (proTipStepIndex === stepCount + 1) { // +1 because we already have one step (pretreatment)
          currentStep = `${currentStep} ${selectedProTip}`;
        }
        
        steps.push({
          title,
          description: currentStep.trim()
        });
        
        currentStep = "";
      }
    }
  }
  
  // Always add a final step for checking results with varied phrasings
  const finalStepVariants = [
    "Allow the area to dry completely and check if the stain is fully removed. If traces remain, repeat the process. For stubborn stains that persist after multiple attempts, professional cleaning may be necessary.",
    "Once finished, let the item dry thoroughly before evaluating the results. If you still see stain remnants, you may need to repeat the process or consider professional cleaning for particularly stubborn stains.",
    "After treatment, allow the area to dry completely before assessing the results. If any stain remains visible, don't hesitate to repeat the cleaning process. Some particularly difficult stains might require professional treatment if they persist after multiple attempts."
  ];
  
  const finalStepIndex = steps.length % finalStepVariants.length;
  
  // Add pro tip to final step if it's the selected step
  let finalStepText = finalStepVariants[finalStepIndex];
  if (proTipStepIndex === steps.length) {
    finalStepText = `${finalStepText} ${selectedProTip}`;
  }
  
  steps.push({
    title: "Check Results",
    description: finalStepText
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
 * with enhanced handling of fresh vs. set-in stain differences
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
  
  // Calculate effectiveness drop for set-in stains
  const freshToSetInDrop = freshStains - setInStains;
  
  // Generate varied descriptions with explicit fresh vs. set-in stain comparisons
  const descriptionVariants = [
    // Variant 1 - Standard format
    `This method is rated ${rating} for ${stainName} on ${materialName}. Fresh stains have a ${freshStains}% removal rate, while set-in stains (older than 24 hours) drop to ${setInStains}% effectiveness.`,
    
    // Variant 2 - Time-focused format
    `For ${stainName} on ${materialName}, this treatment is ${rating}. Time is crucial: within 1 hour of staining, expect ${freshStains}% success, but after 24+ hours, effectiveness decreases to ${setInStains}%.`,
    
    // Variant 3 - Material-focused format
    `${materialName.charAt(0).toUpperCase() + materialName.slice(1)} responds ${rating === 'challenging' ? 'with difficulty' : rating + 'ly'} to this ${stainName} removal method. Fresh stains (${freshStains}% success) are significantly easier to remove than set-in stains (${setInStains}% success).`
  ];
  
  // Select description variant based on stain and material IDs for consistency
  const descriptionIndex = (stain.id + material.id) % descriptionVariants.length;
  let description = descriptionVariants[descriptionIndex];
  
  // Add effectiveness context based on rating
  if (effectiveness === 'excellent' || effectiveness === 'good') {
    // Add different explanations for good/excellent ratings
    const goodContextVariants = [
      ` For best results, treat immediately and follow all steps carefully.`,
      ` The ${freshToSetInDrop}% drop in effectiveness for set-in stains shows why quick action is important.`,
      ` Even with this effective method, prompt treatment makes a significant difference.`
    ];
    description += goodContextVariants[(stain.id * 2 + material.id) % goodContextVariants.length];
  } else if (effectiveness === 'fair') {
    // Add different explanations for fair ratings
    const fairContextVariants = [
      ` Multiple applications may be necessary for complete removal, especially with older stains.`,
      ` Expect partial results on set-in stains—professional cleaning might be needed for complete removal.`,
      ` The dramatic ${freshToSetInDrop}% effectiveness drop for set-in stains highlights the importance of treating this stain quickly.`
    ];
    description += fairContextVariants[(stain.id + material.id * 2) % fairContextVariants.length];
  } else {
    // Add different explanations for poor ratings
    const poorContextVariants = [
      ` ${stain.displayName} stains are notoriously difficult to remove from ${materialName}, especially after they've had time to set. For valuable items, professional cleaning is strongly recommended.`,
      ` With only ${setInStains}% effectiveness on set-in stains, don't be discouraged if results aren't perfect. This stain-material combination is particularly challenging.`,
      ` The ${freshToSetInDrop}% drop between fresh and set-in stain removal highlights why immediate treatment is critical for this difficult stain-material combination.`
    ];
    description += poorContextVariants[(stain.id * 3 + material.id) % poorContextVariants.length];
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
 * with enhanced variety and specific fresh vs. set-in stain questions
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
  
  // FAQ about prevention with variations
  const preventionVariants = [
    {
      question: `How can I prevent ${stainName} stains on ${materialName}?`,
      answer: `The best prevention is quick action. For ${materialName}, immediately blot (don't rub) any spills with a clean cloth. ${material.type === 'natural' ? 'Consider applying a fabric protector designed for natural fibers.' : material.type === 'synthetic' ? 'Many synthetic fabrics come with stain resistance, but reapplying fabric protector after several washes helps maintain this property.' : 'Regular maintenance and prompt cleaning of spills is the best prevention strategy.'}`
    },
    {
      question: `What's the best way to protect my ${materialName} from ${stainName} stains?`,
      answer: `Prevention starts with prompt action when spills occur. For ${materialName}, keep absorbent cloths nearby and blot spills immediately. ${material.type === 'natural' ? 'Natural fiber protector sprays can provide an additional barrier against staining.' : material.type === 'synthetic' ? 'While synthetic fabrics have some inherent stain resistance, refreshing with fabric protector after multiple washes is recommended.' : 'Maintaining a regular cleaning schedule and addressing spills immediately is your best defense.'}`
    },
    {
      question: `Is there anything I can do to make my ${materialName} more resistant to ${stainName} stains?`,
      answer: `Yes! For ${materialName}, quick response to spills is crucial—always blot, never rub. ${material.type === 'natural' ? 'Apply a quality fabric protector designed specifically for natural fibers, and reapply after cleaning or according to product instructions.' : material.type === 'synthetic' ? 'While your synthetic fabric has built-in resistance, this diminishes over time. Consider reapplying fabric protector every few months for maximum protection.' : 'Regular professional cleaning and maintenance will help maintain the material\'s natural resistance, and applying appropriate sealants can provide additional protection.'}`
    }
  ];
  
  // Select a prevention variant based on stain and material IDs for consistency
  faqs.push(preventionVariants[(stain.id + material.id) % preventionVariants.length]);
  
  // Add specific FAQ about set-in stains with variations
  const setInStainVariants = [
    {
      question: `How should I treat an old, set-in ${stainName} stain on ${materialName}?`,
      answer: `Set-in ${stainName} stains require more persistent treatment. First, try the standard method in this guide, but allow the cleaning solution to sit longer (15-30 minutes if safe for the fabric). You may need to repeat the treatment 2-3 times. For stubborn set-in stains, add an overnight pre-soak with an enzyme cleaner before following the regular steps. If the stain remains after multiple attempts, professional cleaning may be your best option.`
    },
    {
      question: `I found a ${stainName} stain on my ${materialName} from last week. Is it too late to remove it?`,
      answer: `It's not too late, but set-in stains require more work. For older ${stainName} stains on ${materialName}: 1) Apply the treatment in this guide but let solutions work longer, 2) Repeat treatments may be necessary—don't give up after one try, 3) Consider using enzymatic pre-treatment specifically formulated for ${stain.category === 'oil' ? 'grease and oil' : stain.name.includes('protein') ? 'protein-based stains' : 'organic stains'}, and 4) Be patient—set-in stains might fade gradually over multiple treatments rather than disappear entirely at once.`
    },
    {
      question: `The ${stainName} stain on my ${materialName} has been there for weeks. Can your method still work?`,
      answer: `Yes, but with modified expectations and approach. For these well-set ${stainName} stains: 1) Expect the success rate to drop by 40-60% compared to fresh stains, 2) Add a longer pre-treatment phase—soak with appropriate enzyme cleaner for several hours if the fabric allows, 3) Consider multiple applications with drying time between treatments, and 4) Use a soft brush to gently work the solution into the fibers (test in an inconspicuous area first). Professional cleaning is recommended for valuable items with old stains.`
    }
  ];
  
  // Add a set-in stain FAQ variant
  faqs.push(setInStainVariants[(stain.id * 2 + material.id) % setInStainVariants.length]);
  
  // FAQ about stain setting timeframe with variations
  const stainSettingVariants = [
    {
      question: `How long before a ${stainName} stain becomes permanent on ${materialName}?`,
      answer: `${stainName} stains can begin to set within 24-48 hours on ${materialName}. The longer a stain remains untreated, the more difficult it becomes to remove. Heat (including hot water, dryers, or ironing) can permanently set the stain, making it nearly impossible to remove completely.`
    },
    {
      question: `Is there a time window for effectively removing ${stainName} from ${materialName}?`,
      answer: `Yes, time is critical. For ${stainName} on ${materialName}, you have approximately 24-48 hours before the stain begins to bond permanently with the fibers. The first few hours are most critical—removal success rates drop by about 20% after 6 hours, and by 40-60% after 48 hours. Avoid applying heat of any kind to the stained area until it's completely removed, as heat can permanently set the stain.`
    },
    {
      question: `At what point should I consider a ${stainName} stain permanent on my ${materialName}?`,
      answer: `While no stain is absolutely permanent until you've exhausted all removal options, ${stainName} stains on ${materialName} become significantly more difficult to remove after 48-72 hours. After a week, expect success rates to drop below 50%. The stain becomes even more resistant if it has been exposed to heat (washing in hot water, drying, or ironing). If you've attempted the methods in this guide 3-4 times without improvement, professional cleaning is your best remaining option.`
    }
  ];
  
  // Add a stain setting timeframe FAQ variant
  faqs.push(stainSettingVariants[(stain.id + material.id * 3) % stainSettingVariants.length]);
  
  // Material-specific FAQ with variations
  if (material.type === 'natural') {
    const naturalFabricVariants = [
      {
        question: `Can I use bleach to remove ${stainName} stains from ${materialName}?`,
        answer: `${material.name === 'cotton' ? 'Chlorine bleach can be used on white cotton items but may weaken fibers over time. For colored cotton, use only oxygen bleach to avoid color damage.' : 'Bleach is not recommended for ' + materialName + ' as it can damage the fibers and cause discoloration. Stick to the gentler methods described in this guide.'}`
      },
      {
        question: `Will harsh chemicals damage my ${materialName} when removing ${stainName}?`,
        answer: `${material.name === 'cotton' ? 'Cotton is relatively durable, but harsh chemicals can still damage it over time. Chlorine bleach should only be used on white cotton and sparingly. For colored cotton, stick to oxygen bleach and gentler solutions.' : materialName + ' fibers are sensitive to harsh chemicals and can be permanently damaged by bleach, ammonia, and other strong cleaners. The method in this guide uses gentler alternatives specifically selected to be safe for natural fibers.'}`
      }
    ];
    faqs.push(naturalFabricVariants[stain.id % naturalFabricVariants.length]);
  } else if (material.type === 'leather') {
    const leatherVariants = [
      {
        question: `Will treating this ${stainName} stain damage my ${materialName}?`,
        answer: `When done properly, the methods described should not damage your ${materialName}. However, always test any cleaning solution on an inconspicuous area first. ${materialName} is sensitive to water and harsh chemicals, so use minimal moisture and dry thoroughly to prevent water stains or material damage.`
      },
      {
        question: `How do I prevent water damage while removing ${stainName} from ${materialName}?`,
        answer: `Water can damage leather if not used properly. When treating ${stainName} stains on ${materialName}: 1) Use damp, not wet cloths, 2) Work with small amounts of cleaning solution at a time, 3) Blot instead of saturating the material, 4) Dry thoroughly with clean cloths after cleaning, and 5) Allow to air dry completely away from direct heat. Follow with a leather conditioner once fully dry to restore moisture balance.`
      }
    ];
    faqs.push(leatherVariants[material.id % leatherVariants.length]);
  } else if (material.type === 'hard_surface') {
    const hardSurfaceVariants = [
      {
        question: `Can ${stainName} permanently stain ${materialName}?`,
        answer: `${material.name === 'marble' ? 'Yes, marble is porous and can be permanently stained by acidic substances like wine, coffee, or fruit juices. Sealing your marble periodically helps prevent staining.' : material.name === 'wood' ? 'Yes, wood can be permanently stained, especially if the finish is damaged or worn. The faster you treat the stain, the better chance you have of preventing permanent damage.' : 'With proper care and prompt cleaning, most stains can be removed from ' + materialName + ' without permanent damage.'}`
      },
      {
        question: `How does the porosity of ${materialName} affect ${stainName} stain removal?`,
        answer: `${material.name === 'marble' ? 'Marble is highly porous, which means ' + stainName + ' can penetrate deeply if not sealed properly. This porosity makes stains particularly difficult to remove once they\'ve had time to set. Regular sealing (every 6-12 months) creates a protective barrier.' : material.name === 'wood' ? 'Wood porosity varies by species and finish. Unsealed or worn wood can absorb ' + stainName + ' deeply, making complete removal challenging. A proper finish acts as a barrier, giving you more time to clean before permanent staining occurs.' : 'The porosity of ' + materialName + ' determines how quickly ' + stainName + ' can penetrate and set. More porous surfaces require faster action and may benefit from specialized sealants to prevent deep staining.'}`
      }
    ];
    faqs.push(hardSurfaceVariants[(stain.id + material.id) % hardSurfaceVariants.length]);
  }
  
  // Stain-specific FAQ with enhanced variations
  if (stain.category === 'beverage' || stain.category === 'food') {
    const temperatureFAQVariants = [
      {
        question: `Does the temperature of water matter when treating ${stainName} stains?`,
        answer: `Yes, temperature is crucial. ${stain.category === 'food' && stain.name.includes('protein') ? 'Never use hot water on protein-based food stains as it cooks the protein into the fabric. Always use cold water initially.' : 'For ' + stainName + ' stains, start with cold water to flush out the stain before it sets. Hot water can set some components of the stain making it permanent.'}`
      },
      {
        question: `Should I use hot or cold water on ${stainName} stains on ${materialName}?`,
        answer: `For ${stainName} stains, temperature is critical. ${stain.category === 'food' && stain.name.includes('protein') ? 'Always use cold water initially. Hot water causes protein to coagulate—similar to cooking an egg—making the stain permanently bond with the fabric fibers. Only switch to warmer water after the protein components have been removed.' : 'Start with cold water to prevent the sugars and tannins in ' + stainName + ' from bonding with the ' + materialName + ' fibers. Warm water can be introduced in later treatments after the initial flushing if needed for detergent activation.'}`
      }
    ];
    faqs.push(temperatureFAQVariants[stain.id % temperatureFAQVariants.length]);
  } else if (stain.category === 'oil') {
    const oilFAQVariants = [
      {
        question: `Why do I need dish soap for ${stainName} stains?`,
        answer: `Dish soap is formulated to break down grease and oils, which is why it's effective on ${stainName} stains. The surfactants in dish soap help to dissolve the oil molecules so they can be rinsed away from the ${materialName} fibers.`
      },
      {
        question: `What makes ${stainName} stains so stubborn on ${materialName}?`,
        answer: `${stainName} stains are challenging because they contain oils that can penetrate deeply into ${materialName} fibers. Unlike water-based stains, oils repel water, making them difficult to rinse out. Dish soap works by surrounding oil molecules with surfactants, allowing them to be lifted from the fibers and rinsed away with water. The longer an oil stain sits, the more it oxidizes and bonds with the material, which explains why fresh stains are much easier to remove than set-in ones.`
      }
    ];
    faqs.push(oilFAQVariants[(material.id * 2) % oilFAQVariants.length]);
  } else if (stain.category === 'ink') {
    const inkFAQVariants = [
      {
        question: `Are some types of ${stainName} stains harder to remove than others?`,
        answer: `Yes, permanent markers and certain ink formulations are designed to be waterproof and can be extremely difficult to remove completely. Ballpoint ink is typically easier to remove than permanent marker or India ink. The age of the stain also makes a significant difference—fresh ink stains are much more responsive to treatment.`
      },
      {
        question: `Why does the type of ink matter when removing ${stainName} stains from ${materialName}?`,
        answer: `Different ink formulations have vastly different chemical properties. Water-based inks (like those in washable markers) dissolve in water and are relatively easy to remove when fresh. Ballpoint inks contain oil components and dyes, requiring solvents like alcohol. Permanent markers and India ink contain resins specifically designed to be waterproof and permanent, making them extremely difficult to remove, especially from porous materials like ${materialName}. The method in this guide works best on standard ballpoint or gel pen inks.`
      }
    ];
    faqs.push(inkFAQVariants[stain.id % inkFAQVariants.length]);
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