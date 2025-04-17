import { useRef, useEffect } from 'react';

interface WarningsProps {
  warnings: string[];
}

const Warnings = ({ warnings }: WarningsProps) => {
  const warningBlockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add CSS rule for warning block animation
    const styleId = 'warnings-animation-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .warning-block-animate {
          animation: scaleIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          opacity: 0;
          transform: scale(0.95);
          animation-delay: 500ms;
        }
        
        @keyframes scaleIn {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Add animation class
    if (warningBlockRef.current) {
      warningBlockRef.current.classList.add('warning-block-animate');
    }

    // Clean up
    return () => {
      const style = document.getElementById(styleId);
      if (style) {
        document.head.removeChild(style);
      }
    };
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
