import { db } from "./server/db";
import { stains, materials, stainRemovalGuides, effectivenessEnum } from "./shared/schema";
import { and, eq } from "drizzle-orm";
import { generateGuideContent, normalizeProductName } from "./server/contentGenerator";

// Seed data for guides
export interface GuideData {
  stainName: string;
  materialName: string;
  preTreatment: string;
  products: string[];
  washMethod: string;
  warnings: string[];
  effectiveness: string;
}

// Function to validate a guide according to requirements
export function validateGuide(guide: GuideData, content: any): {
  valid: boolean;
  validationResults: Record<string, boolean>;
} {
  const validationResults = {
    hasSteps: content.steps.length >= 3 && content.steps.length <= 6,
    hasProducts: guide.products.length >= 3,
    hasWarnings: guide.warnings.length >= 1,
    hasEffectiveness: ['excellent', 'good', 'fair', 'poor'].includes(guide.effectiveness)
  };
  
  const valid = Object.values(validationResults).every(Boolean);
  return { valid, validationResults };
}

// Function to normalize products in a guide
export function normalizeGuideProducts(guide: GuideData): GuideData {
  return {
    ...guide,
    products: guide.products.map(normalizeProductName)
  };
}

// 50+ sample stain-material combinations with detailed removal guides
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
  
  // New additions
  // Tea stains
  {
    stainName: "tea",
    materialName: "cotton",
    preTreatment: "Blot the stain with a clean cloth to remove excess liquid. Rinse the stained area with cold water as soon as possible.",
    products: ["Liquid dish soap", "White vinegar", "Lemon juice", "Baking soda", "Cold water"],
    washMethod: "Mix one tablespoon of liquid dish soap with two cups of cold water. Apply the solution to the stain with a clean cloth. For stubborn stains, create a paste with baking soda and water, apply to the stain, and let sit for 30 minutes. Rinse with cold water, then apply a mixture of equal parts white vinegar and water. For white cotton, you can also try applying lemon juice and setting the fabric in sunlight. Machine wash according to care instructions.",
    warnings: [
      "Never use hot water as it can set tannins in tea permanently",
      "Avoid using bleach on colored cotton",
      "Don't put in the dryer until the stain is completely removed"
    ],
    effectiveness: "excellent"
  },
  {
    stainName: "tea",
    materialName: "carpet",
    preTreatment: "Blot the stain immediately with a clean, dry cloth to absorb as much of the tea as possible. Work from the outside toward the center to prevent spreading.",
    products: ["White vinegar", "Dish soap", "Baking soda", "Clean cloths", "Cold water", "Spray bottle"],
    washMethod: "Mix one tablespoon of dish soap, one tablespoon of white vinegar, and two cups of warm water in a spray bottle. Spray the solution onto the stain and let sit for 10 minutes. Blot with a clean cloth until the stain lifts. For stubborn stains, make a paste of baking soda and water, apply to the area, let dry completely, then vacuum.",
    warnings: [
      "Test any cleaning solution in an inconspicuous area first",
      "Don't oversaturate the carpet as excess moisture can damage padding and subfloor",
      "Avoid rubbing, which can damage carpet fibers and spread the stain"
    ],
    effectiveness: "good"
  },
  
  // Juice stains
  {
    stainName: "juice",
    materialName: "cotton", 
    preTreatment: "Rinse the stained area with cold water immediately. For colored juices, try to flush from the back of the fabric to push the stain out rather than through the fabric.",
    products: ["Liquid dish soap", "White vinegar", "Lemon juice", "Hydrogen peroxide", "Enzyme-based stain remover"],
    washMethod: "Apply liquid dish soap directly to the stain and gently rub. Rinse with cold water. For stubborn stains, soak in a mixture of one part white vinegar to two parts water for 30 minutes. For white cotton fabrics, apply lemon juice or a mixture of hydrogen peroxide and water (1:1 ratio) to the stain and let sit in sunlight. Rinse thoroughly and wash according to care instructions.",
    warnings: [
      "Hot water can set fruit juice stains, always use cold water",
      "Hydrogen peroxide and lemon juice should only be used on white fabrics",
      "Check that the stain is completely gone before putting in the dryer"
    ],
    effectiveness: "excellent"
  },
  {
    stainName: "juice",
    materialName: "silk",
    preTreatment: "Blot the stain gently with a clean cloth to absorb as much juice as possible. Rinse with cold water.",
    products: ["Mild dish soap", "White vinegar", "Cold water", "Clean white cloths"],
    washMethod: "Mix a few drops of mild dish soap in cold water. Using a clean cloth, gently dab the solution onto the stain working from the outside in. Rinse by blotting with a clean cloth dampened with cold water. If the stain persists, mix equal parts white vinegar and cold water and gently dab onto the stain. Rinse again with cold water. Allow to air dry away from direct heat and sunlight.",
    warnings: [
      "Never use hot water on silk",
      "Avoid rubbing which can damage silk fibers",
      "Do not use bleach or hydrogen peroxide on silk",
      "Consider professional cleaning for valuable silk items"
    ],
    effectiveness: "fair"
  },
  
  // Chocolate stains
  {
    stainName: "chocolate",
    materialName: "cotton",
    preTreatment: "Gently scrape off any solid chocolate with a dull knife or spoon. Rinse the back of the stain with cold water to push out the chocolate.",
    products: ["Liquid dish soap", "Laundry detergent", "Hydrogen peroxide", "White vinegar", "Enzyme-based stain remover"],
    washMethod: "Apply liquid dish soap directly to the stain and gently rub. Rinse with cold water. Pretreat with laundry detergent or an enzyme-based stain remover, let sit for 15-30 minutes. For stubborn stains on white cotton, apply a mixture of hydrogen peroxide and dish soap (1:1 ratio). For colored cotton, use a mixture of white vinegar and water. Wash in the warmest water safe for the fabric.",
    warnings: [
      "Avoid hot water until the stain is removed as it can cook the proteins in chocolate",
      "Don't use hydrogen peroxide on colored fabrics",
      "Check that the stain is gone before putting in the dryer"
    ],
    effectiveness: "good"
  },
  {
    stainName: "chocolate",
    materialName: "carpet",
    preTreatment: "Gently scrape off excess chocolate with a dull knife. Vacuum any dry, loose particles.",
    products: ["Dish soap", "White vinegar", "Ammonia", "Warm water", "Clean cloths", "Ice cubes"],
    washMethod: "For a fresh stain, apply ice to harden the chocolate, then scrape off as much as possible. Mix one tablespoon of dish soap with two cups of warm water. Using a clean cloth, dab the solution onto the stain and blot. For stubborn stains, mix one tablespoon of ammonia with one cup of water (test in an inconspicuous area first) and apply to the stain. Blot with a clean cloth dampened with water to rinse.",
    warnings: [
      "Never use hot water which can set the stain",
      "Test all cleaning solutions in an inconspicuous area first",
      "Don't oversaturate the carpet",
      "Never mix ammonia with bleach as it creates toxic fumes"
    ],
    effectiveness: "good"
  },
  
  // Tomato sauce stains
  {
    stainName: "tomato-sauce",
    materialName: "cotton",
    preTreatment: "Scrape off excess sauce. Run cold water through the back of the stain to push the tomato sauce out of the fibers.",
    products: ["Liquid dish soap", "White vinegar", "Hydrogen peroxide", "Lemon juice", "Baking soda", "Enzyme-based stain remover"],
    washMethod: "Apply liquid dish soap directly to the stain and gently rub. Rinse with cold water. Pretreat with an enzyme-based stain remover and let sit for 15-30 minutes. For stubborn stains on white cotton, apply a mixture of hydrogen peroxide and dish soap (1:1 ratio) or lemon juice. For colored cotton, use white vinegar directly on the stain, let sit for 10 minutes. Wash in the warmest water safe for the fabric.",
    warnings: [
      "Hot water can set tomato stains, always rinse with cold water first",
      "Hydrogen peroxide and lemon juice should only be used on white fabrics",
      "Check that the stain is completely gone before putting in the dryer",
      "Tomato stains may need multiple treatments"
    ],
    effectiveness: "good"
  },
  {
    stainName: "tomato-sauce",
    materialName: "plastic",
    preTreatment: "Wipe away excess sauce as soon as possible. Rinse with cold water.",
    products: ["Dish soap", "Baking soda", "White vinegar", "Hydrogen peroxide", "Lemon juice", "Salt"],
    washMethod: "Wash with dish soap and water. For stubborn stains, make a paste with baking soda and water, apply to the stained area, and let sit for 15-30 minutes. Alternatively, soak in a solution of equal parts water and white vinegar. For persistent stains, especially on white plastic, apply a paste of hydrogen peroxide and baking soda and place in sunlight for a few hours. Rinse thoroughly after all treatments.",
    warnings: [
      "Test hydrogen peroxide on a small area first as it may discolor some plastics",
      "Avoid using abrasive scrubbers on plastic that scratches easily",
      "Don't use bleach on plastic food containers as residues can be harmful"
    ],
    effectiveness: "good"
  },
  
  // Grass stains
  {
    stainName: "grass",
    materialName: "cotton",
    preTreatment: "Brush off any loose dirt or grass particles. Don't rinse with water until after pretreating, as water can set grass stains.",
    products: ["Enzyme-based stain remover", "Rubbing alcohol", "White vinegar", "Liquid dish soap", "Hydrogen peroxide", "Ammonia"],
    washMethod: "Apply enzyme-based stain remover directly to the stain and let sit for 15 minutes. Alternatively, dab rubbing alcohol onto the stain with a clean cloth, working from the outside in. For stubborn stains, mix one part white vinegar with two parts water and apply. For white cotton, a mixture of hydrogen peroxide and liquid dish soap (1:1 ratio) can be effective. Wash in the warmest water safe for the fabric.",
    warnings: [
      "Grass stains are protein stains, so avoid using hot water until the stain is removed",
      "Rubbing alcohol and hydrogen peroxide may discolor some fabrics, test in an inconspicuous area first",
      "Don't use bleach on protein stains as it can make them more difficult to remove"
    ],
    effectiveness: "good"
  },
  {
    stainName: "grass",
    materialName: "polyester",
    preTreatment: "Brush away any loose grass or dirt particles. Don't rinse with water until after pretreating.",
    products: ["Enzyme-based stain remover", "Rubbing alcohol", "White vinegar", "Liquid dish soap", "Oxygen bleach"],
    washMethod: "Apply enzyme-based stain remover directly to the stain and let sit for 15 minutes. Alternatively, dab the stain with rubbing alcohol using a clean cloth. For stubborn stains, mix equal parts white vinegar and liquid dish soap, apply to the stain, and let sit for 30 minutes. Rinse and then wash with an oxygen bleach added to your regular detergent.",
    warnings: [
      "Avoid using hot water until the stain is removed",
      "Test rubbing alcohol in an inconspicuous area first as it may affect certain dyes",
      "Don't use chlorine bleach on polyester as it can yellow the fabric"
    ],
    effectiveness: "good"
  },
  
  // Sweat stains
  {
    stainName: "sweat",
    materialName: "cotton",
    preTreatment: "Rinse the stained area with cold water as soon as possible after staining.",
    products: ["White vinegar", "Baking soda", "Hydrogen peroxide", "Ammonia", "Aspirin", "Enzyme-based stain remover"],
    washMethod: "For fresh stains, soak in a solution of one part white vinegar to two parts water for 30 minutes. For set-in stains or yellowing, make a paste with equal parts baking soda, hydrogen peroxide, and water. Apply to the stain and let sit for 30-60 minutes. For stubborn stains, dissolve 2-3 aspirin tablets in warm water and soak the stained area for 2-3 hours. Wash in the warmest water safe for the fabric with an enzyme-based detergent.",
    warnings: [
      "Don't use vinegar and hydrogen peroxide together as they can cancel each other out",
      "Hydrogen peroxide may bleach colored fabrics",
      "Never mix ammonia with bleach as it creates toxic fumes",
      "For persistent underarm stains, you may need to repeat treatments"
    ],
    effectiveness: "good"
  },
  {
    stainName: "sweat",
    materialName: "silk",
    preTreatment: "Blot the stained area gently with a clean cloth. Don't rub as this can damage silk fibers.",
    products: ["Mild dish soap", "White vinegar", "Lemon juice", "Vodka", "Cold water"],
    washMethod: "Mix a few drops of mild dish soap in cold water. Using a clean cloth, gently dab the solution onto the stain. Rinse by blotting with a clean cloth dampened with cold water. For stubborn stains, mix equal parts white vinegar and water, dab onto the stain, let sit for 5-10 minutes, then rinse. Alternatively, spray plain vodka on the stain, let dry, and repeat if necessary. For white silk, diluted lemon juice may help with yellowing.",
    warnings: [
      "Never use hot water on silk",
      "Avoid rubbing which can damage silk fibers",
      "Test all cleaning solutions in an inconspicuous area first",
      "Consider professional cleaning for valuable silk items",
      "Lemon juice should only be used on white silk"
    ],
    effectiveness: "fair"
  },
  
  // Lipstick stains
  {
    stainName: "lipstick",
    materialName: "cotton",
    preTreatment: "Gently scrape off excess lipstick with a dull knife or spoon. Don't rub the stain as it can spread.",
    products: ["Rubbing alcohol", "Liquid dish soap", "Hairspray", "Shaving cream", "Makeup remover", "WD-40"],
    washMethod: "Apply rubbing alcohol to the stain with a clean cloth, dabbing from the outside in. Alternatively, spray the stain with alcohol-based hairspray, let sit for 10-15 minutes, then dab with a damp cloth. For stubborn stains, apply a small amount of WD-40, let sit for 5 minutes, then apply liquid dish soap directly to the stain. For fresh stains, makeup remover or shaving cream can be effective. Wash in warm water with regular detergent.",
    warnings: [
      "Always test products in an inconspicuous area first",
      "Rubbing alcohol and WD-40 may affect certain dyes",
      "Ensure all cleaning products are completely rinsed out before drying",
      "Many lipsticks contain wax, oil, and dye, requiring multiple treatments"
    ],
    effectiveness: "good"
  },
  {
    stainName: "lipstick",
    materialName: "leather",
    preTreatment: "Very gently scrape off excess lipstick with a dull knife, being careful not to spread the stain or damage the leather.",
    products: ["Mild soap", "Petroleum jelly", "Makeup remover", "Leather cleaner", "Leather conditioner", "Cotton swabs"],
    washMethod: "Apply a small amount of petroleum jelly to the stain and let sit for 1-2 minutes to help break down the oils and waxes. Wipe away with a clean cloth. Next, mix a few drops of mild soap with water until slightly foamy. Dampen a clean cloth with the solution and gently dab at the stain. Wipe away soap with a cloth dampened with clean water. For stubborn stains, try oil-free makeup remover applied with a cotton swab. After the stain is removed, apply leather conditioner to prevent drying.",
    warnings: [
      "Never use alcohol-based products on leather as they can cause drying and cracking",
      "Test all cleaning products in an inconspicuous area first",
      "Don't oversaturate leather with any liquid",
      "Always condition leather after cleaning"
    ],
    effectiveness: "fair"
  },
  
  // Foundation stains
  {
    stainName: "foundation",
    materialName: "cotton",
    preTreatment: "Gently scrape off excess foundation with a dull knife or spoon. For liquid foundation, blot with a clean paper towel to absorb as much as possible.",
    products: ["Liquid dish soap", "Shaving cream", "Makeup remover", "Hydrogen peroxide", "Enzyme-based stain remover", "WD-40"],
    washMethod: "Apply liquid dish soap directly to the stain and gently rub. Let sit for 5-10 minutes. For oil-based foundations, spray WD-40 on the stain, let sit for 5 minutes, then apply dish soap. For water-based foundations, shaving cream can be effective - apply, let sit for 5-10 minutes, then rinse. For stubborn stains on white fabrics, apply a mixture of hydrogen peroxide and dish soap. Wash in the warmest water safe for the fabric with enzyme-based detergent.",
    warnings: [
      "Check the foundation type (oil or water-based) to determine the best treatment",
      "Test WD-40 and hydrogen peroxide in an inconspicuous area first",
      "Hydrogen peroxide should only be used on white or colorfast fabrics",
      "Foundation stains may require multiple treatments"
    ],
    effectiveness: "good"
  },
  {
    stainName: "foundation",
    materialName: "microfiber",
    preTreatment: "Blot gently with a clean paper towel to absorb excess foundation. Do not rub, as this can push the stain deeper into the fibers.",
    products: ["Liquid dish soap", "Rubbing alcohol", "Makeup remover", "Baking soda", "Cornstarch", "Baby powder"],
    washMethod: "For fresh stains, apply oil-free makeup remover to a clean cloth and gently dab the stain. For set-in stains, sprinkle cornstarch, baking soda, or baby powder over the stain to absorb oils. Let sit for 15-20 minutes, then vacuum. Next, mix liquid dish soap with warm water and apply with a clean cloth, dabbing gently. For stubborn stains, dampen a cloth with rubbing alcohol and dab the stain. Rinse by dabbing with a clean cloth dampened with water.",
    warnings: [
      "Test rubbing alcohol in an inconspicuous area first",
      "Don't oversaturate microfiber upholstery",
      "Allow to dry completely between treatments",
      "For professionally treated microfiber marked with 'S', only use solvent-based cleaners"
    ],
    effectiveness: "good"
  },
  
  // Rust stains
  {
    stainName: "rust",
    materialName: "cotton",
    preTreatment: "Lay the stained fabric on a towel in a well-ventilated area. Do not rinse with water first, as rust stains need special treatment.",
    products: ["Lemon juice", "White vinegar", "Commercial rust remover", "Salt", "Cream of tartar", "Hydrogen peroxide"],
    washMethod: "For light rust stains, apply lemon juice directly to the stain, sprinkle with salt, and lay in the sun for 1-2 hours. Rinse and repeat if necessary. For stubborn stains, mix equal parts cream of tartar and hydrogen peroxide to form a paste. Apply to the stain, let sit for 30 minutes, then rinse. Alternatively, soak in white vinegar overnight. For severe stains, consider a commercial rust remover designed for fabrics, following package instructions carefully.",
    warnings: [
      "Commercial rust removers contain harsh chemicals - wear gloves and work in a ventilated area",
      "Test all treatments in an inconspicuous area first",
      "Never use chlorine bleach on rust stains as it can make them permanent",
      "Some rust removers may damage colored fabrics"
    ],
    effectiveness: "fair"
  },
  {
    stainName: "rust",
    materialName: "marble",
    preTreatment: "Wipe the stained area with a damp cloth to remove any loose debris. Do not use acidic cleaners (like vinegar or lemon juice) as they will etch marble.",
    products: ["Poultice powder", "Hydrogen peroxide", "Ammonia", "Baking soda", "Dishwashing soap", "Plastic wrap"],
    washMethod: "For light stains, mix baking soda with a small amount of water to create a poultice. For more stubborn stains, create a poultice by mixing poultice powder with hydrogen peroxide. Apply the poultice to the stain, cover with plastic wrap, and tape down the edges. Allow it to sit for 24-48 hours, then rinse with water. For deep stains, you may need to repeat the process or consult a professional stone restoration specialist.",
    warnings: [
      "Never use acidic cleaners (vinegar, lemon juice) on marble",
      "Test any solution in an inconspicuous area first",
      "Harsh cleaning can damage the marble finish",
      "Deep or extensive rust stains may require professional treatment"
    ],
    effectiveness: "fair"
  },
  
  // Wax stains
  {
    stainName: "wax",
    materialName: "cotton",
    preTreatment: "Allow the wax to harden completely. Gently scrape off as much hardened wax as possible with a dull knife or credit card.",
    products: ["Iron", "Brown paper bag", "Hair dryer", "White vinegar", "Rubbing alcohol", "Carpet cleaner"],
    washMethod: "Place a brown paper bag or paper towel over the wax stain, then apply a warm iron (no steam) over the paper. The heat will melt the wax, which will be absorbed by the paper. Replace the paper and repeat until no more wax transfers. For any remaining colored dye stains, dab with rubbing alcohol or white vinegar. Wash according to the garment's care instructions.",
    warnings: [
      "Use a medium-low heat setting on the iron to avoid scorching the fabric",
      "Never apply the iron directly to the wax or fabric",
      "Test rubbing alcohol on an inconspicuous area first as it may affect certain dyes",
      "For delicate fabrics, use a hair dryer instead of an iron"
    ],
    effectiveness: "excellent"
  },
  {
    stainName: "wax",
    materialName: "carpet",
    preTreatment: "Allow the wax to harden completely. Gently scrape off as much hardened wax as possible with a dull knife or credit card.",
    products: ["Iron", "Brown paper bag", "Hair dryer", "Ice cube", "Carpet cleaner", "Rubbing alcohol"],
    washMethod: "Place a brown paper bag or paper towel over the wax stain, then apply a warm iron (no steam) over the paper. The heat will melt the wax, which will be absorbed by the paper. Replace the paper and repeat until no more wax transfers. For stubborn wax, you can also try freezing the area with an ice cube in a plastic bag, then breaking up the frozen wax. For any remaining colored dye stains, apply a small amount of carpet cleaner or rubbing alcohol with a clean cloth.",
    warnings: [
      "Use a medium-low heat setting on the iron to avoid damaging the carpet fibers",
      "Always test in an inconspicuous area first",
      "Be gentle when scraping to avoid damaging carpet fibers",
      "Some carpet warranties may be voided by certain cleaning methods, check manufacturer guidelines"
    ],
    effectiveness: "good"
  }
];

async function seedGuides() {
  try {
    console.log("Starting to seed stain removal guides...");
    
    let count = 0;
    const validationReport: Record<string, any> = {};
    
    // First normalize all products in guides
    const normalizedGuides = sampleGuides.map(normalizeGuideProducts);
    
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
    
    // Write validation report to file
    console.log(`Successfully seeded ${count} stain removal guides`);
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
    console.error("Error seeding guides:", error);
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
seedGuides().catch(console.error);