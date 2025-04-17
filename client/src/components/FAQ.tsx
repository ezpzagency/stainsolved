import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

/**
 * FAQ Component
 * 
 * Migration details:
 * - Previously: Custom accordion with Anime.js for expand/collapse animations
 * - Now: Shadcn Accordion component with built-in animations
 * 
 * Benefits:
 * - Accessible accordion implementation with keyboard navigation
 * - ARIA compliant component with proper roles and attributes
 * - Smooth animations with CSS transitions instead of JavaScript
 * - Responsive interaction pattern that works on all devices
 */

interface FAQ {
  question: string;
  answer: string;
}

interface FAQProps {
  faqs: FAQ[];
}

const FAQ = ({ faqs }: FAQProps) => {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <section className="mb-10" id="faq">
      <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-primary" />
        Frequently Asked Questions
      </h2>
      
      <Card className="hover:shadow-sm transition-all duration-300">
        <CardContent className="p-4 pt-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`} 
                className="border-b last:border-0 group/item transition-colors duration-200"
              >
                <AccordionTrigger 
                  className="text-left font-medium transition-colors duration-200 
                    hover:text-primary hover:no-underline py-4
                    data-[state=open]:text-primary data-[state=open]:font-semibold"
                >
                  <span className="group-hover/item:translate-x-1 transition-transform duration-200">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 transition-opacity duration-300">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </section>
  );
};

export default FAQ;
