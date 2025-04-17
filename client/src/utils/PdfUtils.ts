/**
 * Utility functions for generating PDF exports of stain removal guides
 * Uses html2canvas and jsPDF to generate printable "stain cards"
 */

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface PrintableGuideData {
  stainName: string;
  materialName: string;
  steps: Array<{
    title: string;
    description: string;
  }>;
  supplies: Array<{
    name: string;
    description: string;
  }>;
  warnings: string[];
}

/**
 * Generates a PDF from the printable section of the guide
 * @param guideData The guide data to include in the PDF
 */
export const generateStainCardPdf = async (
  guideData: PrintableGuideData,
  elementId: string = 'printable-guide'
): Promise<string | null> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return null;
  }

  try {
    // Use html2canvas to capture the element as an image
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });
    
    // Calculate dimensions - we want letter size (8.5 x 11 inches)
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'letter'
    });
    
    // Calculate the PDF dimensions (8.5 x 11 inches in pixels at 96 DPI)
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate the aspect ratio to fit the image within the PDF
    const canvasRatio = canvas.width / canvas.height;
    const pdfRatio = pdfWidth / pdfHeight;
    
    let imgWidth, imgHeight;
    
    if (canvasRatio > pdfRatio) {
      // Image is wider than PDF
      imgWidth = pdfWidth;
      imgHeight = pdfWidth / canvasRatio;
    } else {
      // Image is taller than PDF
      imgHeight = pdfHeight;
      imgWidth = pdfHeight * canvasRatio;
    }
    
    // Center the image on the page
    const xPosition = (pdfWidth - imgWidth) / 2;
    const yPosition = (pdfHeight - imgHeight) / 2;
    
    // Add the image to the PDF
    pdf.addImage(imgData, 'PNG', xPosition, yPosition, imgWidth, imgHeight);
    
    // Add filename metadata
    const filename = `stainsolver-${guideData.stainName.toLowerCase()}-${guideData.materialName.toLowerCase()}.pdf`;
    
    // Return the PDF as a data URL
    return pdf.output('dataurlstring');
  } catch (error) {
    console.error('Error generating PDF:', error);
    return null;
  }
};

/**
 * Triggers browser download of the generated PDF
 */
export const downloadStainCardPdf = async (
  guideData: PrintableGuideData,
  elementId: string = 'printable-guide'
): Promise<boolean> => {
  try {
    const pdfDataUrl = await generateStainCardPdf(guideData, elementId);
    if (!pdfDataUrl) return false;
    
    // Create a filename
    const filename = `stainsolver-${guideData.stainName.toLowerCase()}-${guideData.materialName.toLowerCase()}.pdf`;
    
    // Create an anchor element to trigger the download
    const link = document.createElement('a');
    link.href = pdfDataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error downloading PDF:', error);
    return false;
  }
};