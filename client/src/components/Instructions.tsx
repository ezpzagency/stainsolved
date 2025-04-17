import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

/**
 * Instructions Component
 * 
 * Migration from Anime.js to Framer Motion:
 * - Previously: Used Anime.js for sequential step animations with scroll triggers
 * - Now: Uses Framer Motion with viewport-based animations
 * 
 * Key improvements:
 * - Declarative animation approach using variants
 * - Leverages Intersection Observer via whileInView for scroll-based animations
 * - Improved performance by only animating when component is in viewport
 * - Better accessibility with reduced motion support
 */

interface Step {
  title: string;
  description: string;
}

interface InstructionsProps {
  steps: Step[];
}

const Instructions = ({ steps }: InstructionsProps) => {
  if (!steps || steps.length === 0) {
    return null;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="mb-12" id="instructions">
      <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        Step-by-Step Instructions
      </h2>
      
      <motion.div 
        className="space-y-6"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
      >
        {steps.map((step, index) => (
          <motion.div key={index} variants={item}>
            <Card className="group transition-all duration-200 hover:shadow-md hover:border-primary/30 focus-within:border-primary/30 focus-within:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant="outline" 
                    className="h-8 w-8 p-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold transition-all duration-200 group-hover:scale-110 group-hover:bg-primary/90 group-focus-within:scale-110"
                  >
                    {index + 1}
                  </Badge>
                  <CardTitle className="text-base transition-colors duration-200 group-hover:text-primary/90">{step.title}</CardTitle>
                </div>
              </CardHeader>
              <Separator className="mb-2 transition-colors duration-200 group-hover:bg-primary/20" />
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed transition-colors duration-200 group-hover:text-muted-foreground/90">
                  {step.description}
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Instructions;
