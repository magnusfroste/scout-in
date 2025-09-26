import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export type ExportFormat = "pdf" | "json";
export type ResearchDisplayStyle = "compact" | "detailed" | "spacious";

// User preferences
export const getExportFormat = (): ExportFormat => {
  const saved = localStorage.getItem('exportFormat');
  return (saved as ExportFormat) || 'pdf';
};

export const setExportFormat = (format: ExportFormat): void => {
  localStorage.setItem('exportFormat', format);
};

export const getResearchDisplayStyle = (): ResearchDisplayStyle => {
  const saved = localStorage.getItem('researchDisplayStyle');
  if (saved) {
    return saved as ResearchDisplayStyle;
  }
  
  // Migration: check old settings and convert
  const oldDisplayMode = localStorage.getItem('insightsDisplayMode');
  const oldAccordionExpansion = localStorage.getItem('accordionExpanded');
  
  if (oldDisplayMode === 'cards') {
    const newStyle = 'spacious';
    localStorage.setItem('researchDisplayStyle', newStyle);
    // Clean up old keys
    localStorage.removeItem('insightsDisplayMode');
    localStorage.removeItem('accordionExpanded');
    return newStyle;
  }
  
  if (oldDisplayMode === 'accordion') {
    const newStyle = oldAccordionExpansion === 'expanded' ? 'detailed' : 'compact';
    localStorage.setItem('researchDisplayStyle', newStyle);
    // Clean up old keys
    localStorage.removeItem('insightsDisplayMode');
    localStorage.removeItem('accordionExpanded');
    return newStyle;
  }
  
  return 'compact'; // default
};

export const setResearchDisplayStyle = (style: ResearchDisplayStyle): void => {
  localStorage.setItem('researchDisplayStyle', style);
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

    // Section mapping (same as UI)
    const getSectionTitle = (key: string) => {
      const sectionTitles: Record<string, string> = {
        strategic_fit: "Strategic Fit & Relevance",
        decision_makers: "Organization & Decision Making",
        technology_profile: "Technology & Innovation Profile",
        contact_strategy: "Contact Strategy & Recommendations",
        business_impact: "Business Impact & Financial Intelligence",
        challenges_position: "Current Challenges & Market Position",
        change_capacity: "Change Capacity & Digital Maturity"
      };
      
      return sectionTitles[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // Clean markdown text for PDF
    const cleanMarkdownText = (text: string) => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
        .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
        .replace(/#{1,6}\s/g, '') // Remove headers
        .replace(/\n\s*\n/g, '\n\n') // Normalize line breaks
        .trim();
    };

    // Format any content type (string, array, object) into readable PDF text
    const formatContentForPDF = (content: any): string => {
      if (content === null || content === undefined) return '';
      if (typeof content === 'string') return cleanMarkdownText(content);
      if (typeof content === 'number' || typeof content === 'boolean') return String(content);
      if (Array.isArray(content)) {
        const items = content
          .map((item) => formatContentForPDF(item))
          .filter(Boolean);
        return items.length ? items.map((t) => `• ${t}`).join('\n') : '';
      }
      if (typeof content === 'object') {
        const obj = content as Record<string, any>;
        if (typeof obj.summary === 'string') return cleanMarkdownText(obj.summary);
        if (typeof obj.overview === 'string') return cleanMarkdownText(obj.overview);
        const lines: string[] = [];
        Object.entries(obj).forEach(([key, value]) => {
          const val = formatContentForPDF(value);
          if (!val) return;
          const title = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
          lines.push(`${title}: ${val}`);
        });
        return lines.join('\n');
      }
      try {
        return JSON.stringify(content, null, 2);
      } catch {
        return String(content);
      }
    };

    // Header
    addWrappedText(`Research Analysis Report`, 18, true);
    addWrappedText(`Company: ${research.prospect_company_name}`, 14, true);
    addWrappedText(`Generated: ${new Date().toLocaleDateString()}`, 10);
    yPosition += 10;

    // Fit Score
    if (research.fit_score !== null && research.fit_score !== undefined) {
      addWrappedText(`Fit Score: ${research.fit_score}/100`, 14, true);
      yPosition += 5;
    }

    // Executive Summary (handled separately)
    if (research.research_results?.executive_summary !== undefined) {
      addWrappedText('Executive Summary', 16, true);
      const formattedSummary = formatContentForPDF(research.research_results.executive_summary);
      if (formattedSummary.trim()) {
        addWrappedText(formattedSummary, 11);
        yPosition += 10;
      }
    }

    // Dynamic sections (all fields except executive_summary)
    if (research.research_results && typeof research.research_results === 'object') {
      const sections = Object.entries(research.research_results)
        .filter(([key]) => key !== 'executive_summary');

      sections.forEach(([key, value]) => {
        const formatted = formatContentForPDF(value);
        if (!formatted || !formatted.trim()) return;

        const sectionTitle = getSectionTitle(key);
        addWrappedText(sectionTitle, 16, true);
        addWrappedText(formatted, 11);
        yPosition += 10;
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