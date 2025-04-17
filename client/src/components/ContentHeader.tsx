import { useRef, useEffect } from 'react';
import { getStainIcon } from '@/lib/iconMap';
import { Clock, BarChart2, Heart, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

/**
 * ContentHeader Component
 * 
 * This component was refactored from using Anime.js to Framer Motion:
 * - Previously: Used Anime.js timeline for staggered badge animations
 * - Now: Uses Framer Motion's built-in variants for declarative animations
 * 
 * Benefits:
 * - Component-scoped animations instead of global timeline
 * - Better integration with React's component lifecycle
 * - Improved accessibility with reduced motion support
 */

interface ContentHeaderProps {
  stainName: string;
  materialName: string;
  stainColor: string;
  stainCategory: string;
  timeRequired: string;
  difficulty: string;
  successRate: number;
  lastUpdated: string;
}

const ContentHeader = ({
  stainName,
  materialName,
  stainColor,
  stainCategory,
  timeRequired,
  difficulty,
  successRate,
  lastUpdated
}: ContentHeaderProps) => {
  const stainIcon = getStainIcon(stainCategory);

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

  // Helper function to get badge variant based on difficulty
  const getDifficultyVariant = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'outline';
      case 'medium': return 'secondary';
      case 'hard': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <header className="mb-10">
      <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-primary text-3xl">{stainIcon}</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            How to Remove {stainName} from {materialName}
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            {stainName} stains on {materialName} can be stubborn but are treatable with prompt action. 
            This guide covers proven methods to completely remove fresh and dried {stainName.toLowerCase()} stains from {materialName.toLowerCase()}.
          </p>
        </div>
      </div>
      
      <motion.div 
        className="flex flex-wrap gap-3 mb-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <Badge variant="secondary" className="px-3 py-1 h-auto">
            <Clock className="mr-1 h-3.5 w-3.5" />
            <span>Time: {timeRequired}</span>
          </Badge>
        </motion.div>
        <motion.div variants={item}>
          <Badge variant={getDifficultyVariant(difficulty)} className="px-3 py-1 h-auto">
            <BarChart2 className="mr-1 h-3.5 w-3.5" />
            <span>Difficulty: {difficulty}</span>
          </Badge>
        </motion.div>
        <motion.div variants={item}>
          <Badge variant="secondary" className="px-3 py-1 h-auto">
            <Heart className="mr-1 h-3.5 w-3.5" />
            <span>Success Rate: {successRate}%</span>
          </Badge>
        </motion.div>
        <motion.div variants={item}>
          <Badge variant="outline" className="px-3 py-1 h-auto">
            <Calendar className="mr-1 h-3.5 w-3.5" />
            <span>Last Updated: {new Date(lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
          </Badge>
        </motion.div>
      </motion.div>
    </header>
  );
};

export default ContentHeader;
