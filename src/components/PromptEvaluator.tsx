import React, { useState } from 'react';
import { EvaluationForm } from './EvaluationForm';
import { SimpleResultsDisplay } from './SimpleResultsDisplay';

export interface EvaluationRequest {
  companyName: string;
  companyUrl: string;
  linkedinUrl: string;
  userPrompt: string;
  masterPrompt: string;
  webhookUrl: string;
}

export interface EvaluationResult {
  id: string;
  request: EvaluationRequest;
  response: any;
  timestamp: Date;
  success: boolean;
  error?: string;
}

export const PromptEvaluator: React.FC = () => {
  const [latestResult, setLatestResult] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleEvaluation = async (request: EvaluationRequest) => {
    if (isEvaluating) return;
    
    setIsEvaluating(true);
    
    try {
      const response = await fetch(request.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          company_name: request.companyName,
          company_url: request.companyUrl,
          linkedin_url: request.linkedinUrl,
          user_prompt: request.userPrompt,
          master_prompt: request.masterPrompt,
          timestamp: new Date().toISOString()
        }),
      });

      let responseData;
      let errorMessage;

      const responseClone = response.clone();

      try {
        responseData = await response.json();
        
        if (!response.ok) {
          if (response.status === 404 && responseData?.message?.includes('not registered for POST')) {
            errorMessage = 'Webhook not configured for POST requests. Please check your n8n workflow setup.';
          } else if (response.status === 404) {
            errorMessage = 'Webhook endpoint not found. Please verify the webhook URL in your n8n workflow.';
          } else {
            errorMessage = `HTTP ${response.status}: ${responseData?.message || response.statusText}`;
          }
        }
      } catch {
        responseData = await responseClone.text();
        if (!response.ok) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
      }

      const result: EvaluationResult = {
        id: Date.now().toString(),
        request,
        response: responseData,
        timestamp: new Date(),
        success: response.ok,
        error: errorMessage,
      };

      setLatestResult(result);
    } catch (error) {
      let errorMessage = 'Connection failed';
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = 'CORS error or network failure. Please ensure:\n• n8n workflow is active\n• Webhook has CORS headers enabled\n• URL is accessible from browser';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      const result: EvaluationResult = {
        id: Date.now().toString(),
        request,
        response: null,
        timestamp: new Date(),
        success: false,
        error: errorMessage,
      };

      setLatestResult(result);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Simple Header */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold text-foreground">
            Prompt Refine Station
          </h1>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 container mx-auto px-6 py-6">
        <div className="grid grid-cols-2 gap-8 h-full">
          {/* Left Column - Prompts */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-foreground mb-4">Prompt Configuration</h2>
            <EvaluationForm onSubmit={handleEvaluation} isLoading={isEvaluating} />
          </div>

          {/* Right Column - Results */}
          <div className="space-y-4 flex flex-col min-h-0">
            <h2 className="text-lg font-medium text-foreground mb-4">Results</h2>
            <div className="flex-1 min-h-0">
              <SimpleResultsDisplay result={latestResult} isEvaluating={isEvaluating} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
