import { db } from "./server/db";
import { stains, materials } from "./shared/schema";
import { eq } from "drizzle-orm";

// Sample stain data
const sampleStains = [
  // Beverage stains
  { name: 'coffee', displayName: 'Coffee', color: '#6F4E37', category: 'beverage', description: 'Dark brown liquid with tannins that can quickly set into fabrics.' },
  { name: 'tea', displayName: 'Tea', color: '#B5651D', category: 'beverage', description: 'Contains tannins that can leave yellowish-brown stains.' },
  { name: 'wine', displayName: 'Wine', color: '#722F37', category: 'beverage', description: 'Red wine contains pigments that easily bond with fibers.' },
  { name: 'soda', displayName: 'Soda', color: '#8B4513', category: 'beverage', description: 'Contains sugar and food coloring that can leave sticky residue.' },
  { name: 'juice', displayName: 'Fruit Juice', color: '#FFA500', category: 'beverage', description: 'Natural fruit pigments that can vary in difficulty to remove.' },
  
  // Food stains
  { name: 'chocolate', displayName: 'Chocolate', color: '#7B3F00', category: 'food', description: 'Contains oils and dark pigments that set into fabrics.' },
  { name: 'tomato-sauce', displayName: 'Tomato Sauce', color: '#FF6347', category: 'food', description: 'Acidic with bright red pigments that stain easily.' },
  { name: 'curry', displayName: 'Curry', color: '#FFC107', category: 'food', description: 'Contains turmeric which has a stubborn yellow pigment.' },
  { name: 'gravy', displayName: 'Gravy', color: '#8B4513', category: 'food', description: 'Fatty sauce that can leave greasy marks on fabric.' },
  { name: 'berries', displayName: 'Berries', color: '#9C27B0', category: 'food', description: 'Contain natural dyes that can permanently stain if not treated quickly.' },
  
  // Oil stains
  { name: 'cooking-oil', displayName: 'Cooking Oil', color: '#FFD700', category: 'oil', description: 'Greasy substance that forms dark patches on fabric.' },
  { name: 'motor-oil', displayName: 'Motor Oil', color: '#000000', category: 'oil', description: 'Dark, thick substance that deeply penetrates fabrics.' },
  { name: 'grease', displayName: 'Grease', color: '#A9A9A9', category: 'oil', description: 'Thick, oily substance that leaves dark marks.' },
  
  // Ink stains
  { name: 'pen-ink', displayName: 'Pen Ink', color: '#000080', category: 'ink', description: 'Permanent dye designed to stick to surfaces.' },
  { name: 'marker', displayName: 'Marker', color: '#4B0082', category: 'ink', description: 'Contains alcohol-based dyes that penetrate deeply.' },
  { name: 'paint', displayName: 'Paint', color: '#1E88E5', category: 'ink', description: 'Pigment suspended in a binding agent that adheres to surfaces.' },
  
  // Dirt stains
  { name: 'mud', displayName: 'Mud', color: '#A52A2A', category: 'dirt', description: 'Mixture of soil and water that can contain various minerals.' },
  { name: 'dirt', displayName: 'Dirt', color: '#8B4513', category: 'dirt', description: 'Dry soil that can embed in fabric fibers.' },
  
  // Bodily fluid stains
  { name: 'blood', displayName: 'Blood', color: '#8B0000', category: 'bodily_fluid', description: 'Protein-based stain that sets with heat and time.' },
  { name: 'sweat', displayName: 'Sweat', color: '#F5F5DC', category: 'bodily_fluid', description: 'Combination of minerals and body oils that yellow over time.' },
  
  // Makeup stains
  { name: 'lipstick', displayName: 'Lipstick', color: '#FF1493', category: 'makeup', description: 'Oil-based cosmetic with pigments designed for longevity.' },
  { name: 'foundation', displayName: 'Foundation', color: '#DEB887', category: 'makeup', description: 'Oil or water-based makeup that can contain various dyes.' },
  
  // Grass stains
  { name: 'grass', displayName: 'Grass', color: '#228B22', category: 'grass', description: 'Contains chlorophyll, a natural green pigment that binds to fabrics.' },
  
  // Other stains
  { name: 'rust', displayName: 'Rust', color: '#B7410E', category: 'other', description: 'Iron oxide that creates reddish-brown marks.' },
  { name: 'wax', displayName: 'Wax', color: '#F5F5DC', category: 'other', description: 'Solidified oil-based substance that adheres to surfaces.' }
];

// Sample material data
const sampleMaterials = [
  // Natural materials
  { name: 'cotton', displayName: 'Cotton', type: 'natural', careNotes: 'Machine washable, can withstand hot water for most items', commonUses: 'T-shirts, jeans, sheets, towels', description: 'Natural fiber that is breathable and absorbent' },
  { name: 'wool', displayName: 'Wool', type: 'natural', careNotes: 'Hand wash in cold water, lay flat to dry', commonUses: 'Sweaters, coats, blankets, suits', description: 'Natural animal fiber that provides warmth and is naturally stain-resistant' },
  { name: 'silk', displayName: 'Silk', type: 'natural', careNotes: 'Dry clean recommended, or hand wash in cold water', commonUses: 'Blouses, dresses, ties, scarves', description: 'Delicate natural fiber with a smooth texture and lustrous appearance' },
  { name: 'linen', displayName: 'Linen', type: 'natural', careNotes: 'Machine washable in cool water, air dry or low heat', commonUses: 'Summer clothing, tablecloths, napkins, bedding', description: 'Natural fiber from the flax plant known for coolness and absorbency' },
  
  // Synthetic materials
  { name: 'polyester', displayName: 'Polyester', type: 'synthetic', careNotes: 'Machine washable, dries quickly, resistant to wrinkles', commonUses: 'Clothing, bedding, upholstery, outdoor gear', description: 'Durable synthetic fiber that resists stretching and shrinking' },
  { name: 'nylon', displayName: 'Nylon', type: 'synthetic', careNotes: 'Machine washable in cold water, low heat drying', commonUses: 'Sportswear, stockings, swimwear, outdoor equipment', description: 'Strong synthetic fiber with good elasticity' },
  { name: 'acrylic', displayName: 'Acrylic', type: 'synthetic', careNotes: 'Machine washable, prone to static, use fabric softener', commonUses: 'Sweaters, hats, blankets, fake fur', description: 'Synthetic wool alternative that is lightweight and warm' },
  
  // Leather
  { name: 'leather', displayName: 'Leather', type: 'leather', careNotes: 'Spot clean with leather cleaner, condition regularly', commonUses: 'Jackets, shoes, bags, furniture', description: 'Animal hide treated for durability and water resistance' },
  { name: 'suede', displayName: 'Suede', type: 'leather', careNotes: 'Use suede brush and protector, avoid water', commonUses: 'Shoes, jackets, handbags, accessories', description: 'Soft, napped leather with a velvety surface' },
  
  // Upholstery
  { name: 'microfiber', displayName: 'Microfiber', type: 'upholstery', careNotes: 'Vacuum regularly, spot clean with appropriate cleaners', commonUses: 'Sofas, chairs, car interiors', description: 'Ultra-fine synthetic fiber that repels liquids and traps dust' },
  { name: 'velvet', displayName: 'Velvet', type: 'upholstery', careNotes: 'Professional cleaning recommended, brush in direction of nap', commonUses: 'Formal clothing, furniture, drapes', description: 'Woven fabric with a thick pile that gives a soft feel' },
  
  // Hard surfaces
  { name: 'carpet', displayName: 'Carpet', type: 'upholstery', careNotes: 'Vacuum weekly, professional cleaning yearly', commonUses: 'Floor coverings, area rugs', description: 'Textile floor covering consisting of an upper layer of pile' },
  { name: 'marble', displayName: 'Marble', type: 'hard_surface', careNotes: 'Clean with pH-neutral cleaners, seal periodically', commonUses: 'Countertops, floors, tables', description: 'Natural stone that is porous and sensitive to acids' },
  { name: 'granite', displayName: 'Granite', type: 'hard_surface', careNotes: 'Daily cleaning with stone cleaner, seal yearly', commonUses: 'Countertops, floors, monuments', description: 'Hard igneous rock that is resistant to scratches' },
  { name: 'wood', displayName: 'Wood', type: 'hard_surface', careNotes: 'Dust regularly, clean with wood-specific products', commonUses: 'Furniture, floors, cabinets', description: 'Natural material that varies in hardness and porosity based on type' }
];

async function seedBasicData() {
  console.log("Starting to seed basic data (stains and materials)...");
  
  try {
    // Insert stains
    for (const stain of sampleStains) {
      await db
        .insert(stains)
        .values(stain)
        .onConflictDoUpdate({
          target: stains.name,
          set: {
            displayName: stain.displayName,
            color: stain.color,
            category: stain.category,
            description: stain.description
          }
        });
    }
    console.log(`Inserted/updated ${sampleStains.length} stains`);

    // Insert materials
    for (const material of sampleMaterials) {
      await db
        .insert(materials)
        .values(material)
        .onConflictDoUpdate({
          target: materials.name,
          set: {
            displayName: material.displayName,
            type: material.type,
            careNotes: material.careNotes,
            commonUses: material.commonUses,
            description: material.description
          }
        });
    }
    console.log(`Inserted/updated ${sampleMaterials.length} materials`);

    console.log("Basic data seeding completed successfully");
  } catch (error) {
    console.error("Error seeding basic data:", error);
  }
}

// Now import and run the guides seeding script
async function seedGuides() {
  try {
    // Import the seed-guides functionality
    const guideSeed = await import('./seed-guides');
    
    // guideSeed will run automatically when imported because
    // it calls the seed function at the bottom of the file
    console.log("Stain removal guides seeding initiated");
  } catch (error) {
    console.error("Error importing or running guide seeding:", error);
  }
}

// Run the seed process
async function runFullSeed() {
  try {
    // First seed basic data (stains and materials)
    await seedBasicData();
    
    // Then seed the guides which depend on stains and materials
    await seedGuides();
    
    console.log("Full database seeding completed");
  } catch (error) {
    console.error("Error in full seeding process:", error);
  } finally {
    // Close the database connection
    await db.end?.();
  }
}

runFullSeed().catch(console.error);