import { AlertTriangle, AlertCircle, ShieldAlert, Info, XOctagon, Siren } from 'lucide-react';
import { motion } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
 * - Added varied warning formats and tones based on index
 */

interface WarningsProps {
  warnings: string[];
}

const Warnings = ({ warnings }: WarningsProps) => {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  // Different title variations to rotate through
  const titleVariants = [
    { text: "Before You Begin", icon: AlertCircle },
    { text: "Safety Precautions", icon: ShieldAlert },
    { text: "Important Notes", icon: Info }
  ];
  
  // Select a title variant based on warnings length for consistency
  const titleVariant = titleVariants[warnings.length % titleVariants.length];
  const TitleIcon = titleVariant.icon;

  // Different warning callout styles
  const getWarningStyle = (index: number) => {
    // Rotate through 3 different styles
    switch (index % 3) {
      case 0: // Standard style
        return {
          variant: "destructive" as const,
          icon: AlertCircle,
          className: "border-l-4 transition-all duration-200 hover:bg-destructive/10 hover:border-l-[6px] group"
        };
      case 1: // Badge style
        return {
          variant: "default" as const,
          icon: XOctagon,
          className: "border border-destructive/30 bg-destructive/5 transition-all duration-200 hover:bg-destructive/10 group"
        };
      case 2: // Outline style - using default variant with custom styling
        return {
          variant: "default" as const,
          icon: Siren,
          className: "border-dashed border-destructive/40 transition-all duration-200 hover:border-destructive/70 hover:bg-destructive/5 group"
        };
      default:
        return {
          variant: "destructive" as const,
          icon: AlertCircle,
          className: "border-l-4 transition-all duration-200 hover:bg-destructive/10 hover:border-l-[6px] group"
        };
    }
  };

  // Different warning tone modifiers
  const getWarningTone = (index: number, warning: string) => {
    // If warning already has strong tone indicators, return as is
    if (warning.includes("Never") || warning.includes("Always") || 
        warning.includes("must") || warning.includes("essential")) {
      return warning;
    }
    
    // Add tone variation based on index
    switch (index % 4) {
      case 0: // Imperative/direct tone
        return `Important: ${warning}`;
      case 1: // Safety-focused tone
        return `Safety alert: ${warning}`;
      case 2: // Result-focused tone
        return `To avoid damage: ${warning}`;
      case 3: // Standard tone (no modifier)
        return warning;
      default:
        return warning;
    }
  };

  return (
    <section className="mb-12" id="warnings">
      <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        Important Warnings
      </h2>
      
      <Card className="border-destructive/20 transition-all duration-300 hover:shadow-md">
        <CardHeader className="pb-2">
          <AlertTitle className="text-destructive flex items-center gap-2">
            <TitleIcon className="h-4 w-4 animate-pulse" />
            {titleVariant.text}
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
            {warnings.map((warning, index) => {
              const style = getWarningStyle(index);
              const WarningIcon = style.icon;
              const formattedWarning = getWarningTone(index, warning);
              
              return (
                <Alert 
                  key={index} 
                  variant={style.variant} 
                  className={style.className}
                >
                  <WarningIcon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  <AlertDescription className="ml-2 transition-colors duration-200">
                    {index % 3 === 1 && (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive mr-2 mb-1">
                        Caution
                      </Badge>
                    )}
                    {formattedWarning}
                  </AlertDescription>
                </Alert>
              );
            })}
          </motion.div>
        </CardContent>
      </Card>
      {/* Prefers-reduced-motion is handled in global CSS */}
    </section>
  );
};

export default Warnings;
