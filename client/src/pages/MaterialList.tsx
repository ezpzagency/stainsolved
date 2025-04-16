import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { generateStructuredData } from "@/utils/SeoUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const MaterialList = () => {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const typeFilter = urlParams.get('type') || '';
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch all materials
  const { data: materials, isLoading, error } = useQuery({
    queryKey: ['/api/materials'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Generate structured data for SEO
  const structuredData = generateStructuredData({
    type: 'CollectionPage',
    name: 'Stain Removal Guide - Types of Materials',
    description: 'Browse our comprehensive list of material types and learn how to remove different stains from them.',
    url: window.location.origin + '/materials'
  });

  // Filter materials by type and search term
  const filteredMaterials = materials ? materials.filter(material => {
    const matchesType = !typeFilter || material.type === typeFilter;
    const matchesSearch = !searchTerm || 
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      material.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  }) : [];

  // Group materials by type for display
  const materialsByType = filteredMaterials.reduce((acc, material) => {
    if (!acc[material.type]) {
      acc[material.type] = [];
    }
    acc[material.type].push(material);
    return acc;
  }, {} as Record<string, any[]>);

  // Type display names
  const typeDisplayNames: Record<string, string> = {
    natural: 'Natural Fibers',
    synthetic: 'Synthetic Fibers',
    leather: 'Leather & Suede',
    upholstery: 'Upholstery',
    hard_surface: 'Hard Surfaces',
    other: 'Other Materials'
  };

  // Material icons
  const materialIcons: Record<string, string> = {
    natural: 'ri-t-shirt-line',
    synthetic: 'ri-t-shirt-air-line',
    leather: 'ri-handbag-line',
    upholstery: 'ri-sofa-line',
    hard_surface: 'ri-home-4-line',
    other: 'ri-file-list-line'
  };

  if (isLoading) {
    return <MaterialListSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Error Loading Materials</h1>
          <p className="text-slate-600">There was a problem loading the material data. Please try again later.</p>
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
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Materials Guide</h1>
        <p className="text-slate-600 max-w-3xl mx-auto">
          Browse our materials guide to find specific stain removal techniques for different fabrics and surfaces.
        </p>
      </div>
      
      {/* Search Bar */}
      <div className="mb-10 max-w-md mx-auto">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search for a material..."
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
      
      {/* Type Tabs */}
      <div className="flex flex-wrap gap-2 mb-10 justify-center">
        <Link href="/materials">
          <a className={`px-4 py-2 rounded-full text-sm font-medium ${!typeFilter ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} transition-colors`}>
            All Materials
          </a>
        </Link>
        {Object.keys(typeDisplayNames).map(type => (
          <Link key={type} href={`/materials?type=${type}`}>
            <a className={`px-4 py-2 rounded-full text-sm font-medium ${typeFilter === type ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} transition-colors`}>
              {typeDisplayNames[type]}
            </a>
          </Link>
        ))}
      </div>
      
      {/* No Results */}
      {filteredMaterials.length === 0 && (
        <div className="text-center py-10">
          <div className="text-5xl mb-4"><i className="ri-emotion-sad-line"></i></div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No materials found</h2>
          <p className="text-slate-600 mb-6">
            We couldn't find any materials matching your search criteria.
          </p>
          <Button onClick={() => {
            setSearchTerm('');
            window.history.pushState({}, '', '/materials');
          }}>
            Clear Filters
          </Button>
        </div>
      )}
      
      {/* Materials by Type */}
      {Object.keys(materialsByType).length > 0 && Object.keys(materialsByType).map(type => (
        <div key={type} className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">{typeDisplayNames[type]}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {materialsByType[type].map(material => (
              <Link key={material.id} href={`/materials/${material.name}`}>
                <a className="bg-white rounded-lg border border-slate-200 p-5 hover:border-primary hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <i className={`${materialIcons[type] || 'ri-file-list-line'} text-primary`}></i>
                    </div>
                    <h3 className="font-bold text-slate-900">{material.displayName}</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    {material.description || `Learn about the properties of ${material.displayName.toLowerCase()} and how to remove stains from it.`}
                  </p>
                </a>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton loader for the material list page
const MaterialListSkeleton = () => (
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
      {[1, 2, 3, 4, 5, 6].map(i => (
        <Skeleton key={`type-${i}`} className="h-10 w-24 rounded-full" />
      ))}
    </div>
    
    <div className="mb-12">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <Skeleton key={`material-${i}`} className="h-32 rounded-lg" />
        ))}
      </div>
    </div>
    
    <div className="mb-12">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={`material2-${i}`} className="h-32 rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

export default MaterialList;
