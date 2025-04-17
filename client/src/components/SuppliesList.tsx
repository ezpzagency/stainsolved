import { CheckCircle, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="mb-12" id="supplies">
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
        {supplies.map((supply, index) => (
          <motion.div 
            key={index} 
            variants={item}
          >
            <Card>
              <CardContent className="p-4 flex items-start gap-3">
                <Badge variant="outline" className="p-1 bg-primary/10 border-0">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </Badge>
                <div>
                  <h3 className="font-medium text-card-foreground">{supply.name}</h3>
                  <p className="text-sm text-muted-foreground">{supply.description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default SuppliesList;
