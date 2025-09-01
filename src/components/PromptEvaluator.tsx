import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { EvaluationForm } from './EvaluationForm';
import { ResultsDisplay } from './ResultsDisplay';
import { Brain, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface EvaluationRequest {
  companyName: string;
  companyUrl: string;
  linkedinUrl: string;
  userPrompt: string;
  masterPrompt: string;
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
  const [results, setResults] = useState<EvaluationResult[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const saveEvaluationToDatabase = async (request: EvaluationRequest): Promise<string | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('prompt_evaluations')
      .insert({
        user_id: user.id,
        company_name: request.companyName,
        user_prompt: request.userPrompt,
        master_prompt: request.masterPrompt,
        status: 'pending'
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving evaluation to database:', error);
      return null;
    }

    return data.id;
  };

  const updateEvaluationResults = async (evaluationId: string | null, results: any, status: string) => {
    if (!user || !evaluationId) return;

    const { error: updateError } = await supabase
      .from('prompt_evaluations')
      .update({
        evaluation_results: results,
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', evaluationId);

    if (updateError) {
      console.error('Error updating evaluation results:', updateError);
    }
  };

  const fetchWebhookUrl = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('webhook_testing')
        .select('webhook_url')
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching webhook URL:', error);
        return null;
      }

      return data?.webhook_url || null;
    } catch (error) {
      console.error('Error fetching webhook URL:', error);
      return null;
    }
  };

  const handleEvaluation = async (request: EvaluationRequest) => {
    if (isEvaluating) return;
    
    setIsEvaluating(true);
    
    try {
      // Fetch webhook URL from database
      const webhookUrl = await fetchWebhookUrl();
      
      if (!webhookUrl) {
        const errorResult: EvaluationResult = {
          id: Date.now().toString(),
          request,
          response: null,
          timestamp: new Date(),
          success: false,
          error: 'No webhook URL configured. Please contact administrator.'
        };
        
        setResults(prev => [errorResult, ...prev]);
        return;
      }
      
      // Save initial evaluation data to database if user is authenticated
      const evaluationId = await saveEvaluationToDatabase(request);
      
      // Send request to webhook
      const response = await fetch(webhookUrl, {
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
          timestamp: new Date().toISOString(),
          evaluationId: evaluationId // Include the evaluation ID for tracking
        }),
      });

      let responseData;
      let errorMessage;

      // Clone response to allow reading both JSON and text if needed
      const responseClone = response.clone();

      try {
        responseData = await response.json();
        
        // Check for specific n8n webhook errors
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
        // Use cloned response for text fallback
        responseData = await responseClone.text();
        if (!response.ok) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
      }

      // Update database with results
      if (evaluationId) {
        await updateEvaluationResults(evaluationId, responseData, response.ok ? 'completed' : 'error');
      }

      const result: EvaluationResult = {
        id: Date.now().toString(),
        request,
        response: responseData,
        timestamp: new Date(),
        success: response.ok,
        error: errorMessage,
      };

      setResults(prev => [result, ...prev]);
    } catch (error) {
      let errorMessage = 'Connection failed';
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = 'CORS error or network failure. Please ensure:\n• n8n workflow is active\n• Webhook has CORS headers enabled\n• URL is accessible from browser';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Update database with error
      const evaluationId = await saveEvaluationToDatabase(request);
      if (evaluationId) {
        await updateEvaluationResults(evaluationId, null, 'error');
      }

      const result: EvaluationResult = {
        id: Date.now().toString(),
        request,
        response: null,
        timestamp: new Date(),
        success: false,
        error: errorMessage,
      };

      setResults(prev => [result, ...prev]);
    } finally {
      setIsEvaluating(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-gradient-accent">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Prompt Refine Station
            </h1>
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground text-lg">
            Optimize your prompts by testing different parameters and analyzing results in real-time
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-secondary border-primary/20 shadow-elegant">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Evaluation Parameters
              </h2>
              <EvaluationForm onSubmit={handleEvaluation} isLoading={isEvaluating} />
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-secondary border-primary/20 shadow-elegant">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  Evaluation Results
                </h2>
                {results.length > 0 && (
                  <button
                    onClick={clearResults}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <ResultsDisplay results={results} isEvaluating={isEvaluating} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};