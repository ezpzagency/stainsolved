import { useRef, useEffect } from 'react';
import { animate } from 'animejs';
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
          const target = entry.target;
          animate(target, {
            opacity: [0, 1],
            translateX: [-20, 0],
            easing: 'easeOutQuad',
            duration: 300
          });
        }
      });
    },
    threshold: 0.2,
    targetSelector: '.step'
  });

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
            className="step bg-white rounded-lg border border-slate-200 p-5 shadow-sm opacity-0"
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
