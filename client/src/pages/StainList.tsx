import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { getStainIcon } from "@/lib/iconMap";
import { generateStructuredData } from "@/utils/SeoUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const StainList = () => {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const categoryFilter = urlParams.get('category') || '';
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch all stains
  const { data: stains, isLoading, error } = useQuery({
    queryKey: ['/api/stains'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Generate structured data for SEO
  const structuredData = generateStructuredData({
    type: 'CollectionPage',
    name: 'Stain Removal Guide - Types of Stains',
    description: 'Browse our comprehensive list of stain types and learn how to remove them from different materials.',
    url: window.location.origin + '/stains'
  });

  // Filter stains by category and search term
  const filteredStains = stains ? stains.filter(stain => {
    const matchesCategory = !categoryFilter || stain.category === categoryFilter;
    const matchesSearch = !searchTerm || 
      stain.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      stain.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }) : [];

  // Group stains by category for display
  const stainsByCategory = filteredStains.reduce((acc, stain) => {
    if (!acc[stain.category]) {
      acc[stain.category] = [];
    }
    acc[stain.category].push(stain);
    return acc;
  }, {} as Record<string, any[]>);

  // Category display names
  const categoryDisplayNames: Record<string, string> = {
    beverage: 'Beverages',
    food: 'Food',
    oil: 'Oil & Grease',
    ink: 'Ink & Paint',
    dirt: 'Dirt & Mud',
    grass: 'Grass & Plants',
    bodily_fluid: 'Blood & Bodily Fluids',
    makeup: 'Makeup & Cosmetics',
    other: 'Other Stains'
  };

  if (isLoading) {
    return <StainListSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Error Loading Stains</h1>
          <p className="text-slate-600">There was a problem loading the stain data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* SEO Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}></script>
      
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Stain Removal Guides</h1>
        <p className="text-slate-600 max-w-3xl mx-auto">
          Browse our comprehensive collection of stain removal guides. Find step-by-step instructions for removing any type of stain from any material.
        </p>
      </div>
      
      {/* Search Bar */}
      <div className="mb-10 max-w-md mx-auto">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search for a stain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
            <i className="ri-search-line"></i>
          </div>
          {searchTerm && (
            <Button
              onClick={() => setSearchTerm('')}
              variant="ghost"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto"
            >
              <i className="ri-close-line"></i>
            </Button>
          )}
        </div>
      </div>
      
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-10 justify-center">
        <Link href="/stains">
          <a className={`px-4 py-2 rounded-full text-sm font-medium ${!categoryFilter ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} transition-colors`}>
            All Stains
          </a>
        </Link>
        {Object.keys(categoryDisplayNames).map(category => (
          <Link key={category} href={`/stains?category=${category}`}>
            <a className={`px-4 py-2 rounded-full text-sm font-medium ${categoryFilter === category ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} transition-colors`}>
              {categoryDisplayNames[category]}
            </a>
          </Link>
        ))}
      </div>
      
      {/* No Results */}
      {filteredStains.length === 0 && (
        <div className="text-center py-10">
          <div className="text-5xl mb-4"><i className="ri-emotion-sad-line"></i></div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No stains found</h2>
          <p className="text-slate-600 mb-6">
            We couldn't find any stains matching your search criteria.
          </p>
          <Button onClick={() => {
            setSearchTerm('');
            window.history.pushState({}, '', '/stains');
          }}>
            Clear Filters
          </Button>
        </div>
      )}
      
      {/* Stains by Category */}
      {Object.keys(stainsByCategory).length > 0 && Object.keys(stainsByCategory).map(category => (
        <div key={category} className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">{categoryDisplayNames[category]}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stainsByCategory[category].map(stain => {
              const stainIcon = getStainIcon(stain.category);
              
              return (
                <Link key={stain.id} href={`/stains/${stain.name}`}>
                  <a className="bg-white rounded-lg border border-slate-200 p-5 hover:border-primary hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`h-10 w-10 rounded-full bg-${stain.color}/20 flex items-center justify-center flex-shrink-0`}>
                        <i className={`${stainIcon} text-${stain.color}`}></i>
                      </div>
                      <h3 className="font-bold text-slate-900">{stain.displayName}</h3>
                    </div>
                    <p className="text-sm text-slate-600">
                      {stain.description || `Learn how to remove ${stain.displayName.toLowerCase()} stains from various materials.`}
                    </p>
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton loader for the stain list page
const StainListSkeleton = () => (
  <div className="container mx-auto px-4 py-12">
    <div className="text-center mb-12">
      <Skeleton className="h-10 w-64 mx-auto mb-4" />
      <Skeleton className="h-4 w-full max-w-2xl mx-auto mb-1" />
      <Skeleton className="h-4 w-full max-w-xl mx-auto" />
    </div>
    
    <div className="mb-10 max-w-md mx-auto">
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
    
    <div className="flex flex-wrap gap-2 mb-10 justify-center">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <Skeleton key={`cat-${i}`} className="h-10 w-24 rounded-full" />
      ))}
    </div>
    
    <div className="mb-12">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <Skeleton key={`stain-${i}`} className="h-32 rounded-lg" />
        ))}
      </div>
    </div>
    
    <div className="mb-12">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={`stain2-${i}`} className="h-32 rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

export default StainList;
