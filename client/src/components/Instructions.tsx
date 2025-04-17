import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="h-8 w-8 p-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    {index + 1}
                  </Badge>
                  <CardTitle className="text-base">{step.title}</CardTitle>
                </div>
              </CardHeader>
              <Separator className="mb-2" />
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
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
