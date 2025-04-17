import { useState, useRef, useEffect } from 'react';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQProps {
  faqs: FAQ[];
}

const FAQ = ({ faqs }: FAQProps) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const answerRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const toggleFaq = (index: number) => {
    if (openFaq === index) {
      // Close current FAQ
      setOpenFaq(null);
    } else {
      // Open new FAQ
      setOpenFaq(index);
    }
  };

  useEffect(() => {
    // Reset heights on window resize
    const handleResize = () => {
      if (openFaq !== null) {
        const answerElement = answerRefs.current.get(openFaq);
        if (answerElement) {
          answerElement.style.maxHeight = `${answerElement.scrollHeight}px`;
        }
      }
    };

    // Set initial maxHeight when an FAQ is opened
    if (openFaq !== null) {
      const answerElement = answerRefs.current.get(openFaq);
      if (answerElement) {
        answerElement.style.maxHeight = `${answerElement.scrollHeight}px`;
      }
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [openFaq]);

  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <i className="ri-questionnaire-line text-primary"></i>
        Frequently Asked Questions
      </h2>
      
      <div className="space-y-3 faq-container">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white rounded-lg border border-slate-200 overflow-hidden faq-item">
            <button 
              className="w-full text-left p-4 font-medium text-slate-900 flex justify-between items-center faq-button"
              onClick={() => toggleFaq(index)}
              aria-expanded={openFaq === index}
              aria-controls={`faq-answer-${index}`}
            >
              <span>{faq.question}</span>
              <i className={`${openFaq === index ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} text-slate-400 transition-transform duration-200`}></i>
            </button>
            <div 
              ref={el => el && answerRefs.current.set(index, el)}
              id={`faq-answer-${index}`}
              className="faq-answer px-4 pb-4 transition-all duration-300 ease-in-out"
              style={{ 
                maxHeight: openFaq === index ? '1000px' : '0', 
                opacity: openFaq === index ? 1 : 0,
                overflow: 'hidden'
              }}
            >
              <p className="text-slate-700">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
