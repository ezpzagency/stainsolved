import { Link } from "wouter";
import { getStainIcon } from '@/lib/iconMap';

interface RelatedGuide {
  stainId: number;
  materialId: number;
  stainName: string;
  materialName: string;
  stainColor: string;
  stainCategory: string;
  description: string;
}

interface RelatedGuidesProps {
  guides: RelatedGuide[];
}

const RelatedGuides = ({ guides }: RelatedGuidesProps) => {
  if (!guides || guides.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <i className="ri-links-line text-primary"></i>
        Related Stain Guides
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guides.map((guide, index) => {
          const stainIcon = getStainIcon(guide.stainCategory);
          
          return (
            <Link 
              key={index} 
              href={`/remove/${guide.stainName}/${guide.materialName}`}
              className="bg-white rounded-lg border border-slate-200 p-4 flex items-start gap-3 hover:border-primary hover:shadow-md transition-all"
            >
              <div className={`h-10 w-10 rounded-full bg-${guide.stainColor}/20 flex items-center justify-center flex-shrink-0`}>
                <i className={`${stainIcon} text-${guide.stainColor}`}></i>
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Removing {guide.stainName} from {guide.materialName}</h3>
                <p className="text-sm text-slate-600">{guide.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedGuides;
