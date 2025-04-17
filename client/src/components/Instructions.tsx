import { useRef } from 'react';
import { FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

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
    <section className="mb-12">
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
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex p-5">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0 mr-4">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Instructions;
