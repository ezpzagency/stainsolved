import { useRef, useEffect } from 'react';
import { getStainIcon } from '@/lib/iconMap';

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
  const infoTagsRef = useRef<HTMLDivElement>(null);
  const stainIcon = getStainIcon(stainCategory);

  useEffect(() => {
    // Add CSS rule for tag animations
    const styleId = 'header-animation-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .info-tag {
          opacity: 0;
          transform: translateX(20px);
          animation: slideIn 0.4s ease-out forwards;
        }
        
        @keyframes slideIn {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Apply staggered animations to info tags
    if (infoTagsRef.current) {
      const tags = Array.from(infoTagsRef.current.children);
      tags.forEach((tag, index) => {
        (tag as HTMLElement).style.animationDelay = `${index * 100}ms`;
      });
    }

    // Clean up
    return () => {
      const style = document.getElementById(styleId);
      if (style) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <header className="mb-10">
      <div className="flex items-start gap-4 mb-6">
        <div className={`h-14 w-14 rounded-full bg-${stainColor}/20 flex items-center justify-center flex-shrink-0`}>
          <i className={`${stainIcon} text-${stainColor} text-2xl`}></i>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">How to Remove {stainName} from {materialName}</h1>
          <p className="text-slate-600 max-w-3xl">
            {stainName} stains on {materialName} can be stubborn but are treatable with prompt action. 
            This guide covers proven methods to completely remove fresh and dried {stainName.toLowerCase()} stains from {materialName.toLowerCase()}.
          </p>
        </div>
      </div>
      
      <div ref={infoTagsRef} className="flex flex-wrap gap-3 mb-6 info-tags">
        <div className="info-tag px-3 py-1 rounded-full bg-slate-100 text-sm flex items-center gap-1">
          <i className="ri-timer-line"></i>
          <span>Time: {timeRequired}</span>
        </div>
        <div className="info-tag px-3 py-1 rounded-full bg-slate-100 text-sm flex items-center gap-1">
          <i className="ri-bar-chart-line"></i>
          <span>Difficulty: {difficulty}</span>
        </div>
        <div className="info-tag px-3 py-1 rounded-full bg-slate-100 text-sm flex items-center gap-1">
          <i className="ri-heart-line"></i>
          <span>Success Rate: {successRate}%</span>
        </div>
        <div className="info-tag px-3 py-1 rounded-full bg-slate-100 text-sm flex items-center gap-1">
          <i className="ri-calendar-check-line"></i>
          <span>Last Updated: {new Date(lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
        </div>
      </div>
    </header>
  );
};

export default ContentHeader;
