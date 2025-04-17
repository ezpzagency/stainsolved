import { AlertTriangle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface WarningsProps {
  warnings: string[];
}

const Warnings = ({ warnings }: WarningsProps) => {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        Important Warnings
      </h2>
      
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.5,
          delay: 0.2,
          ease: "easeOut"
        }}
        viewport={{ once: true }}
      >
        {warnings.map((warning, index) => (
          <Alert key={index} variant="destructive" className="border-l-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              {warning}
            </AlertDescription>
          </Alert>
        ))}
      </motion.div>
    </section>
  );
};

export default Warnings;
