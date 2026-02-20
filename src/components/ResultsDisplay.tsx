
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EvaluationResult } from './PromptEvaluator';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Copy,
  Download,
  Loader2,
  FileText
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getExportFormat, exportEvaluationResultsToPDF, exportToJSON } from '@/lib/exportUtils';

interface ResultsDisplayProps {
  results: EvaluationResult[];
  isEvaluating: boolean;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, isEvaluating }) => {
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

  const toggleExpanded = (resultId: string) => {
    setExpandedResults(prev => {
      const next = new Set(prev);
      if (next.has(resultId)) {
        next.delete(resultId);
      } else {
        next.add(resultId);
      }
      return next;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  const downloadResults = async () => {
    const format = getExportFormat();
    
    try {
      if (format === 'pdf') {
        await exportEvaluationResultsToPDF(results);
        toast({
          title: "PDF Downloaded!",
          description: "Evaluation results exported as PDF",
        });
      } else {
        const filename = `prompt-evaluation-${new Date().toISOString().split('T')[0]}.json`;
        exportToJSON(results, filename);
        toast({
          title: "JSON Downloaded!",
          description: "Evaluation results exported as JSON",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export results. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatResponse = (response: any): string => {
    if (typeof response === 'string') return response;
    
    // Handle n8n text node response format: [{"text": "content"}]
    if (Array.isArray(response) && response.length > 0 && response[0].text) {
      return response[0].text;
    }
    
    return JSON.stringify(response, null, 2);
  };

  if (isEvaluating && results.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Evaluating your prompt...</p>
          <p className="text-sm text-muted-foreground/70 mt-1">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Evaluations Yet</h3>
        <p className="text-muted-foreground">
          Fill in the parameters and run your first prompt evaluation to see results here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {results.length} evaluation{results.length !== 1 ? 's' : ''} completed
        </p>
        {results.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadResults}
            className="text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
        )}
      </div>

      {/* Results list */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {results.map((result) => (
          <Card 
            key={result.id} 
            className={`p-4 border transition-all duration-200 ${
              result.success 
                ? 'border-accent-foreground/20 bg-accent/30' 
                : 'border-destructive/20 bg-destructive/5'
            }`}
          >
            {/* Result header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="w-4 h-4 text-accent-foreground" />
                ) : (
                  <XCircle className="w-4 h-4 text-destructive" />
                )}
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? 'Success' : 'Failed'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {result.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpanded(result.id)}
                className="h-6 w-6 p-0"
              >
                {expandedResults.has(result.id) ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </Button>
            </div>

            {/* Company name */}
            <div className="mb-2">
              <span className="text-sm font-medium">{result.request.companyName}</span>
            </div>

            {/* Response preview for successful results */}
            {result.success && result.response && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">AI Analysis Report</span>
                </div>
                <div className="bg-background/50 p-3 rounded border border-border/50 max-h-32 overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap font-mono">
                    {formatResponse(result.response).substring(0, 300)}
                    {formatResponse(result.response).length > 300 && '...'}
                  </pre>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleExpanded(result.id)}
                    className="text-xs"
                  >
                    {expandedResults.has(result.id) ? 'Hide' : 'View'} Full Report
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(formatResponse(result.response))}
                    className="text-xs"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy Report
                  </Button>
                </div>
              </div>
            )}

            {/* Error message if failed */}
            {!result.success && result.error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded mb-3">
                {result.error}
              </div>
            )}

            {/* Expanded content */}
            {expandedResults.has(result.id) && (
              <div className="space-y-4 mt-4 pt-4 border-t border-border/50">
                {/* Full Response - now more prominent */}
                {result.response && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Complete AI Analysis Report
                    </h4>
                    <div className="relative">
                      <div className="bg-background/50 p-4 rounded border border-border/50 max-h-96 overflow-y-auto">
                        <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed">
                          {formatResponse(result.response)}
                        </pre>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-50 hover:opacity-100"
                        onClick={() => copyToClipboard(formatResponse(result.response))}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Request details */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Request Parameters</h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">Company:</span>
                      <span>{result.request.companyName}</span>
                      <span className="text-muted-foreground">Company URL:</span>
                      <span className="truncate">{result.request.companyUrl || 'N/A'}</span>
                      <span className="text-muted-foreground">LinkedIn:</span>
                      <span className="truncate">{result.request.linkedinUrl || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Prompts */}
                <div>
                  <h4 className="text-sm font-medium mb-2">User Prompt</h4>
                  <div className="relative">
                    <pre className="text-xs bg-background/50 p-3 rounded border border-border/50 overflow-x-auto">
                      {result.request.userPrompt}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-50 hover:opacity-100"
                      onClick={() => copyToClipboard(result.request.userPrompt)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Master Prompt</h4>
                  <div className="relative">
                    <pre className="text-xs bg-background/50 p-3 rounded border border-border/50 overflow-x-auto">
                      {result.request.masterPrompt}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-50 hover:opacity-100"
                      onClick={() => copyToClipboard(result.request.masterPrompt)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
      
      {isEvaluating && (
        <Card className="p-4 border-primary/20 bg-gradient-accent">
          <div className="flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm">Evaluating new prompt...</span>
          </div>
        </Card>
      )}
    </div>
  );
};
