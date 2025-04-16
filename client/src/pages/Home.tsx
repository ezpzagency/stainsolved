import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getStainIcon } from '@/lib/iconMap';
import { generateStructuredData } from '@/utils/SeoUtils';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface StainCategory {
  category: string;
  color: string;
  icon: string;
  displayName: string;
  count: number;
}

interface PopularCombo {
  stainName: string;
  materialName: string;
  stainColor: string;
  stainCategory: string;
  description: string;
}

const stainCategories: StainCategory[] = [
  { category: 'beverage', color: 'stain-coffee', icon: 'ri-cup-line', displayName: 'Beverages', count: 18 },
  { category: 'food', color: 'stain-coffee', icon: 'ri-restaurant-line', displayName: 'Food', count: 15 },
  { category: 'oil', color: 'stain-oil', icon: 'ri-drop-line', displayName: 'Oil & Grease', count: 12 },
  { category: 'ink', color: 'primary', icon: 'ri-ink-bottle-line', displayName: 'Ink & Paint', count: 9 },
  { category: 'dirt', color: 'stain-coffee', icon: 'ri-footprint-line', displayName: 'Dirt & Mud', count: 8 },
  { category: 'grass', color: 'stain-grass', icon: 'ri-plant-line', displayName: 'Grass & Plants', count: 7 },
  { category: 'bodily_fluid', color: 'stain-wine', icon: 'ri-heart-pulse-line', displayName: 'Blood & Bodily Fluids', count: 6 },
  { category: 'makeup', color: 'stain-wine', icon: 'ri-brush-line', displayName: 'Makeup & Cosmetics', count: 5 },
];

const popularCombos: PopularCombo[] = [
  { stainName: 'Coffee', materialName: 'Cotton', stainColor: 'stain-coffee', stainCategory: 'beverage', description: 'Remove coffee from shirts, sheets, and cotton clothes' },
  { stainName: 'Wine', materialName: 'Carpet', stainColor: 'stain-wine', stainCategory: 'beverage', description: 'Red wine spills on carpets and rugs' },
  { stainName: 'Oil', materialName: 'Clothing', stainColor: 'stain-oil', stainCategory: 'oil', description: 'Cooking oil and grease stain removal' },
  { stainName: 'Ink', materialName: 'Cotton', stainColor: 'primary', stainCategory: 'ink', description: 'Ink stains from pens and markers' },
  { stainName: 'Blood', materialName: 'Cotton', stainColor: 'stain-wine', stainCategory: 'bodily_fluid', description: 'Blood stain removal techniques' },
  { stainName: 'Grass', materialName: 'Jeans', stainColor: 'stain-grass', stainCategory: 'grass', description: 'Grass stains from outdoor activities' },
];

const Home = () => {
  const { data: stainsData, isLoading: stainsLoading } = useQuery({
    queryKey: ['/api/stains'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: materialsData, isLoading: materialsLoading } = useQuery({
    queryKey: ['/api/materials'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Generate structured data for SEO
  const structuredData = generateStructuredData({
    type: 'WebSite',
    name: 'StainSolver',
    description: 'The ultimate resource for removing stains from any material',
    url: window.location.origin
  });

  return (
    <>
      {/* SEO Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}></script>
      
      {/* Hero Section */}
      <section className="bg-primary/5 border-b border-primary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Expert Stain Removal Guides
          </h1>
          <p className="text-xl text-slate-700 max-w-3xl mx-auto mb-10">
            Step-by-step instructions to remove any stain from any material. Trusted by cleaning professionals and homeowners alike.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/stains" className="bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Browse by Stain
            </Link>
            <Link href="/materials" className="bg-white border border-slate-300 text-slate-800 py-3 px-6 rounded-lg font-medium hover:border-primary hover:text-primary transition-colors">
              Browse by Material
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">Stain Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stainCategories.map((category, index) => (
            <Link key={index} href={`/stains?category=${category.category}`}>
              <div className="bg-white rounded-lg border border-slate-200 p-6 hover:border-primary hover:shadow-md transition-all h-full">
                <div className={`h-12 w-12 rounded-full bg-${category.color}/10 flex items-center justify-center mb-5`}>
                  <i className={`${category.icon} text-${category.color} text-2xl`}></i>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{category.displayName}</h3>
                <p className="text-sm text-slate-600">{category.count} different stain types</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Combos Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">Popular Stain Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularCombos.map((combo, index) => {
              const stainIcon = getStainIcon(combo.stainCategory);
              
              return (
                <Link 
                  key={index} 
                  href={`/remove/${combo.stainName.toLowerCase()}/${combo.materialName.toLowerCase()}`}
                >
                  <div className="bg-white rounded-lg border border-slate-200 p-6 hover:border-primary hover:shadow-md transition-all h-full">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`h-10 w-10 rounded-full bg-${combo.stainColor}/20 flex items-center justify-center flex-shrink-0`}>
                        <i className={`${stainIcon} text-${combo.stainColor}`}></i>
                      </div>
                      <h3 className="font-bold text-slate-900">{combo.stainName} on {combo.materialName}</h3>
                    </div>
                    <p className="text-slate-600">{combo.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <p className="text-slate-700">Stain Types</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">30+</div>
              <p className="text-slate-700">Material Types</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <p className="text-slate-700">Removal Guides</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <div className="flex text-yellow-400 mb-4">
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
              </div>
              <p className="text-slate-700 mb-4">"This site saved my favorite shirt! The coffee stain removal guide was easy to follow and worked perfectly."</p>
              <div className="font-medium text-slate-900">Sarah T.</div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <div className="flex text-yellow-400 mb-4">
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
              </div>
              <p className="text-slate-700 mb-4">"I spilled red wine on my white carpet during a dinner party. This guide helped me get it out completely!"</p>
              <div className="font-medium text-slate-900">Michael R.</div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <div className="flex text-yellow-400 mb-4">
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
                <i className="ri-star-half-fill"></i>
              </div>
              <p className="text-slate-700 mb-4">"As a professional cleaner, I recommend this site to all my clients. The guides are detailed and effective."</p>
              <div className="font-medium text-slate-900">Elena G.</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
