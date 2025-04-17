import { useRef, useEffect } from 'react';

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
    // Add CSS rule for supply item animations
    const styleId = 'supplies-animation-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .supply-item {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 0.3s ease-out forwards;
        }
        
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Apply staggered animations to supply items
    if (suppliesRef.current) {
      const items = Array.from(suppliesRef.current.children);
      items.forEach((item, index) => {
        (item as HTMLElement).style.animationDelay = `${index * 150}ms`;
      });
    }

    // Clean up
    return () => {
      const style = document.getElementById(styleId);
      if (style) {
        document.head.removeChild(style);
      }
    };
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
          <li key={index} className="supply-item flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
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
