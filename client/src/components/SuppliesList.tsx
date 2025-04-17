import { CheckCircle, ShoppingCart, Beaker, Droplets, Dumbbell, Feather, FlaskConical, SprayCan } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * SuppliesList Component
 * 
 * Displays a list of supplies needed for stain removal
 * - Uses varied icons based on supply type
 * - Includes staggered fade-in animation
 * - Proper semantic HTML with accessible hover states
 * - Responsive layout that works on all device sizes
 */

interface Supply {
  name: string;
  description: string;
}

interface SuppliesListProps {
  supplies: Supply[];
}

const SuppliesList = ({ supplies }: SuppliesListProps) => {
  if (!supplies || supplies.length === 0) {
    return null;
  }

  // Mapping of common supply keywords to specific icons
  const getSupplyIcon = (supplyName: string) => {
    const name = supplyName.toLowerCase();
    if (name.includes('spray') || name.includes('sprayer')) return SprayCan;
    if (name.includes('solution') || name.includes('detergent')) return Beaker;
    if (name.includes('water') || name.includes('liquid')) return Droplets;
    if (name.includes('cloth') || name.includes('brush')) return Dumbbell;
    if (name.includes('vinegar') || name.includes('chemical')) return FlaskConical;
    if (name.includes('remover') || name.includes('agent')) return Feather;
    return CheckCircle; // default icon
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -10, y: 10 },
    show: { 
      opacity: 1, 
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.3
      }
    }
  };

  return (
    <section className="mb-12 scroll-mt-20" id="supplies">
      <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-primary" />
        Supplies You'll Need
      </h2>
      
      <motion.div 
        className="space-y-3"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
      >
        {supplies.map((supply, index) => {
          const SupplyIcon = getSupplyIcon(supply.name);
          
          return (
            <motion.div 
              key={index} 
              variants={item}
              className="group"
              whileHover={{ x: 3, transition: { duration: 0.2 } }}
            >
              <Card className="transition-all duration-200 hover:shadow-md hover:border-primary/50 focus-within:border-primary/50 focus-within:shadow-md">
                <CardContent className="p-4 flex items-start gap-3">
                  <Badge 
                    variant="outline" 
                    className="p-1 bg-primary/10 border-0 transition-all duration-150 group-hover:scale-110 group-hover:bg-primary/20"
                  >
                    <SupplyIcon className="h-5 w-5 text-primary" />
                  </Badge>
                  <div>
                    <h3 className="font-medium text-card-foreground group-hover:text-primary transition-colors duration-200">
                      {supply.name}
                    </h3>
                    <p className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-200">
                      {supply.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};

export default SuppliesList;