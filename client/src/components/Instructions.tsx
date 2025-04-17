import { useRef, useEffect } from 'react';
import { useIntersectionObserver } from '@/utils/AnimationUtils';

interface Step {
  title: string;
  description: string;
}

interface InstructionsProps {
  steps: Step[];
}

const Instructions = ({ steps }: InstructionsProps) => {
  const instructionsRef = useRef<HTMLDivElement>(null);

  // Set up intersection observer for step animation
  useIntersectionObserver({
    ref: instructionsRef,
    onIntersect: (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show-step');
        }
      });
    },
    threshold: 0.2,
    targetSelector: '.step'
  });

  // Add CSS rule for animation
  useEffect(() => {
    // Create style element if it doesn't exist
    const styleId = 'instructions-animation-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .show-step {
          opacity: 1 !important;
          transform: translateX(0) !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Clean up
    return () => {
      const style = document.getElementById(styleId);
      if (style) {
        document.head.removeChild(style);
      }
    };
  }, []);

  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <i className="ri-file-list-3-line text-primary"></i>
        Step-by-Step Instructions
      </h2>
      
      <div ref={instructionsRef} className="space-y-6">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className="step bg-white rounded-lg border border-slate-200 p-5 shadow-sm opacity-0 transform -translate-x-5 transition-all duration-300 ease-out"
          >
            <div className="flex">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mr-4">
                {index + 1}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-700 leading-relaxed">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Instructions;
