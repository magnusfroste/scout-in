import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Copy, Download, Users, Target, MessageSquare, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportResearchToPDF, exportToJSON, getExportFormat, getAccordionExpanded, getInsightsDisplayMode } from "@/lib/exportUtils";

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
  const accordionExpansion = getAccordionExpanded();
  const displayMode = getInsightsDisplayMode();

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

  const formatSectionContent = (content: any) => {
    if (typeof content === 'string') return content;
    if (typeof content === 'object') {
      return Object.entries(content)
        .map(([key, value]) => `**${key.replace(/_/g, ' ')}**: ${value}`)
        .join('\n\n');
    }
    return JSON.stringify(content, null, 2);
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
    const isExpanded = accordionExpansion === 'expanded';
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
    return displayMode === 'cards' ? renderAsCards(data, prefix) : renderAccordion(data, prefix);
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
                {renderMarkdownContent(typeof results.executive_summary === 'string' ? results.executive_summary : results.executive_summary.overall_assessment)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="strategic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="strategic">Strategic Fit</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="technology">Technology</TabsTrigger>
          <TabsTrigger value="contact">Contact Strategy</TabsTrigger>
        </TabsList>

        <TabsContent value="strategic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Strategic Fit & Relevance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {results.analysis?.['1_strategic_fit_relevance'] && renderContent(results.analysis['1_strategic_fit_relevance'], 'strategic')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Organization & Decision Making
              </CardTitle>
            </CardHeader>
            <CardContent>
              {results.analysis?.['2_organization_decision_making'] && renderContent(results.analysis['2_organization_decision_making'], 'org')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technology" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technology & Innovation Profile</CardTitle>
            </CardHeader>
            <CardContent>
              {results.analysis?.['5_technology_innovation_profile'] && renderContent(results.analysis['5_technology_innovation_profile'], 'tech')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Contact Strategy & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {results.analysis?.['7_contact_strategy_approach'] && renderContent(results.analysis['7_contact_strategy_approach'], 'contact')}

              {results.analysis?.['8_personalized_outreach_recommendations'] && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Personalized Outreach Recommendations</h4>
                  {renderContent(results.analysis['8_personalized_outreach_recommendations'], 'value')}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};