import { useRef, useEffect } from 'react';
import { animate, stagger } from 'animejs';

interface Supply {
  name: string;
  description: string;
}

interface SuppliesListProps {
  supplies: Supply[];
}

const SuppliesList = ({ supplies }: SuppliesListProps) => {
  const suppliesRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    // Animate supplies list on component mount
    if (suppliesRef.current) {
      animate(suppliesRef.current.children, {
        opacity: [0, 1],
        translateY: [20, 0],
        easing: 'easeOutQuad',
        duration: 300,
        delay: stagger(150)
      });
    }
  }, [supplies]);

  if (!supplies || supplies.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <i className="ri-list-check text-primary"></i>
        Supplies You'll Need
      </h2>
      <ul ref={suppliesRef} className="space-y-3 supply-items">
        {supplies.map((supply, index) => (
          <li key={index} className="supply-item flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-sm opacity-0">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <i className="ri-check-line text-primary"></i>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">{supply.name}</h3>
              <p className="text-sm text-slate-600">{supply.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SuppliesList;
