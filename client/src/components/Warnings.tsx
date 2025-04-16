import { useRef, useEffect } from 'react';
import { animate } from 'animejs';

interface WarningsProps {
  warnings: string[];
}

const Warnings = ({ warnings }: WarningsProps) => {
  const warningBlockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate warning block on component mount
    if (warningBlockRef.current) {
      animate(warningBlockRef.current, {
        scale: [0.95, 1],
        opacity: [0, 1],
        easing: 'easeOutElastic(1, .8)',
        duration: 800,
        delay: 500
      });
    }
  }, []);

  if (!warnings || warnings.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <i className="ri-error-warning-line text-yellow-500"></i>
        Important Warnings
      </h2>
      
      <div ref={warningBlockRef} className="bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded warning-block">
        <ul className="space-y-3">
          {warnings.map((warning, index) => (
            <li key={index} className="flex items-start gap-2">
              <i className="ri-alert-line text-yellow-500 mt-1 flex-shrink-0"></i>
              <p className="text-slate-700">{warning}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Warnings;
