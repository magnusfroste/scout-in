import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export type ExportFormat = 'pdf' | 'json';
export type AccordionExpansion = 'collapsed' | 'expanded';

// Get export format from settings (localStorage for now)
export const getExportFormat = (): ExportFormat => {
  return (localStorage.getItem('exportFormat') as ExportFormat) || 'pdf';
};

// Save export format to settings
export const setExportFormat = (format: ExportFormat) => {
  localStorage.setItem('exportFormat', format);
};

// Get accordion expansion preference from settings
export const getAccordionExpanded = (): AccordionExpansion => {
  return (localStorage.getItem('accordionExpanded') as AccordionExpansion) || 'collapsed';
};

// Save accordion expansion preference to settings
export const setAccordionExpanded = (expansion: AccordionExpansion) => {
  localStorage.setItem('accordionExpanded', expansion);
};

// PDF Export utility for research results
export const exportResearchToPDF = async (research: any): Promise<void> => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Helper function to add text with automatic line wrapping
    const addWrappedText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
      pdf.setFontSize(fontSize);
      if (isBold) {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      
      const lines = pdf.splitTextToSize(text, pageWidth - (margin * 2));
      
      // Check if we need a new page
      if (yPosition + (lines.length * fontSize * 0.4) > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.text(lines, margin, yPosition);
      yPosition += lines.length * fontSize * 0.4 + 5;
      
      return yPosition;
    };

    // Header
    addWrappedText(`Research Analysis Report`, 18, true);
    addWrappedText(`Company: ${research.prospect_company_name}`, 14, true);
    addWrappedText(`Generated: ${new Date().toLocaleDateString()}`, 10);
    yPosition += 10;

    // Fit Score
    if (research.fit_score !== null) {
      addWrappedText(`Fit Score: ${research.fit_score}/100`, 14, true);
      yPosition += 5;
    }

    // Executive Summary
    if (research.research_results?.executive_summary) {
      addWrappedText('Executive Summary', 16, true);
      const summary = typeof research.research_results.executive_summary === 'string' 
        ? research.research_results.executive_summary 
        : research.research_results.executive_summary.summary;
      addWrappedText(summary, 11);
      yPosition += 10;
    }

    // Strategic Fit Analysis
    if (research.research_results?.strategic_fit_relevance_analysis) {
      addWrappedText('Strategic Fit & Relevance Analysis', 16, true);
      Object.entries(research.research_results.strategic_fit_relevance_analysis).forEach(([key, value]) => {
        addWrappedText(`${key.replace(/_/g, ' ')}:`, 12, true);
        addWrappedText(value as string, 11);
        yPosition += 5;
      });
      yPosition += 10;
    }

    // Organization Analysis
    if (research.research_results?.organization_decision_making_structure) {
      addWrappedText('Organization & Decision Making Structure', 16, true);
      Object.entries(research.research_results.organization_decision_making_structure).forEach(([key, value]) => {
        addWrappedText(`${key.replace(/_/g, ' ')}:`, 12, true);
        addWrappedText(value as string, 11);
        yPosition += 5;
      });
      yPosition += 10;
    }

    // Technology Profile
    if (research.research_results?.technology_innovation_profile) {
      addWrappedText('Technology & Innovation Profile', 16, true);
      Object.entries(research.research_results.technology_innovation_profile).forEach(([key, value]) => {
        addWrappedText(`${key.replace(/_/g, ' ')}:`, 12, true);
        addWrappedText(value as string, 11);
        yPosition += 5;
      });
      yPosition += 10;
    }

    // Contact Strategy
    if (research.research_results?.contact_strategy_approach) {
      addWrappedText('Contact Strategy & Approach', 16, true);
      Object.entries(research.research_results.contact_strategy_approach).forEach(([key, value]) => {
        addWrappedText(`${key.replace(/_/g, ' ')}:`, 12, true);
        addWrappedText(value as string, 11);
        yPosition += 5;
      });
      yPosition += 10;
    }

    // Personalized Outreach
    if (research.research_results?.personalized_outreach_recommendations) {
      addWrappedText('Personalized Outreach Recommendations', 16, true);
      Object.entries(research.research_results.personalized_outreach_recommendations).forEach(([key, value]) => {
        addWrappedText(`${key.replace(/_/g, ' ')}:`, 12, true);
        addWrappedText(value as string, 11);
        yPosition += 5;
      });
    }

    // Save the PDF
    const fileName = `${research.prospect_company_name.replace(/\s+/g, '_')}_analysis.pdf`;
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// PDF Export utility for evaluation results
export const exportEvaluationResultsToPDF = async (results: any[]): Promise<void> => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Helper function to add text with automatic line wrapping
    const addWrappedText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
      pdf.setFontSize(fontSize);
      if (isBold) {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      
      const lines = pdf.splitTextToSize(text, pageWidth - (margin * 2));
      
      // Check if we need a new page
      if (yPosition + (lines.length * fontSize * 0.4) > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.text(lines, margin, yPosition);
      yPosition += lines.length * fontSize * 0.4 + 5;
      
      return yPosition;
    };

    // Header
    addWrappedText(`Prompt Evaluation Results`, 18, true);
    addWrappedText(`Generated: ${new Date().toLocaleDateString()}`, 10);
    addWrappedText(`Total Evaluations: ${results.length}`, 12);
    yPosition += 10;

    // Process each result
    results.forEach((result, index) => {
      // Result header
      addWrappedText(`Evaluation ${index + 1}`, 16, true);
      addWrappedText(`Company: ${result.request.companyName}`, 12, true);
      addWrappedText(`Status: ${result.success ? 'Success' : 'Failed'}`, 12);
      addWrappedText(`Timestamp: ${result.timestamp.toLocaleString()}`, 10);
      yPosition += 5;

      // Response content
      if (result.success && result.response) {
        addWrappedText('AI Analysis Report:', 14, true);
        const formattedResponse = typeof result.response === 'string' 
          ? result.response 
          : Array.isArray(result.response) && result.response[0]?.text
            ? result.response[0].text
            : JSON.stringify(result.response, null, 2);
        addWrappedText(formattedResponse, 10);
        yPosition += 10;
      }

      // Error message if failed
      if (!result.success && result.error) {
        addWrappedText('Error:', 12, true);
        addWrappedText(result.error, 10);
        yPosition += 10;
      }

      // Request details
      addWrappedText('Request Parameters:', 12, true);
      addWrappedText(`Company URL: ${result.request.companyUrl || 'N/A'}`, 10);
      addWrappedText(`LinkedIn: ${result.request.linkedinUrl || 'N/A'}`, 10);
      yPosition += 5;

      // User prompt
      addWrappedText('User Prompt:', 12, true);
      addWrappedText(result.request.userPrompt, 10);
      yPosition += 10;

      // Add separator if not last result
      if (index < results.length - 1) {
        yPosition += 5;
        addWrappedText('---', 12);
        yPosition += 5;
      }
    });

    // Save the PDF
    const fileName = `prompt-evaluation-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// JSON Export utility
export const exportToJSON = (data: any, filename: string): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};