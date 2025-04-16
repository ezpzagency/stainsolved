import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useEffect } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContentHeader from "@/components/ContentHeader";
import SuppliesList from "@/components/SuppliesList";
import Instructions from "@/components/Instructions";
import Warnings from "@/components/Warnings";
import Effectiveness from "@/components/Effectiveness";
import FAQ from "@/components/FAQ";
import RelatedGuides from "@/components/RelatedGuides";
import Sidebar from "@/components/Sidebar";
import { generateStructuredData } from "@/utils/SeoUtils";
import { Skeleton } from "@/components/ui/skeleton";

const StainRemoval = () => {
  const { stain, material } = useParams();
  
  // Track page view for analytics
  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: `How to Remove ${stain} from ${material}`,
        page_path: `/remove/${stain}/${material}`
      });
    }
  }, [stain, material]);

  // Fetch guide data
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/guides/${stain}/${material}`],
  });

  if (isLoading) {
    return <StainRemovalSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Guide Not Found</h1>
          <p className="text-slate-600 mb-6">
            We couldn't find a guide for removing {stain} from {material}.
          </p>
          <a href="/" className="bg-primary text-white py-2 px-4 rounded">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  const { stain: stainData, material: materialData, guide, relatedGuides } = data;

  // Parse JSON fields from the guide
  const products = Array.isArray(guide.products) ? guide.products : JSON.parse(guide.products);
  const warnings = Array.isArray(guide.warnings) ? guide.warnings : JSON.parse(guide.warnings);
  const steps = Array.isArray(guide.steps) ? guide.steps : JSON.parse(guide.steps);
  const faqItems = Array.isArray(guide.faq) ? guide.faq : JSON.parse(guide.faq);
  
  // Prepare data for related guides
  const relatedGuidesData = relatedGuides.map(relatedGuide => {
    // Would need to fetch stain and material data for each related guide
    // This is a simplified version
    return {
      stainId: relatedGuide.stainId,
      materialId: relatedGuide.materialId,
      stainName: stain,
      materialName: material,
      stainColor: stainData.color,
      stainCategory: stainData.category,
      description: "Related stain removal guide"
    };
  });

  // Prepare data for effectiveness component
  const effectivenessData = {
    rating: guide.successRate / 20, // Convert from percentage to 5-star scale
    description: `This method has a high success rate for ${stainData.name.toLowerCase()} stains on ${materialData.name.toLowerCase()}. Fresh stains can be completely removed in about ${guide.successRate}% of cases, while old, set-in stains may still show slight discoloration after treatment.`,
    freshStains: 95,
    oldStains: 80,
    setInStains: 60
  };

  // Prepare material info for sidebar
  const materialInfo = {
    properties: materialData.description || `${materialData.displayName} is a ${materialData.type} fiber.`,
    commonUses: materialData.commonUses || "Various clothing and household items.",
    careInstructions: materialData.careNotes || "Follow care label instructions."
  };
  
  // Prepare breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Stains', href: '/stains' },
    { label: stainData.displayName, href: `/stains/${stain}` },
    { label: materialData.displayName }
  ];

  // Generate structured data for SEO
  const howToStructuredData = generateStructuredData({
    type: 'HowTo',
    name: `How to Remove ${stainData.displayName} from ${materialData.displayName}`,
    description: `Step-by-step guide on removing ${stainData.displayName.toLowerCase()} stains from ${materialData.displayName.toLowerCase()}.`,
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

  const faqStructuredData = generateStructuredData({
    type: 'FAQPage',
    mainEntity: faqItems.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* SEO Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToStructuredData) }}></script>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}></script>
      
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />
      
      {/* Content Header */}
      <ContentHeader
        stainName={stainData.displayName}
        materialName={materialData.displayName}
        stainColor={stainData.color}
        stainCategory={stainData.category}
        timeRequired={guide.timeRequired}
        difficulty={guide.difficulty}
        successRate={guide.successRate}
        lastUpdated={guide.lastUpdated}
      />
      
      <div className="lg:grid lg:grid-cols-3 lg:gap-12">
        <div className="lg:col-span-2">
          {/* Introduction */}
          <section className="mb-10">
            <p className="text-slate-700 leading-relaxed mb-4">
              {stainData.displayName} contains tannins that can leave a lasting stain on {materialData.displayName.toLowerCase()} fabrics. 
              The compounds in {stainData.displayName.toLowerCase()} bond with {materialData.displayName.toLowerCase()} fibers, making it essential to act quickly. 
              The good news is that {materialData.displayName.toLowerCase()} is a {materialData.type === 'natural' ? 'natural' : 'synthetic'} fiber that responds well to most stain removal treatments.
            </p>
            <p className="text-slate-700 leading-relaxed">
              For best results, begin treating {stainData.displayName.toLowerCase()} stains as soon as possible. 
              Even dried {stainData.displayName.toLowerCase()} stains can be removed from {materialData.displayName.toLowerCase()} with the proper technique and a bit of patience.
            </p>
          </section>
          
          {/* Supplies List */}
          <SuppliesList supplies={products} />
          
          {/* Instructions */}
          <Instructions steps={steps} />
          
          {/* Warnings */}
          <Warnings warnings={warnings} />
          
          {/* Effectiveness */}
          <Effectiveness data={effectivenessData} />
          
          {/* FAQ */}
          <FAQ faqs={faqItems} />
          
          {/* Related Guides */}
          <RelatedGuides guides={relatedGuidesData} />
        </div>
        
        {/* Sidebar */}
        <Sidebar materialInfo={materialInfo} />
      </div>
    </div>
  );
};

// Skeleton loader for the stain removal page
const StainRemovalSkeleton = () => (
  <div className="container mx-auto px-4 py-8 max-w-5xl">
    <Skeleton className="h-6 w-64 mb-6" />
    
    <div className="flex items-start gap-4 mb-6">
      <Skeleton className="h-14 w-14 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-10 w-full max-w-xl mb-2" />
        <Skeleton className="h-4 w-full max-w-3xl mb-1" />
        <Skeleton className="h-4 w-full max-w-2xl mb-1" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
    </div>
    
    <div className="flex flex-wrap gap-3 mb-10">
      <Skeleton className="h-8 w-28 rounded-full" />
      <Skeleton className="h-8 w-28 rounded-full" />
      <Skeleton className="h-8 w-28 rounded-full" />
      <Skeleton className="h-8 w-28 rounded-full" />
    </div>
    
    <div className="lg:grid lg:grid-cols-3 lg:gap-12">
      <div className="lg:col-span-2">
        <div className="mb-10">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        
        <div className="mb-12">
          <Skeleton className="h-8 w-64 mb-4" />
          
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={`supply-${i}`} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </div>
        
        <div className="mb-12">
          <Skeleton className="h-8 w-64 mb-4" />
          
          <div className="space-y-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={`step-${i}`} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-10 lg:mt-0">
        <Skeleton className="h-64 w-full rounded-lg mb-6" />
        <Skeleton className="h-64 w-full rounded-lg mb-6" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  </div>
);

export default StainRemoval;
