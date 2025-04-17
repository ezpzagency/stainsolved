import { BarChart2, Star, StarHalf } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
      stars.push(<Star key={`full-${i}`} className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-5 w-5 text-yellow-400" />);
    }
    
    return stars;
  };

  return (
    <section className="mb-12" id="effectiveness">
      <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <BarChart2 className="h-5 w-5 text-primary" />
        Effectiveness & Results
      </h2>
      
      <Card className="transition-all duration-300 hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-lg">Success Rate</CardTitle>
            <div className="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
              <div className="flex">
                {renderStars(rating)}
              </div>
              <Badge variant="outline" className="font-medium text-foreground">
                {rating}/5
              </Badge>
            </div>
          </div>
          <CardDescription>
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 group/progress transition-all duration-200 hover:bg-secondary/30 rounded-lg p-2 -m-2">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-sm">Fresh Stains</h4>
                <span className="text-sm font-medium transition-all duration-200 group-hover/progress:font-bold">{freshStains}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full ${freshStains > 70 ? "bg-green-500" : "bg-yellow-500"} transition-all duration-500 ease-in-out group-hover/progress:brightness-110`}
                  style={{ width: `${freshStains}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2 group/progress transition-all duration-200 hover:bg-secondary/30 rounded-lg p-2 -m-2">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-sm">Old Stains (1-3 days)</h4>
                <span className="text-sm font-medium transition-all duration-200 group-hover/progress:font-bold">{oldStains}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full ${oldStains > 70 ? "bg-green-500" : "bg-yellow-500"} transition-all duration-500 ease-in-out group-hover/progress:brightness-110`}
                  style={{ width: `${oldStains}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2 group/progress transition-all duration-200 hover:bg-secondary/30 rounded-lg p-2 -m-2">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-sm">Set-in Stains ({'>'}1 week)</h4>
                <span className="text-sm font-medium transition-all duration-200 group-hover/progress:font-bold">{setInStains}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full ${setInStains > 70 ? "bg-green-500" : "bg-yellow-500"} transition-all duration-500 ease-in-out group-hover/progress:brightness-110`}
                  style={{ width: `${setInStains}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default Effectiveness;
