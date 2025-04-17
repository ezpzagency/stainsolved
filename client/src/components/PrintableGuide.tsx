import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { downloadStainCardPdf } from '@/utils/PdfUtils';

interface Step {
  title: string;
  description: string;
}

interface Supply {
  name: string;
  description: string;
}

interface PrintableGuideProps {
  stainName: string;
  materialName: string;
  steps: Step[];
  supplies: Supply[];
  warnings: string[];
  onlyPrintable?: boolean;
}

/**
 * PrintableGuide Component
 * 
 * Displays a printable/downloadable version of a stain removal guide
 * Contains only the essential information for quick reference
 */
const PrintableGuide: React.FC<PrintableGuideProps> = ({
  stainName,
  materialName,
  steps,
  supplies,
  warnings,
  onlyPrintable = false
}) => {
  const handlePrint = () => {
    window.print();
  };
  
  const handleDownload = async () => {
    const success = await downloadStainCardPdf({
      stainName,
      materialName,
      steps,
      supplies,
      warnings
    });
    
    if (success) {
      console.log('PDF downloaded successfully');
    } else {
      console.error('Failed to download PDF');
    }
  };
  
  const printableContent = (
    <div id="printable-guide" className="bg-white p-6 rounded-lg shadow-sm print:shadow-none">
      <div className="text-center mb-4 border-b pb-4">
        <h2 className="text-2xl font-bold text-primary">Stain Removal Card</h2>
        <h3 className="text-xl font-semibold mt-2">
          {stainName} on {materialName}
        </h3>
      </div>
      
      {/* Supplies Section */}
      <div className="mb-4">
        <h4 className="font-bold text-lg border-b pb-1 mb-2">What You'll Need</h4>
        <ul className="list-disc pl-5 space-y-1">
          {supplies.slice(0, 5).map((supply, index) => (
            <li key={`print-supply-${index}`} className="text-sm">
              <span className="font-medium">{supply.name}</span>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Steps Section */}
      <div className="mb-4">
        <h4 className="font-bold text-lg border-b pb-1 mb-2">Steps</h4>
        <ol className="list-decimal pl-5 space-y-2">
          {steps.map((step, index) => (
            <li key={`print-step-${index}`} className="text-sm">
              <span className="font-medium">{step.title}:</span> {step.description}
            </li>
          ))}
        </ol>
      </div>
      
      {/* Warnings Section */}
      {warnings.length > 0 && (
        <div className="mb-2">
          <h4 className="font-bold text-lg border-b pb-1 mb-2">Important Warnings</h4>
          <ul className="list-disc pl-5 space-y-1">
            {warnings.slice(0, 3).map((warning, index) => (
              <li key={`print-warning-${index}`} className="text-sm text-red-600">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="text-center text-xs text-gray-500 mt-4 pt-2 border-t">
        <p>StainSolver.com - The Ultimate Stain Removal Resource</p>
        <p>This card was generated on {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
  
  if (onlyPrintable) {
    return printableContent;
  }
  
  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center">
          <span>Stain Removal Card</span>
          <div className="flex space-x-2">
            <Button 
              onClick={handlePrint} 
              size="sm" 
              variant="outline"
              className="flex items-center gap-1"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button 
              onClick={handleDownload} 
              size="sm" 
              variant="default"
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Get a printable version of this stain removal guide to keep handy for future reference.
        </p>
        {printableContent}
      </CardContent>
    </Card>
  );
};

export default PrintableGuide;