import { Link } from "wouter";
import { getStainIcon } from '@/lib/iconMap';
import { Link2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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

/**
 * Auto-links to other related stain removal guides
 * - Shows guides with either the same stain or the same material
 * - Groups by relevance (same stain first, then same material)
 * - Uses Shadcn Card component with hover and focus states
 */
const RelatedGuides = ({ guides }: RelatedGuidesProps) => {
  if (!guides || guides.length === 0) {
    return null;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="mb-12" id="related-guides">
      <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <Link2 className="h-5 w-5 text-primary" />
        Related Stain Guides
      </h2>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
      >
        {guides.map((guide, index) => {
          const stainIcon = getStainIcon(guide.stainCategory);
          
          return (
            <motion.div key={index} variants={item}>
              <Card className="h-full group transition-all duration-300 hover:shadow-md hover:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20">
                <CardHeader className="pb-2 flex flex-row items-start gap-3">
                  <div className={`h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110`}>
                    <span className="text-primary text-lg">{stainIcon}</span>
                  </div>
                  <div>
                    <CardTitle className="text-base transition-colors duration-200 group-hover:text-primary">
                      Removing {guide.stainName} from {guide.materialName}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {guide.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardFooter className="pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto group-hover:bg-primary/10 transition-all duration-200"
                    asChild
                  >
                    <Link href={`/remove/${guide.stainName}/${guide.materialName}`}>
                      <span className="flex items-center gap-1">
                        Read guide <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};

export default RelatedGuides;
