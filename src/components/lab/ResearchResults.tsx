import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Copy, Download, Users, Target, MessageSquare, TrendingUp, Cpu, AlertTriangle, Settings, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportResearchToPDF, exportToJSON, getExportFormat, getResearchDisplayStyle } from "@/lib/exportUtils";

interface ResearchItem {
  id: string;
  prospect_company_name: string;
  prospect_website_url: string;
  prospect_linkedin_url?: string;
  research_type: string;
  webhook_url: string;
  status: string;
  error_message?: string;
  tags?: string[];
  notes?: string;
  fit_score: number | null;
  research_results: any;
  decision_makers: any;
  contact_strategy: any;
  value_proposition: any;
  started_at?: string;
  completed_at: string | null;
  is_starred?: boolean;
  exported_at?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  company_profile_id: string;
  user_profile_id: string;
}

interface ResearchResultsProps {
  research: ResearchItem;
}

export const ResearchResults: React.FC<ResearchResultsProps> = ({ research }) => {
  const { toast } = useToast();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const displayStyle = getResearchDisplayStyle();

  if (!research.research_results || research.status !== 'completed') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{research.prospect_company_name}</CardTitle>
          <CardDescription>Research analysis not yet available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const results = research.research_results;
  const fitScore = research.fit_score || 0;

  const copyToClipboard = async (text: string, sectionName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionName);
      setTimeout(() => setCopiedSection(null), 2000);
      toast({
        title: "Copied!",
        description: `${sectionName} copied to clipboard`,
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const exportAnalysis = async () => {
    const format = getExportFormat();
    
    try {
      if (format === 'pdf') {
        await exportResearchToPDF(research);
        toast({
          title: "PDF Downloaded!",
          description: "Research analysis exported as PDF",
        });
      } else {
        const exportData = {
          company: research.prospect_company_name,
          fitScore: research.fit_score,
          analysis: research.research_results,
          completedAt: research.completed_at
        };
        
        const filename = `${research.prospect_company_name.replace(/\s+/g, '_')}_analysis.json`;
        exportToJSON(exportData, filename);
        toast({
          title: "JSON Downloaded!",
          description: "Research analysis exported as JSON",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export analysis. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getFitScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Simplified - now expects direct markdown strings
  const formatSectionContent = (content: any) => {
    return typeof content === 'string' ? content : String(content);
  };

  const renderMarkdownContent = (content: string) => (
    <ReactMarkdown 
      components={{
        p: ({ children }) => <p className="text-sm text-muted-foreground leading-relaxed mb-2">{children}</p>,
        strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
        ul: ({ children }) => <ul className="text-sm text-muted-foreground space-y-1 ml-4">{children}</ul>,
        li: ({ children }) => <li className="list-disc">{children}</li>,
        h3: ({ children }) => <h3 className="text-foreground font-semibold text-base mb-2">{children}</h3>,
        h4: ({ children }) => <h4 className="text-foreground font-medium text-sm mb-1">{children}</h4>,
      }}
    >
      {content}  
    </ReactMarkdown>
  );

  const renderAccordion = (data: any, prefix: string) => {
    const isExpanded = displayStyle === 'detailed';
    const defaultValues = isExpanded ? Object.keys(data).map((_, index) => `${prefix}-${index}`) : undefined;

    if (isExpanded) {
      return (
        <Accordion type="multiple" defaultValue={defaultValues}>
          {Object.entries(data).map(([key, value], index) => (
            <AccordionItem key={index} value={`${prefix}-${index}`}>
              <AccordionTrigger className="text-left">
                {key.replace(/_/g, ' ')}
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {renderMarkdownContent(formatSectionContent(value))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(formatSectionContent(value), key)}
                    className={copiedSection === key ? "text-green-600" : ""}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      );
    }

    return (
      <Accordion type="single" collapsible>
        {Object.entries(data).map(([key, value], index) => (
          <AccordionItem key={index} value={`${prefix}-${index}`}>
            <AccordionTrigger className="text-left">
              {key.replace(/_/g, ' ')}
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {renderMarkdownContent(formatSectionContent(value))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(formatSectionContent(value), key)}
                  className={copiedSection === key ? "text-green-600" : ""}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  };

  const renderAsCards = (data: any, prefix: string) => {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {Object.entries(data).map(([key, value], index) => (
          <Card key={index} className="h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">
                  {key.replace(/_/g, ' ')}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(formatSectionContent(value), key)}
                  className={copiedSection === key ? "text-green-600" : ""}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm leading-relaxed">
                {renderMarkdownContent(formatSectionContent(value))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderContent = (data: any, prefix: string) => {
    return displayStyle === 'spacious' ? renderAsCards(data, prefix) : renderAccordion(data, prefix);
  };

  // Section mapping for icons and titles
  const getSectionConfig = (key: string) => {
    const configs: Record<string, { icon: any; title: string }> = {
      strategic_fit: { icon: Target, title: "Strategic Fit & Relevance" },
      decision_makers: { icon: Users, title: "Organization & Decision Making" },
      technology_profile: { icon: Cpu, title: "Technology & Innovation Profile" },
      contact_strategy: { icon: MessageSquare, title: "Contact Strategy & Recommendations" },
      business_impact: { icon: TrendingUp, title: "Business Impact & Financial Intelligence" },
      challenges_position: { icon: AlertTriangle, title: "Current Challenges & Market Position" },
      change_capacity: { icon: Settings, title: "Change Capacity & Digital Maturity" }
    };
    
    return configs[key] || { 
      icon: FileText, 
      title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) 
    };
  };

  // Get all sections except executive_summary (handled separately)
  const getSectionsToRender = () => {
    if (!results || typeof results !== 'object') return [];
    
    return Object.entries(results)
      .filter(([key]) => key !== 'executive_summary')
      .filter(([, value]) => value && String(value).trim());
  };

  return (
    <div className="space-y-6">
      {/* Header with Fit Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{research.prospect_company_name}</CardTitle>
              <CardDescription>Research Analysis Complete</CardDescription>
            </div>
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-white font-bold text-xl ${getFitScoreColor(fitScore)}`}>
                {fitScore}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Fit Score</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Completed
            </Badge>
            <Button variant="outline" size="sm" onClick={exportAnalysis}>
              <Download className="w-4 h-4 mr-2" />
              Export Analysis
            </Button>
          </div>
          {results.executive_summary && (
            <div>
              <h3 className="font-semibold mb-2">Executive Summary</h3>
              <div className="text-sm leading-relaxed">
                {renderMarkdownContent(results.executive_summary)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dynamic Analysis Sections */}
      {getSectionsToRender().map(([key, value]) => {
        const config = getSectionConfig(key);
        const IconComponent = config.icon;
        
        return (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconComponent className="w-5 h-5" />
                {config.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm leading-relaxed">
                {renderMarkdownContent(formatSectionContent(value))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(formatSectionContent(value), config.title)}
                  className={`mt-2 ${copiedSection === config.title ? "text-green-600" : ""}`}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};