import { useRef, useEffect } from 'react';

interface EffectivenessData {
  rating: number;
  description: string;
  freshStains: number;
  oldStains: number;
  setInStains: number;
}

interface EffectivenessProps {
  data: EffectivenessData;
}

const Effectiveness = ({ data }: EffectivenessProps) => {
  if (!data) {
    return null;
  }

  const { rating, description, freshStains, oldStains, setInStains } = data;
  
  // Generate stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="ri-star-fill text-yellow-400"></i>);
    }
    
    if (hasHalfStar) {
      stars.push(<i key="half" className="ri-star-half-fill text-yellow-400"></i>);
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="ri-star-line text-yellow-400"></i>);
    }
    
    return stars;
  };

  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <i className="ri-bar-chart-2-line text-primary"></i>
        Effectiveness & Results
      </h2>
      
      <div className="bg-white rounded-lg border border-slate-200 p-5 mb-5">
        <div className="flex items-center mb-3">
          <div className="text-lg font-semibold">Success Rate:</div>
          <div className="ml-auto flex items-center">
            <div className="flex">
              {renderStars(rating)}
            </div>
            <span className="ml-2 font-medium">{rating}/5</span>
          </div>
        </div>
        <p className="text-slate-700 mb-4">{description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-3 rounded">
            <h4 className="font-medium text-slate-900 mb-1">Fresh Stains</h4>
            <div className="flex items-center">
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${freshStains}%` }}></div>
              </div>
              <span className="ml-2 text-sm font-medium">{freshStains}%</span>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded">
            <h4 className="font-medium text-slate-900 mb-1">Old Stains (1-3 days)</h4>
            <div className="flex items-center">
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${oldStains}%` }}></div>
              </div>
              <span className="ml-2 text-sm font-medium">{oldStains}%</span>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded">
            <h4 className="font-medium text-slate-900 mb-1">Set-in Stains ({'>'}1 week)</h4>
            <div className="flex items-center">
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div 
                  className={`${setInStains > 70 ? 'bg-green-500' : 'bg-yellow-500'} h-2.5 rounded-full`} 
                  style={{ width: `${setInStains}%` }}
                ></div>
              </div>
              <span className="ml-2 text-sm font-medium">{setInStains}%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Effectiveness;
