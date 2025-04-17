import { db } from "./server/db";
import { stains, materials, stainRemovalGuides, effectivenessEnum } from "./shared/schema";
import { and, eq } from "drizzle-orm";
import { generateGuideContent, normalizeProductName } from "./server/contentGenerator";

// Import the guide types and helpers
import { GuideData, validateGuide, normalizeGuideProducts } from './seed-guides';

// Additional combinations to reach 50+ total guides
const additionalGuides: GuideData[] = [
  // Berry stains
  {
    stainName: "berries",
    materialName: "cotton",
    preTreatment: "Immediately rinse under cold running water from the back side of the fabric to push the stain out rather than through. Gently rub fabric against itself to help loosen the stain.",
    products: ["Lemon juice", "White vinegar", "Enzyme-based stain remover", "Hydrogen peroxide", "Baking soda", "Cold water"],
    washMethod: "Soak the stained area in a mixture of equal parts white vinegar and cold water for 30 minutes. For light colored fabrics, apply lemon juice to the stain and place in direct sunlight for 15-30 minutes. For stubborn stains, apply a paste of baking soda and water, let sit for 15 minutes. For white fabrics only, apply hydrogen peroxide directly to the stain. Wash in cold water with regular detergent.",
    warnings: [
      "Never use hot water as it will set berry stains",
      "Lemon juice and hydrogen peroxide may discolor colored fabrics",
      "Test any product on an inconspicuous area first",
      "Check that the stain is completely gone before putting in the dryer"
    ],
    effectiveness: "good"
  },
  {
    stainName: "berries",
    materialName: "silk",
    preTreatment: "Blot the stain gently with a clean white cloth to absorb excess berry juice. Do not rub as this can damage the delicate silk fibers.",
    products: ["Mild dish soap", "White vinegar", "Cold water", "Enzyme-based stain remover", "Clean white cloths"],
    washMethod: "Mix a few drops of mild dish soap with cold water. Using a clean cloth, gently dab the solution onto the stain working from the outside in. Rinse by blotting with a clean cloth dampened with cold water. For stubborn stains, mix one part white vinegar with two parts cold water and gently dab onto the stain. For protein-based berries, try a small amount of enzyme cleaner diluted in cold water. Allow to air dry away from direct heat and sunlight.",
    warnings: [
      "Never use hot water on silk",
      "Avoid rubbing which can damage silk fibers",
      "Do not use bleach or hydrogen peroxide on silk",
      "Consider professional cleaning for valuable silk items"
    ],
    effectiveness: "fair"
  },
  
  // Mud stains
  {
    stainName: "mud",
    materialName: "cotton",
    preTreatment: "Allow the mud to dry completely. Once dry, gently brush off as much dried mud as possible. Do not rub wet mud as it will push the stain deeper into the fibers.",
    products: ["Liquid laundry detergent", "White vinegar", "Enzyme pre-treatment", "Baking soda", "Hydrogen peroxide", "Old toothbrush"],
    washMethod: "After removing dried mud, pre-treat with liquid laundry detergent applied directly to the stain. For stubborn stains, make a paste of laundry detergent and water, apply to the stain, and gently rub with an old toothbrush. Let sit for 15 minutes. For very stubborn stains, mix equal parts hydrogen peroxide and water (for white fabrics) or white vinegar and water (for colored fabrics). Apply to the stain and let sit for 30 minutes. Wash in the warmest water safe for the fabric with an enzyme detergent.",
    warnings: [
      "Always let mud dry completely before treating",
      "Hydrogen peroxide may bleach colored fabrics",
      "Test cleaning solutions in an inconspicuous area first",
      "May require multiple treatments for set-in stains"
    ],
    effectiveness: "excellent"
  },
  {
    stainName: "mud",
    materialName: "carpet",
    preTreatment: "Allow the mud to dry completely. Vacuum thoroughly to remove as much dried mud as possible. Do not scrub wet mud as it will push the stain deeper into carpet fibers.",
    products: ["Carpet cleaner", "Dish soap", "White vinegar", "Hydrogen peroxide", "Water", "Clean cloths", "Vacuum cleaner"],
    washMethod: "After vacuuming dried mud, mix one tablespoon of dish soap with two cups of warm water. Apply the solution to the stain with a clean cloth, working from the outside in. Blot with a dry cloth to absorb the solution and dirt. For stubborn stains, mix equal parts white vinegar and water, apply to the stain, and blot. For light-colored carpets with persistent stains, mix equal parts hydrogen peroxide and water, apply to the stain, let sit for 10 minutes, then blot. Allow to air dry completely, then vacuum again to restore carpet texture.",
    warnings: [
      "Always allow mud to dry completely before treating",
      "Test cleaning solutions in an inconspicuous area first",
      "Don't oversaturate the carpet",
      "Hydrogen peroxide may lighten colored carpets"
    ],
    effectiveness: "good"
  },
  
  // Marker stains
  {
    stainName: "marker",
    materialName: "cotton",
    preTreatment: "Place a clean cloth or paper towel beneath the stain to prevent transfer. Blot the stain with a clean cloth - do not rub.",
    products: ["Rubbing alcohol", "Hand sanitizer", "Hairspray (alcohol-based)", "Nail polish remover", "White vinegar", "Lemon juice"],
    washMethod: "For water-based markers, soak the stain in cold water, then wash with regular detergent. For permanent markers, apply rubbing alcohol, hand sanitizer, or alcohol-based hairspray directly to the stain. Let sit for 5 minutes, then blot with a clean cloth. Continue until no more ink transfers to the cloth. For stubborn stains, try a small amount of nail polish remover (acetone) on white fabrics only. For colored fabrics, try a mixture of white vinegar and lemon juice. Wash in the warmest water safe for the fabric with regular detergent.",
    warnings: [
      "Test chemicals in an inconspicuous area first",
      "Acetone can damage some synthetic fabrics and colored fabrics",
      "Never use alcohol-based products near open flames",
      "Some permanent marker stains may not be completely removable"
    ],
    effectiveness: "good"
  },
  {
    stainName: "marker",
    materialName: "wood",
    preTreatment: "Determine whether the wood is finished or unfinished, as this affects which cleaning methods are safe to use.",
    products: ["Rubbing alcohol", "Baking soda", "Toothpaste (non-gel)", "Fine sandpaper", "Lemon juice", "Wood cleaner", "Wood polish"],
    washMethod: "For finished wood, apply a small amount of rubbing alcohol to a cloth and gently rub the stain, taking care not to damage the finish. For stubborn stains, make a paste with baking soda and water or use non-gel toothpaste, apply to the stain, and gently rub with a soft cloth. For unfinished wood, you may need to lightly sand the surface, working with the grain. After stain removal, clean with appropriate wood cleaner and apply polish or finish as needed.",
    warnings: [
      "Test any product in an inconspicuous area first",
      "Avoid excessive moisture on wood surfaces",
      "Sanding should only be used on unfinished wood or as a last resort",
      "Some cleaning methods may remove or damage wood finishes"
    ],
    effectiveness: "fair"
  },
  
  // Paint stains
  {
    stainName: "paint",
    materialName: "cotton",
    preTreatment: "Determine whether the paint is water-based (latex) or oil-based, as they require different treatments. Scrape off any excess dried paint gently with a dull knife.",
    products: ["Dish soap", "Rubbing alcohol", "Paint thinner", "Turpentine", "Nail polish remover", "Old toothbrush"],
    washMethod: "For water-based paint, soak in cold water, then wash with dish soap. For dried water-based paint, soak in a solution of warm water and dish soap, then scrub gently with an old toothbrush. For oil-based paint, apply paint thinner, turpentine, or nail polish remover to the back of the stain and blot with a clean cloth. Continue until no more paint transfers. Rinse thoroughly, then wash with dish soap and warm water. Launder according to garment care instructions.",
    warnings: [
      "Act quickly - paint is much harder to remove once dried",
      "Test solvents in an inconspicuous area first",
      "Use paint solvents in a well-ventilated area",
      "Solvents may damage some fabrics",
      "Keep solvents away from heat and open flames"
    ],
    effectiveness: "fair"
  },
  {
    stainName: "paint",
    materialName: "carpet",
    preTreatment: "Blot up excess wet paint immediately. For dried paint, gently scrape off as much as possible with a dull knife or credit card.",
    products: ["Dish soap", "Rubbing alcohol", "Paint thinner", "Acetone", "Hot water", "Steam cleaner", "Clean cloths"],
    washMethod: "For water-based paint, mix dish soap with hot water and apply to the stain with a clean cloth. Blot, don't rub. Continue applying and blotting until the paint transfers to your cloth. For oil-based paint, apply paint thinner, rubbing alcohol, or acetone to a clean cloth and dab at the stain. For dried paint, steam may help soften it first. After treating, clean the area with fresh water to remove cleaning solution residue and blot dry.",
    warnings: [
      "Test any solvent in an inconspicuous area first",
      "Use solvents in a well-ventilated area",
      "Keep solvents away from heat and open flames",
      "Some carpets may be damaged by solvents",
      "Professional cleaning may be required for large or set-in paint stains"
    ],
    effectiveness: "fair"
  },
  
  // Soda stains
  {
    stainName: "soda",
    materialName: "cotton",
    preTreatment: "Immediately blot the stain with a clean cloth to absorb as much liquid as possible. Rinse the stained area with cold water from the back of the fabric to push the stain out rather than through.",
    products: ["Liquid dish soap", "White vinegar", "Club soda", "Lemon juice", "Baking soda", "Cold water"],
    washMethod: "Mix one tablespoon of liquid dish soap with two cups of cold water. Sponge the stain with this solution using a clean cloth. Rinse with cold water. If the stain persists, mix equal parts white vinegar and water, apply to the stain, and let sit for 30 minutes. For stubborn stains, make a paste of baking soda and water, apply to the stain, let dry, then brush off. For colored sodas on white fabrics, diluted lemon juice can help bleach the stain in sunlight. Wash according to garment care instructions.",
    warnings: [
      "Dark-colored sodas may permanently stain light fabrics if not treated promptly",
      "The sugar in soda can caramelize if heat is applied (like ironing or hot water), making the stain permanent",
      "Lemon juice may discolor colored fabrics"
    ],
    effectiveness: "excellent"
  },
  {
    stainName: "soda",
    materialName: "carpet",
    preTreatment: "Blot up as much of the spilled soda as possible using paper towels or a clean cloth. Apply gentle pressure and work from the outside of the stain toward the center to prevent spreading.",
    products: ["Dish soap", "White vinegar", "Club soda", "Baking soda", "Warm water", "Clean cloths"],
    washMethod: "Mix one tablespoon of dish soap with two cups of warm water. Using a clean cloth, dab the solution onto the stain and let sit for 5 minutes. Blot with a clean cloth until the stain is removed. For stubborn stains, mix equal parts white vinegar and water, apply to the stain, let sit for 15 minutes, then blot. Alternatively, pour club soda directly onto the stain and blot. For sticky residue, make a paste of baking soda and water, apply to the area, let dry completely, then vacuum.",
    warnings: [
      "The sugar in soda can attract dirt if not completely removed",
      "Don't oversaturate the carpet",
      "Colored sodas may permanently stain light-colored carpets if not treated quickly",
      "Work quickly - sugar stains become more difficult to remove as they dry"
    ],
    effectiveness: "good"
  },
  
  // Curry stains
  {
    stainName: "curry",
    materialName: "cotton",
    preTreatment: "Gently scrape off any solid matter. Rinse the stain with cold water from the back of the fabric to push the stain out rather than through.",
    products: ["Liquid dish soap", "White vinegar", "Lemon juice", "Hydrogen peroxide", "Enzyme-based stain remover", "Glycerin"],
    washMethod: "Pre-treat with liquid dish soap directly on the stain. For stubborn stains, create a solution of equal parts glycerin, dish soap, and water. Apply to the stain and let sit for 30 minutes. Rinse, then soak in a solution of one part white vinegar to two parts water for 30 minutes. For white cotton, apply a mixture of hydrogen peroxide and water (1:1 ratio) or lemon juice, and place in sunlight. Wash in the hottest water safe for the fabric with an enzyme-based detergent.",
    warnings: [
      "Curry contains turmeric which has strong yellow dye properties",
      "Treat immediately - curry stains set quickly and can be permanent",
      "Hydrogen peroxide and lemon juice may bleach colored fabrics",
      "May require multiple treatments",
      "Professional cleaning might be necessary for valuable items"
    ],
    effectiveness: "fair"
  },
  {
    stainName: "curry",
    materialName: "carpet",
    preTreatment: "Gently scrape off any solid curry paste or sauce. Blot the stain with a clean cloth to absorb as much as possible - do not rub as this will spread the stain.",
    products: ["Dish soap", "White vinegar", "Hydrogen peroxide", "Ammonia", "Baking soda", "Glycerin"],
    washMethod: "Mix one tablespoon of dish soap with two cups of warm water. Using a clean cloth, dab the solution onto the stain and let sit for 5 minutes. Blot with a clean cloth. For stubborn stains, mix one tablespoon of ammonia with two cups of warm water (test in an inconspicuous area first). Apply to the stain and blot. For light-colored carpets, a solution of hydrogen peroxide and water (1:1 ratio) may help. As a last resort, make a paste of baking soda and water, apply to the stain, let dry, then vacuum.",
    warnings: [
      "Test all cleaning solutions in an inconspicuous area first",
      "Never mix ammonia with bleach as it creates toxic fumes",
      "Hydrogen peroxide may lighten colored carpets",
      "Curry stains can be extremely difficult to remove completely",
      "Consider professional cleaning for valuable carpets or large stains"
    ],
    effectiveness: "fair"
  },
  
  // Gravy stains
  {
    stainName: "gravy",
    materialName: "cotton",
    preTreatment: "Scrape off excess gravy with a dull knife or spoon. Don't rub, as this will push the stain deeper into the fibers.",
    products: ["Liquid dish soap", "Laundry detergent", "Enzyme pre-treatment", "White vinegar", "Baking soda", "Cold water"],
    washMethod: "Rinse the back of the stain with cold water to flush out as much gravy as possible. Pre-treat with liquid dish soap or laundry detergent applied directly to the stain. For stubborn stains, apply an enzyme pre-treatment and let sit for 15-30 minutes. Alternatively, create a paste of baking soda and water, apply to the stain, and let sit for 30 minutes. For set-in stains, soak in a solution of one part white vinegar to two parts water for 30 minutes. Wash in the warmest water safe for the fabric with regular detergent.",
    warnings: [
      "Gravy is a combination stain (protein and grease) requiring multiple treatment approaches",
      "Always use cold water initially to avoid setting the protein component",
      "Hot water can be used after pre-treatment to remove grease",
      "Check that the stain is completely gone before putting in the dryer"
    ],
    effectiveness: "good"
  },
  {
    stainName: "gravy",
    materialName: "carpet",
    preTreatment: "Scrape off excess gravy with a dull knife or spoon. Blot with a clean cloth to absorb as much as possible - do not rub.",
    products: ["Dish soap", "White vinegar", "Enzyme cleaner", "Baking soda", "Club soda", "Clean cloths"],
    washMethod: "Mix one tablespoon of dish soap with two cups of warm water. Using a clean cloth, dab the solution onto the stain and let sit for 5-10 minutes. Blot with a clean, dry cloth. For stubborn stains, apply an enzyme cleaner designed for protein stains, let sit according to product instructions, then blot. For greasy residue, apply a paste of baking soda and water, let dry completely, then vacuum. Alternatively, club soda can be effective on fresh gravy stains - pour directly onto the stain and blot.",
    warnings: [
      "Treat gravy stains as quickly as possible",
      "Test all cleaning solutions in an inconspicuous area first",
      "Don't over-wet the carpet",
      "Grease component may require repeated treatments",
      "Professional cleaning may be needed for large or set-in stains"
    ],
    effectiveness: "good"
  },
  
  // Motor oil stains
  {
    stainName: "motor-oil",
    materialName: "cotton",
    preTreatment: "Blot up as much oil as possible with paper towels. Apply an absorbent material like cornstarch, baking soda, or baby powder to the stain, let sit for at least 30 minutes to absorb the oil, then brush off.",
    products: ["Cornstarch or baking soda", "Heavy-duty liquid laundry detergent", "Dish soap", "WD-40", "Lestoil", "Cardboard"],
    washMethod: "After absorbing excess oil, place the stained area face down on cardboard or paper towels. Apply heavy-duty liquid laundry detergent directly to the back of the stain and let sit for 15 minutes. For stubborn stains, apply a small amount of WD-40 or Lestoil to break down the oil, then immediately apply dish soap. Wash in the hottest water safe for the fabric with extra detergent. You may need to wash the item multiple times.",
    warnings: [
      "Motor oil contains petroleum which can be difficult to remove completely",
      "Avoid using hot water until after pre-treatment, as it can set the stain",
      "WD-40 is flammable - allow it to completely evaporate before washing",
      "Some motor oil stains may never completely come out",
      "Check the stain before drying as heat will set any remaining oil"
    ],
    effectiveness: "fair"
  },
  {
    stainName: "motor-oil",
    materialName: "concrete",
    preTreatment: "Absorb fresh oil with cat litter, sawdust, or baking soda. Let it sit for at least 24 hours, then sweep up.",
    products: ["Cat litter", "Baking soda", "Dish soap", "Trisodium phosphate (TSP)", "Pressure washer", "Stiff brush", "Commercial concrete degreaser"],
    washMethod: "After absorbing fresh oil, make a paste of strong dish soap and water. Apply to the stain and scrub with a stiff brush. For stubborn stains, mix trisodium phosphate (TSP) with water according to package directions (wear gloves and eye protection). Apply to the stain, let sit for 15-20 minutes, then scrub with a stiff brush. Rinse thoroughly with a pressure washer if available. For old, set-in stains, a commercial concrete degreaser may be necessary. Apply according to product instructions.",
    warnings: [
      "Use TSP in a well-ventilated area with appropriate skin and eye protection",
      "TSP can damage plants - cover nearby vegetation and rinse thoroughly",
      "Old motor oil stains may never completely come out of concrete",
      "Multiple applications may be necessary",
      "For large or deeply absorbed stains, professional cleaning may be required"
    ],
    effectiveness: "fair"
  },
  
  // Grease stains
  {
    stainName: "grease",
    materialName: "wool",
    preTreatment: "Gently scrape off excess grease with a dull knife. Blot with a clean cloth - do not rub as this can damage wool fibers and spread the stain.",
    products: ["Cornstarch or talcum powder", "Mild dish soap", "Wool-safe detergent", "Dry cleaning solvent", "Lukewarm water", "Clean cloths"],
    washMethod: "Cover the stain with cornstarch or talcum powder to absorb the grease. Let sit for at least 30 minutes, then brush off. For remaining grease, mix a small amount of mild dish soap with lukewarm water. Gently dab the solution onto the stain with a clean cloth. Rinse by blotting with a cloth dampened with clean water. For stubborn stains, apply a small amount of dry cleaning solvent to a clean cloth and blot the stain. Allow to air dry. For washable wool, hand wash with a wool-safe detergent in lukewarm water.",
    warnings: [
      "Never use hot water on wool as it can cause shrinkage",
      "Avoid rubbing wool fabric which can cause felting and damage fibers",
      "Always test any cleaning solution in an inconspicuous area first",
      "Dry cleaning is recommended for valuable or non-washable wool items"
    ],
    effectiveness: "good"
  },
  {
    stainName: "grease",
    materialName: "suede",
    preTreatment: "Allow the grease to dry completely. Once dry, gently brush with a suede brush to raise the nap.",
    products: ["Cornstarch or talcum powder", "Pencil eraser", "Suede brush", "Suede cleaner", "White vinegar", "Soft cloth"],
    washMethod: "Apply cornstarch or talcum powder liberally to the grease stain. Let sit overnight to absorb the oils. Brush off with a suede brush. For stubborn stains, try gently rubbing the area with a pencil eraser. For persistent stains, apply a small amount of white vinegar to a soft cloth and dab the stain. Let dry completely, then brush with a suede brush to restore the nap. For particularly difficult stains, use a commercial suede cleaner following product instructions.",
    warnings: [
      "Never use water or oil-based cleaners on suede",
      "Avoid excessive rubbing which can damage the nap",
      "Test any cleaning method in an inconspicuous area first",
      "Professional cleaning is recommended for valuable suede items",
      "Some grease stains may permanently darken suede"
    ],
    effectiveness: "fair"
  },
  
  // Dirt stains
  {
    stainName: "dirt",
    materialName: "linen",
    preTreatment: "Shake or brush off as much dry dirt as possible. Do not rub wet dirt as it will push the stain deeper into the fibers.",
    products: ["Mild liquid detergent", "White vinegar", "Hydrogen peroxide", "Lemon juice", "Soft brush", "Cold water"],
    washMethod: "Pre-treat the stain with mild liquid detergent applied directly. For stubborn stains, mix equal parts white vinegar and water, apply to the stain, and let sit for 15 minutes. For white linen, a mixture of hydrogen peroxide and water (1:1 ratio) or diluted lemon juice can help. Gently scrub with a soft brush if necessary. Rinse thoroughly with cold water. Wash according to garment care instructions in the warmest water safe for the fabric.",
    warnings: [
      "Avoid using hot water until the stain is removed",
      "Hydrogen peroxide and lemon juice should only be used on white linen",
      "Linen can shrink if exposed to high heat - air dry or use low heat",
      "Agitation can weaken linen fibers - handle gently and avoid excessive scrubbing"
    ],
    effectiveness: "good"
  },
  {
    stainName: "dirt",
    materialName: "nylon",
    preTreatment: "Shake or brush off as much dry dirt as possible. Rinse the stained area with cold water to remove loose dirt particles.",
    products: ["Liquid detergent", "Dish soap", "White vinegar", "Hydrogen peroxide", "Soft brush", "Warm water"],
    washMethod: "Mix liquid detergent or dish soap with warm water. Apply to the stain and gently scrub with a soft brush if necessary. Rinse thoroughly. For stubborn stains, soak in a solution of one part white vinegar to two parts water for 30 minutes. For light-colored nylon, a solution of hydrogen peroxide and water (1:1 ratio) may help with set-in stains. Wash according to garment care instructions.",
    warnings: [
      "Test any cleaning solution in an inconspicuous area first",
      "Avoid using bleach as it can damage nylon fibers",
      "Hydrogen peroxide may affect the color of dyed nylon",
      "Do not use excessive heat when drying nylon"
    ],
    effectiveness: "excellent"
  }
];

async function seedAdditionalGuides() {
  try {
    console.log("Starting to seed additional stain removal guides...");
    
    let count = 0;
    const validationReport: Record<string, any> = {};
    
    // First normalize all products in guides
    const normalizedGuides = additionalGuides.map(normalizeGuideProducts);
    
    for (const guide of normalizedGuides) {
      // Get stain and material IDs
      const [stainResult] = await db
        .select()
        .from(stains)
        .where(eq(stains.name, guide.stainName));
        
      const [materialResult] = await db
        .select()
        .from(materials)
        .where(eq(materials.name, guide.materialName));
        
      if (!stainResult || !materialResult) {
        console.log(`Skipping guide for ${guide.stainName} on ${guide.materialName} - stain or material not found`);
        continue;
      }
      
      // Check if guide already exists
      const existingGuide = await db
        .select()
        .from(stainRemovalGuides)
        .where(
          and(
            eq(stainRemovalGuides.stainId, stainResult.id),
            eq(stainRemovalGuides.materialId, materialResult.id)
          )
        );
        
      if (existingGuide.length > 0) {
        console.log(`Guide for ${guide.stainName} on ${guide.materialName} already exists, skipping`);
        continue;
      }
      
      // Generate content with our utility
      const content = generateGuideContent(
        stainResult,
        materialResult,
        guide.preTreatment,
        guide.products,
        guide.washMethod,
        guide.warnings,
        guide.effectiveness
      );
      
      // Validate guide against requirements
      const { valid, validationResults } = validateGuide(guide, content);
      
      // Record validation results
      const guideName = `${guide.stainName}_${guide.materialName}`;
      validationReport[guideName] = {
        stainName: guide.stainName,
        materialName: guide.materialName,
        stepCount: content.steps.length,
        productCount: guide.products.length,
        warningCount: guide.warnings.length,
        effectiveness: guide.effectiveness,
        validation: validationResults,
        valid
      };
      
      if (!valid) {
        console.log(`Guide for ${guide.stainName} on ${guide.materialName} failed validation, skipping`);
        continue;
      }
      
      // Insert into database
      await db.insert(stainRemovalGuides).values({
        stainId: stainResult.id,
        materialId: materialResult.id,
        preTreatment: guide.preTreatment,
        products: JSON.stringify(content.supplies),
        washMethod: guide.washMethod,
        warnings: JSON.stringify(guide.warnings),
        effectiveness: guide.effectiveness as any,
        difficulty: content.difficulty,
        timeRequired: content.timeRequired,
        successRate: content.successRate,
        faq: JSON.stringify(content.faqs),
        steps: JSON.stringify(content.steps)
      });
      
      count++;
      console.log(`Created guide for ${guide.stainName} on ${guide.materialName}`);
    }
    
    // Output validation report
    console.log(`Successfully seeded ${count} additional stain removal guides`);
    console.log('Validation report:');
    console.log(JSON.stringify(validationReport, null, 2));
    
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
    console.error("Error seeding additional guides:", error);
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

// Execute the seed function
seedAdditionalGuides().catch(console.error);