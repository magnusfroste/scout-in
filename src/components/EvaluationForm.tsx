import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send, Globe, Linkedin, Building, Webhook } from 'lucide-react';
import { EvaluationRequest } from './PromptEvaluator';
import { toast } from '@/hooks/use-toast';

interface EvaluationFormProps {
  onSubmit: (request: EvaluationRequest) => Promise<void>;
  isLoading: boolean;
}

export const EvaluationForm: React.FC<EvaluationFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<EvaluationRequest>({
    companyName: '',
    companyUrl: '',
    linkedinUrl: '',
    userPrompt: '',
    masterPrompt: '',
    webhookUrl: 'https://agent.froste.eu/webhook/ab729e8a-0da7-49ef-902e-d0fafb1e0e56',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.companyName || !formData.userPrompt || !formData.masterPrompt || !formData.webhookUrl) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    await onSubmit(formData);
    
    toast({
      title: "Evaluation Started",
      description: "Your prompt evaluation request has been sent",
    });
  };

  const handleInputChange = (field: keyof EvaluationRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Information - Compact */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">
            Company Name *
          </Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            placeholder="Enter company name"
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="webhookUrl" className="text-sm font-medium text-gray-700">
            Environment *
          </Label>
          <Select 
            value={formData.webhookUrl} 
            onValueChange={(value) => handleInputChange('webhookUrl', value)}
          >
            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select webhook environment" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              <SelectItem value="https://agent.froste.eu/webhook-test/ab729e8a-0da7-49ef-902e-d0fafb1e0e56">
                Test Environment
              </SelectItem>
              <SelectItem value="https://agent.froste.eu/webhook/ab729e8a-0da7-49ef-902e-d0fafb1e0e56">
                Production Environment
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Optional URLs - Compact */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companyUrl" className="text-sm font-medium text-gray-700">
            Company URL
          </Label>
          <Input
            id="companyUrl"
            value={formData.companyUrl}
            onChange={(e) => handleInputChange('companyUrl', e.target.value)}
            placeholder="https://company.com"
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedinUrl" className="text-sm font-medium text-gray-700">
            LinkedIn URL
          </Label>
          <Input
            id="linkedinUrl"
            value={formData.linkedinUrl}
            onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
            placeholder="https://linkedin.com/company/..."
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Large Prompt Textareas */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="userPrompt" className="text-sm font-medium text-gray-700">User Prompt *</Label>
          <Textarea
            id="userPrompt"
            value={formData.userPrompt}
            onChange={(e) => handleInputChange('userPrompt', e.target.value)}
            placeholder="Enter the user prompt to evaluate..."
            rows={10}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none font-mono text-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="masterPrompt" className="text-sm font-medium text-gray-700">Master Prompt *</Label>
          <Textarea
            id="masterPrompt"
            value={formData.masterPrompt}
            onChange={(e) => handleInputChange('masterPrompt', e.target.value)}
            placeholder="Enter the master prompt for evaluation..."
            rows={10}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none font-mono text-sm"
            required
          />
        </div>
      </div>

      <Button
        type="submit" 
        variant="default" 
        size="lg" 
        disabled={isLoading}
        className="w-full font-semibold bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Evaluating Prompt...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Evaluate Prompt
          </>
        )}
      </Button>
    </form>
  );
};