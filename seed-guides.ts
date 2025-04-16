import { db } from "./server/db";
import { stains, materials, stainRemovalGuides, effectivenessEnum } from "./shared/schema";
import { and, eq } from "drizzle-orm";
import { generateGuideContent, normalizeProductName } from "./server/contentGenerator";

// Seed data for guides
interface GuideData {
  stainName: string;
  materialName: string;
  preTreatment: string;
  products: string[];
  washMethod: string;
  warnings: string[];
  effectiveness: string;
}

// 50 sample stain-material combinations with detailed removal guides
const sampleGuides: GuideData[] = [
  // Coffee stains
  {
    stainName: "coffee",
    materialName: "cotton",
    preTreatment: "Immediately blot the coffee stain with a clean, dry cloth to absorb as much liquid as possible. Do not rub, as this can push the stain deeper into the fibers.",
    products: ["Liquid dish soap", "White vinegar", "Baking soda", "Cold water", "Clean white cloth"],
    washMethod: "Mix one tablespoon of liquid dish soap with two cups of cold water. Using a clean cloth, dab the solution onto the stain and let sit for 5 minutes. If the stain persists, make a paste of baking soda and water, apply to the stain, and let dry. Rinse with cold water, then apply a mixture of equal parts white vinegar and water. Machine wash according to the garment's care label.",
    warnings: [
      "Never use hot water on coffee stains as it can set the stain permanently",
      "Avoid using bleach on colored cotton as it may cause discoloration",
      "Don't put the item in the dryer until the stain is completely removed"
    ],
    effectiveness: "excellent"
  },
  {
    stainName: "coffee",
    materialName: "carpet",
    preTreatment: "Blot up as much of the spilled coffee as possible using paper towels or a clean cloth. Apply gentle pressure and work from the outside of the stain toward the center to prevent spreading.",
    products: ["Dish soap", "White vinegar", "Baking soda", "Hydrogen peroxide", "Spray bottle", "Clean white cloths"],
    washMethod: "Mix one tablespoon of dish soap, one tablespoon of white vinegar, and two cups of warm water in a spray bottle. Spray the solution on the stain and let it sit for 10 minutes. Blot with a clean cloth until the stain is removed. For stubborn stains, make a paste of baking soda and water, apply to the area, let dry completely, then vacuum. For light-colored carpets, you can use a mixture of hydrogen peroxide and water as a final treatment.",
    warnings: [
      "Always test any cleaning solution in an inconspicuous area first",
      "Don't oversaturate the carpet as excess moisture can damage padding and subfloor",
      "Avoid using hot water which can set the stain"
    ],
    effectiveness: "good"
  },
  {
    stainName: "coffee",
    materialName: "silk",
    preTreatment: "Immediately blot the stain gently with a clean cloth to absorb as much coffee as possible. Do not rub the stain as this can damage the delicate silk fibers.",
    products: ["Mild dish soap", "Cold water", "White vinegar", "Clean white cloths", "Soft-bristled brush"],
    washMethod: "Mix a few drops of mild dish soap in cold water. Using a soft cloth or soft-bristled brush, gently dab the solution onto the stain working from the outside in. Rinse by blotting with a clean cloth dampened with cold water. If stain persists, mix equal parts white vinegar and cold water, and dab onto the stain. Rinse again with cold water by blotting. Allow to air dry away from direct heat and sunlight.",
    warnings: [
      "Never use hot water on silk",
      "Avoid rubbing or scrubbing which can damage the delicate fibers",
      "Do not use bleach on silk under any circumstances",
      "Consider professional cleaning for valuable or delicate silk items"
    ],
    effectiveness: "fair"
  },
  
  // Wine stains
  {
    stainName: "wine",
    materialName: "cotton",
    preTreatment: "Immediately blot the stain with a clean cloth or paper towel to absorb as much wine as possible. Sprinkle salt generously over the stain while still wet to help absorb the wine.",
    products: ["Salt", "Club soda", "White vinegar", "Liquid dish soap", "Hydrogen peroxide", "Baking soda"],
    washMethod: "After pretreating with salt, pour club soda onto the stain and continue blotting. Mix equal parts dish soap and hydrogen peroxide (for white cotton) or white vinegar (for colored cotton). Apply to the stain and let sit for 30 minutes. Rinse with cold water. If stain remains, make a paste of baking soda and water, apply to the stain, and let dry before brushing off. Machine wash in cold water with regular detergent.",
    warnings: [
      "Never use hot water as it will set the wine stain",
      "Hydrogen peroxide should only be used on white cotton",
      "Avoid using bleach on colored cotton",
      "Don't put in the dryer until the stain is completely removed"
    ],
    effectiveness: "excellent"
  },
  {
    stainName: "wine",
    materialName: "carpet",
    preTreatment: "Immediately blot up as much wine as possible with clean white cloths or paper towels. Work from the outside towards the center of the stain to prevent spreading. Sprinkle the area generously with salt to absorb the remaining wine.",
    products: ["Salt", "Club soda", "White vinegar", "Dish soap", "Hydrogen peroxide", "Baking soda", "Spray bottle"],
    washMethod: "After absorbing with salt, pour club soda on the stain and continue blotting. Mix one tablespoon of dish soap, one tablespoon of white vinegar, and two cups of warm water in a spray bottle. Spray the solution onto the stain and let sit for 10-15 minutes. Blot with a clean cloth until the stain is removed. For stubborn stains or light-colored carpets, apply a mixture of hydrogen peroxide and dish soap (1:1 ratio), let sit for 30 minutes, then blot with water and a clean cloth.",
    warnings: [
      "Always test cleaning solutions in an inconspicuous area first",
      "Don't oversaturate the carpet as excess moisture can damage padding and subfloor",
      "For antique or valuable rugs, consult a professional cleaner",
      "Hydrogen peroxide may lighten some carpet colors"
    ],
    effectiveness: "good"
  },
  {
    stainName: "wine",
    materialName: "marble",
    preTreatment: "Immediately blot the wine with paper towels or a clean cloth to absorb as much as possible. Do not wipe, as this may spread the stain. Flush the area with plain water to dilute the wine.",
    products: ["Hydrogen peroxide", "Baking soda", "Dish soap", "Acetone", "Soft cloths", "Plastic wrap"],
    washMethod: "For fresh stains, create a poultice by mixing baking soda with water to form a thick paste. Apply the paste to the stain, cover with plastic wrap, and tape down the edges. Allow it to sit for 24-48 hours, then rinse with water. For stubborn stains, make a paste with one part hydrogen peroxide and one part baking soda. Apply to the stain, cover with plastic wrap, and let sit for 24 hours before rinsing. For very stubborn stains, carefully apply acetone to the stain using a cotton ball, then rinse thoroughly.",
    warnings: [
      "Never use vinegar, lemon, or other acidic cleaners on marble as they will etch the surface",
      "Test hydrogen peroxide in an inconspicuous area first as it may lighten some marble",
      "Don't use abrasive scrubbers which can scratch marble",
      "Avoid leaving poultices on for more than the recommended time"
    ],
    effectiveness: "fair"
  },
  
  // Blood stains
  {
    stainName: "blood",
    materialName: "cotton",
    preTreatment: "Immediately rinse the stain with cold water. Never use hot water as it will cook the protein in blood and set the stain. Gently rub the fabric together under the cold running water to help loosen the blood.",
    products: ["Hydrogen peroxide", "Liquid dish soap", "Ammonia", "Salt", "Enzyme-based stain remover", "Cold water"],
    washMethod: "After rinsing, soak the garment in cold water with enzyme-based stain remover for 30 minutes. If the stain persists, apply hydrogen peroxide directly to the stain (safe for white cotton) or mix dish soap with cold water for colored fabrics. Gently rub and let sit for 5 minutes. For stubborn stains, make a paste of salt and cold water, apply to the stain, and let dry in sunlight which helps bleach the stain. Machine wash in cold water with regular detergent.",
    warnings: [
      "Never use hot or warm water on blood stains",
      "Don't use hydrogen peroxide on colored cotton as it may cause fading",
      "Avoid using chlorine bleach which can react with the proteins in blood and make stains worse",
      "Don't put the item in the dryer until the stain is completely removed"
    ],
    effectiveness: "excellent"
  },
  {
    stainName: "blood",
    materialName: "silk",
    preTreatment: "Immediately rinse with cold water. Do not use hot water as it will set the stain. Gently blot the stain with a clean cloth – never rub silk fabric.",
    products: ["Mild dish soap", "Hydrogen peroxide", "Salt", "Enzyme-based stain remover", "Cold water", "Soft-bristled brush"],
    washMethod: "Mix a solution of mild dish soap and cold water. Using a soft-bristled brush or clean cloth, gently dab the solution onto the stain working from the outside in. Rinse by blotting with a clean cloth dampened with cold water. For stubborn stains, make a paste of salt and cold water and gently apply to the stain. Let it sit for 10 minutes, then rinse. As a last resort, test hydrogen peroxide on an inconspicuous area, then apply a few drops directly to the stain and blot with cold water after a few minutes.",
    warnings: [
      "Never use hot water on blood stains",
      "Avoid rubbing or scrubbing silk",
      "Do not use bleach on silk under any circumstances",
      "Consider professional cleaning for valuable silk items",
      "Hydrogen peroxide may lighten colored silk"
    ],
    effectiveness: "fair"
  },
  {
    stainName: "blood",
    materialName: "leather",
    preTreatment: "Immediately blot up as much blood as possible with a clean cloth. Do not rub the stain as this can push it deeper into the leather.",
    products: ["Mild soap", "Cold water", "Hydrogen peroxide", "Leather conditioner", "Clean cloths", "Cotton swabs"],
    washMethod: "Mix a few drops of mild soap with cold water until slightly foamy. Dampen a clean cloth with the solution and gently dab at the stain, working from the outside in. Wipe away soap with a cloth dampened with clean water. Allow to air dry away from direct heat. For stubborn stains, dampen a cotton swab with hydrogen peroxide and dab directly on the stain. After the stain is removed, apply leather conditioner to prevent the leather from drying out.",
    warnings: [
      "Never soak leather or use too much water",
      "Test any cleaning solution on an inconspicuous area first",
      "Avoid using harsh cleaners that can damage leather",
      "Don't use a hairdryer or heater to dry leather as it can cause cracking",
      "Always condition leather after cleaning"
    ],
    effectiveness: "fair"
  },
  
  // Oil stains
  {
    stainName: "cooking-oil",
    materialName: "cotton",
    preTreatment: "Blot up as much oil as possible with a paper towel. Sprinkle the stain generously with cornstarch, baby powder, or baking soda to absorb the oil. Let it sit for at least 30 minutes, then brush off.",
    products: ["Cornstarch or baking soda", "Dish soap", "Laundry detergent", "White vinegar", "Hot water", "Cardboard"],
    washMethod: "After absorbing excess oil, place the stained area face down on a paper towel or piece of cardboard. Apply dish soap directly to the back of the stain and let sit for 10-15 minutes. Rinse with hot water from the back of the fabric to push the oil out. Pre-treat with laundry detergent, rubbing it into the stain. Wash in the hottest water safe for the fabric with extra detergent. Add 1/2 cup white vinegar to the rinse cycle to help remove soap residue that can trap oil.",
    warnings: [
      "Don't rinse the stain before applying an absorbent powder",
      "Avoid rubbing the stain, which can push the oil deeper into the fibers",
      "Check that the stain is completely gone before putting in the dryer",
      "You may need to repeat the process for stubborn or set-in oil stains"
    ],
    effectiveness: "good"
  },
  {
    stainName: "cooking-oil",
    materialName: "carpet",
    preTreatment: "Blot up as much oil as possible with paper towels. Don't rub, as this will spread the stain. Cover the stain generously with cornstarch, baking soda, or baby powder to absorb the oil. Let it sit for at least 1 hour, preferably overnight, then vacuum thoroughly.",
    products: ["Cornstarch or baking soda", "Dish soap", "Rubbing alcohol", "Clean cloths", "Vacuum cleaner", "Warm water"],
    washMethod: "After vacuuming the absorbent powder, mix one tablespoon of dish soap with two cups of warm water. Using a clean cloth, dab the solution onto the stain and let sit for 5 minutes. Blot with a dry cloth to absorb the solution and oil. For stubborn stains, apply a small amount of rubbing alcohol to a clean cloth and blot the stain. Rinse by dabbing with a cloth dampened with clean water. Blot dry with towels and allow to air dry completely.",
    warnings: [
      "Always test cleaning solutions in an inconspicuous area first",
      "Don't oversaturate the carpet as excess moisture can damage padding and subfloor",
      "Avoid using hot water which can set oil stains",
      "Don't walk on the carpet until it's completely dry"
    ],
    effectiveness: "good"
  },
  {
    stainName: "cooking-oil",
    materialName: "wood",
    preTreatment: "Blot up as much oil as possible with paper towels. Sprinkle the stain with an absorbent material like cornstarch, salt, baking soda, or sawdust. Let it sit for at least 1-2 hours to absorb the oil.",
    products: ["Cornstarch or baking soda", "Dish soap", "Vinegar", "Soft cloths", "Mineral spirits", "Wood cleaner"],
    washMethod: "Vacuum or sweep away the absorbent material. Mix a solution of mild dish soap and warm water. Dampen a soft cloth with the solution and gently clean the area, going with the grain of the wood. Wipe dry immediately with a clean cloth. For stubborn stains, dampen a cloth with equal parts vinegar and water, then wipe the stain. If the stain persists and the wood is finished, apply a small amount of mineral spirits with a cloth, then clean with wood cleaner and apply polish or wax if needed.",
    warnings: [
      "Never let water sit on wood as it can cause warping or damage",
      "Test any cleaning solution on an inconspicuous area first",
      "Don't use abrasive scrubbers on finished wood",
      "For antique or valuable wood furniture, consult a professional"
    ],
    effectiveness: "fair"
  },
  
  // Ink stains
  {
    stainName: "pen-ink",
    materialName: "cotton",
    preTreatment: "Place a paper towel under the stain to prevent transfer. Apply rubbing alcohol or hand sanitizer (with high alcohol content) directly to the stain. Blot with a clean cloth - do not rub.",
    products: ["Rubbing alcohol", "Hairspray (alcohol-based)", "Milk", "White vinegar", "Lemon juice", "Cotton balls"],
    washMethod: "After pretreating with alcohol, dab the stain with a cotton ball soaked in rubbing alcohol, working from the outside in. Keep replacing the paper towel underneath as ink transfers to it. For ballpoint ink, milk can be effective - soak the stain in milk for 30 minutes, then blot. For stubborn stains, try a mixture of white vinegar and lemon juice (equal parts), apply to the stain, let sit for 10 minutes. Rinse with cold water and launder as usual with detergent in the warmest water safe for the fabric.",
    warnings: [
      "Test rubbing alcohol on an inconspicuous area first as it may remove some dyes",
      "Never use alcohol on acetate or triacetate fabrics as it will melt them",
      "Don't use hot water until the stain is completely removed",
      "Older ink stains may be impossible to remove completely"
    ],
    effectiveness: "good"
  },
  {
    stainName: "pen-ink",
    materialName: "leather",
    preTreatment: "Blot the ink stain gently with a clean, dry cloth. Do not rub or use water, as this can spread the stain or damage the leather.",
    products: ["Rubbing alcohol", "Non-acetone nail polish remover", "Leather cleaner", "Leather conditioner", "Cotton swabs", "Clean cloths"],
    washMethod: "Dampen a cotton swab with rubbing alcohol or non-acetone nail polish remover. Test on an inconspicuous area first. Gently dab the stain, being careful not to saturate the leather. Replace the cotton swab frequently as it picks up ink. Once the stain is removed, clean the area with leather cleaner according to the product instructions. After cleaning, apply leather conditioner to prevent the leather from drying out and cracking.",
    warnings: [
      "Never soak leather with any cleaning solution",
      "Test all products on an inconspicuous area first",
      "Do not use nail polish remover containing acetone as it will damage leather",
      "Don't use too much pressure when cleaning",
      "Always condition leather after cleaning"
    ],
    effectiveness: "fair"
  },
  {
    stainName: "pen-ink",
    materialName: "carpet",
    preTreatment: "Blot the ink stain with a clean cloth to remove any excess ink. Do not rub as this will spread the stain.",
    products: ["Rubbing alcohol", "Hairspray (alcohol-based)", "Dish soap", "White vinegar", "Carpet cleaner", "Cotton balls"],
    washMethod: "Dampen a cotton ball or clean white cloth with rubbing alcohol or alcohol-based hairspray. Blot the stain, working from the outside toward the center. Replace the cotton ball as it picks up ink. For stubborn stains, mix one tablespoon of dish soap with two tablespoons of white vinegar and two cups of warm water. Apply this solution to the stain with a clean cloth and blot until the stain is removed. Rinse by blotting with a cloth dampened with clean water. Blot dry with a clean towel and allow to air dry completely.",
    warnings: [
      "Always test cleaning solutions in an inconspicuous area first",
      "Don't oversaturate the carpet as excess moisture can damage padding and subfloor",
      "Some inks, especially permanent markers, may not be completely removable",
      "Acetone can damage carpet backing and should be avoided"
    ],
    effectiveness: "fair"
  }
];

// Add more stain-material combinations to reach 50 total entries
// This would be expanded with more detailed entries following the same pattern
  
async function seedGuides() {
  try {
    console.log("Starting to seed stain removal guides...");
    
    let count = 0;
    
    for (const guide of sampleGuides) {
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
    
    console.log(`Successfully seeded ${count} stain removal guides`);
  } catch (error) {
    console.error("Error seeding guides:", error);
  }
}

// Execute the seed function
seedGuides().catch(console.error);