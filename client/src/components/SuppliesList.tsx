import { CheckCircle, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <section className="mb-12">
      <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-primary" />
        Supplies You'll Need
      </h2>
      
      <motion.ul 
        className="space-y-3"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
      >
        {supplies.map((supply, index) => (
          <motion.li 
            key={index} 
            variants={item}
            className="flex items-start gap-3 p-4 bg-card rounded-lg border shadow-sm"
          >
            <div className="mt-0.5">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-card-foreground">{supply.name}</h3>
              <p className="text-sm text-muted-foreground">{supply.description}</p>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
};

export default SuppliesList;
