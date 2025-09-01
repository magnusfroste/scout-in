import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { EvaluationResult } from './PromptEvaluator';
import { Copy, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SimpleResultsDisplayProps {
  result: EvaluationResult | null;
  isEvaluating: boolean;
}

export const SimpleResultsDisplay: React.FC<SimpleResultsDisplayProps> = ({ result, isEvaluating }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  const formatResponse = (response: any): string => {
    if (typeof response === 'string') return response;
    
    // Handle n8n text node response format: [{"text": "content"}]
    if (Array.isArray(response) && response.length > 0 && response[0].text) {
      return response[0].text;
    }
    
    return JSON.stringify(response, null, 2);
  };

  if (isEvaluating) {
    return (
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600">Evaluating your prompt...</p>
            <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-gray-400 text-xl">📄</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Yet</h3>
          <p className="text-gray-500">
            Configure your prompts and run an evaluation to see results here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white h-full flex flex-col">
      {/* Status Header */}
      <div className={`px-4 py-3 border-b border-gray-200 ${
        result.success ? 'bg-green-50' : 'bg-red-50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              result.success ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className={`text-sm font-medium ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.success ? 'Success' : 'Failed'}
            </span>
            <span className="text-xs text-gray-500">
              {result.timestamp.toLocaleTimeString()}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700">{result.request.companyName}</span>
        </div>
      </div>

      {/* Response Content */}
      <div className="p-4 flex-1 flex flex-col min-h-0">
        {result.success && result.response ? (
          <div className="space-y-3 flex flex-col h-full min-h-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">AI Response</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(formatResponse(result.response))}
                className="text-xs border-gray-300 hover:border-gray-400"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </div>
            <div className="bg-white rounded border border-gray-200 p-4 flex-1 overflow-y-auto">
              <div className="prose prose-sm max-w-none text-black">
                <ReactMarkdown
                  components={{
                    h1: ({children}) => <h1 className="text-xl font-bold text-gray-900 mb-3 mt-4 first:mt-0">{children}</h1>,
                    h2: ({children}) => <h2 className="text-lg font-semibold text-gray-800 mb-2 mt-3">{children}</h2>,
                    h3: ({children}) => <h3 className="text-base font-medium text-gray-700 mb-2 mt-2">{children}</h3>,
                    p: ({children}) => <p className="mb-2 leading-relaxed">{children}</p>,
                    ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                    li: ({children}) => <li className="text-sm">{children}</li>,
                    strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                    code: ({children}) => <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                    table: ({children}) => <table className="w-full border-collapse border border-gray-300 my-2 text-xs">{children}</table>,
                    th: ({children}) => <th className="border border-gray-300 px-2 py-1 bg-gray-100 font-medium text-left">{children}</th>,
                    td: ({children}) => <td className="border border-gray-300 px-2 py-1">{children}</td>,
                    blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 pl-3 my-2 italic text-gray-600">{children}</blockquote>,
                  }}
                >
                  {formatResponse(result.response)}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-red-800">Error</h4>
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-700">{result.error || 'Unknown error occurred'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};