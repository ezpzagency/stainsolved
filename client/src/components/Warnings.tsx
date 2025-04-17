import { AlertTriangle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

/**
 * Warnings Component
 * 
 * Refactoring summary:
 * - Previously: Custom alert UI with Anime.js animations
 * - Now: Shadcn Alert components with Framer Motion for container animations
 * 
 * UI improvements:
 * - Standardized alert design using Shadcn UI components
 * - Proper semantic HTML structure with appropriate ARIA roles
 * - Visual hierarchy with card container and alert items
 * - Interactive hover states to highlight important warnings
 * - Subtle entrance animation for better attention-drawing
 */

interface WarningsProps {
  warnings: string[];
}

const Warnings = ({ warnings }: WarningsProps) => {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  return (
    <section className="mb-12" id="warnings">
      <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        Important Warnings
      </h2>
      
      <Card className="border-destructive/20 transition-all duration-300 hover:shadow-md">
        <CardHeader className="pb-2">
          <AlertTitle className="text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 animate-pulse" />
            Before You Begin
          </AlertTitle>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.5,
              delay: 0.2,
              ease: "easeOut"
            }}
            viewport={{ once: true }}
          >
            {warnings.map((warning, index) => (
              <Alert 
                key={index} 
                variant="destructive" 
                className="border-l-4 transition-all duration-200 hover:bg-destructive/10 hover:border-l-[6px] group"
              >
                <AlertCircle className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                <AlertDescription className="ml-2 transition-colors duration-200">
                  {warning}
                </AlertDescription>
              </Alert>
            ))}
          </motion.div>
        </CardContent>
      </Card>
      {/* Prefers-reduced-motion is handled in global CSS */}
    </section>
  );
};

export default Warnings;
