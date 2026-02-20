import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  Building2, 
  Target, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Star,
  Download,
  RefreshCw,
  Eye,
  Coins
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ResearchResults } from './ResearchResults';
import { getExportFormat, exportResearchToPDF, exportToJSON } from '@/lib/exportUtils';
import { CreditPurchaseDialog } from './CreditPurchaseDialog';
import { useResearchList } from '@/hooks/useResearch';
import { useProfiles } from '@/hooks/useProfiles';
import { useCredits } from '@/hooks/useCredits';
import { toggleResearchStar, getActiveWebhookUrl } from '@/services/researchService';
import { getProfiles } from '@/services/profileService';
import { parseAndSaveN8nResponse } from '@/lib/researchResponseUtils';
import { enhanceWebhookPayload } from '@/lib/webhookPayloadUtils';
import { useAuth } from '@/contexts/AuthContext';
import type { ProspectResearch } from '@/types/research';

interface ResearchDashboardProps {
  onStartResearch: () => void;
  onSetupCompanyProfile: () => void;
  onSetupUserProfile: () => void;
}

export const ResearchDashboard: React.FC<ResearchDashboardProps> = ({
  onStartResearch,
  onSetupCompanyProfile,
  onSetupUserProfile
}) => {
  // Use new hooks for data fetching
  const { research, isLoading: researchLoading, refetch: refetchResearch } = useResearchList();
  const { userProfile, companyProfile, isLoading: profilesLoading } = useProfiles();
  const { credits, refetch: refetchCredits } = useCredits();
  
  const [isPolling, setIsPolling] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedResearch, setSelectedResearch] = useState<ProspectResearch | null>(null);
  const [showOnlyStarred, setShowOnlyStarred] = useState(false);
  const [showCreditPurchase, setShowCreditPurchase] = useState(false);
  const [previousResearch, setPreviousResearch] = useState<ProspectResearch[]>([]);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const loading = researchLoading || profilesLoading;

  // Set up polling for pending research
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const hasPending = research.some(r => r.status === 'pending');
    if (hasPending) {
      interval = setInterval(async () => {
        setIsPolling(true);
        await refetchResearch();
        setIsPolling(false);
      }, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [research.filter(r => r.status === 'pending').length, refetchResearch]);

  // Check for newly completed research and show notifications
  useEffect(() => {
    if (previousResearch.length > 0 && research.length > 0) {
      const newlyCompleted = research.filter(newItem => 
        newItem.status === 'completed' && 
        previousResearch.find(oldItem => oldItem.id === newItem.id && oldItem.status === 'pending')
      );
      
      newlyCompleted.forEach(item => {
        toast({
          title: "Research Complete!",
          description: `Analysis finished for ${item.prospect_company_name}${item.fit_score ? ` (Fit Score: ${item.fit_score}%)` : ''}`,
          duration: 6000
        });
      });
    }
    setPreviousResearch(research);
  }, [research, toast]);

  const resendWebhook = async (researchItem: ProspectResearch) => {
    try {
      if (!user) return;
      
      const { userProfile: up, companyProfile: cp } = await getProfiles(user.id);
      if (!up || !cp) {
        throw new Error('Error fetching profiles for resend');
      }

      const webhookUrl = await getActiveWebhookUrl();

      const prospectData = {
        company_name: researchItem.prospect_company_name,
        website_url: researchItem.prospect_website_url,
        linkedin_url: researchItem.prospect_linkedin_url,
        research_type: researchItem.research_type,
        notes: researchItem.notes || ''
      };

      const webhookPayload = enhanceWebhookPayload(prospectData, cp, up, researchItem.id);

      console.log('🚀 Sending webhook to:', webhookUrl);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload),
        mode: 'cors'
      });

      if (response.ok) {
        const responseText = await response.text();
        const parseResult = await parseAndSaveN8nResponse(responseText, researchItem.id, researchItem.prospect_company_name);
        
        if (parseResult.success) {
          refetchResearch();
          toast({
            title: "Analysis Complete!",
            description: `Research analysis completed for ${researchItem.prospect_company_name}${parseResult.fitScore ? ` (Fit Score: ${parseResult.fitScore}/100)` : ''}`,
            duration: 5000
          });
        } else {
          toast({
            title: "Analysis Received",
            description: `Research data sent, but parsing failed: ${parseResult.error}`,
            variant: "destructive"
          });
        }
      } else {
        const errorText = await response.text();
        throw new Error(`Webhook failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Resend error:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast({
          title: "CORS Error",
          description: "Cannot reach webhook - likely a CORS issue.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Resend Failed",
          description: error instanceof Error ? error.message : "Failed to resend webhook",
          variant: "destructive"
        });
      }
    }
  };

  const filteredResearch = research.filter(item => {
    const matchesSearch = item.prospect_company_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesStarred = !showOnlyStarred || item.is_starred;
    return matchesSearch && matchesStatus && matchesStarred;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-accent text-accent-foreground"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-scout-light-blue/20 text-scout-light-blue"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFitScoreColor = (score?: number | null) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 80) return 'text-accent-foreground';
    if (score >= 60) return 'text-scout-orange';
    return 'text-destructive';
  };

  const handleToggleStar = async (researchId: string, currentStarred: boolean) => {
    try {
      await toggleResearchStar(researchId, !currentStarred);
      refetchResearch();
      toast({
        title: !currentStarred ? "Research starred" : "Research unstarred",
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update star status.",
        variant: "destructive"
      });
    }
  };

  const exportResearch = async (researchItem: ProspectResearch) => {
    const format = getExportFormat();
    
    try {
      if (format === 'pdf') {
        await exportResearchToPDF(researchItem);
        toast({ title: "PDF Downloaded!" });
      } else {
        const exportData = {
          company: researchItem.prospect_company_name,
          fitScore: researchItem.fit_score,
          analysis: researchItem.research_results,
          completedAt: researchItem.completed_at
        };
        const filename = `${researchItem.prospect_company_name.replace(/\s+/g, '_')}_analysis.json`;
        exportToJSON(exportData, filename);
        toast({ title: "JSON Downloaded!" });
      }
    } catch (error) {
      toast({ title: "Export Failed", variant: "destructive" });
    }
  };

  const canStartResearch = companyProfile?.is_complete && userProfile?.is_complete;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderResearchCard = (item: ProspectResearch) => (
    <Card key={item.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">{item.prospect_company_name}</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-accent"
                onClick={() => handleToggleStar(item.id, item.is_starred || false)}
              >
                <Star className={`h-4 w-4 ${item.is_starred ? 'text-scout-orange fill-current' : 'text-muted-foreground'}`} />
              </Button>
              {getStatusBadge(item.status)}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <span>{item.prospect_website_url}</span>
              <span>•</span>
              <span>Research Type: {item.research_type}</span>
              {item.fit_score && (
                <>
                  <span>•</span>
                  <span className={getFitScoreColor(item.fit_score)}>
                    Fit Score: {item.fit_score}%
                  </span>
                </>
              )}
            </div>
            
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {item.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              Created {new Date(item.created_at).toLocaleDateString()}
              {item.completed_at && (
                <span> • Completed {new Date(item.completed_at).toLocaleDateString()}</span>
              )}
            </div>
            
            {item.error_message && (
              <div className="mt-2 text-sm text-scout-orange bg-scout-orange/10 p-2 rounded border border-scout-orange/20">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                {item.error_message}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {item.status === 'pending' && (
              <Button variant="outline" size="sm" onClick={() => resendWebhook(item)} className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Resend
              </Button>
            )}
            {item.status === 'completed' && (
              <>
                <Button variant="outline" size="sm" onClick={() => setSelectedResearch(item)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportResearch(item)}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </>
            )}
            {item.status === 'failed' && (
              <Button variant="outline" size="sm" onClick={() => resendWebhook(item)} className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prospect Exploration</h1>
          <p className="text-muted-foreground">Manage your company research and prospect analysis</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Available Credits</p>
                <p className="text-xl font-bold">{credits}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowCreditPurchase(true)} className="ml-2" title="Buy more credits">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </Card>
          
          <Button onClick={onStartResearch} disabled={!canStartResearch || credits < 1} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            New Research
          </Button>
        </div>
      </div>

      {/* Setup Cards */}
      {(!companyProfile?.is_complete || !userProfile?.is_complete) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!companyProfile?.is_complete && (
            <Card className="border-scout-orange/20 bg-scout-orange/10 dark:border-scout-orange/30 dark:bg-scout-orange/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-scout-orange">
                  <Building2 className="h-5 w-5" />
                  Company Profile Setup
                </CardTitle>
                <CardDescription>Set up your company profile to enable personalized research</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={onSetupCompanyProfile} variant="outline" className="w-full">
                  {companyProfile ? 'Complete Profile' : 'Create Profile'}
                </Button>
              </CardContent>
            </Card>
          )}

          {!userProfile?.is_complete && (
            <Card className="border-scout-light-blue/20 bg-scout-light-blue/10 dark:border-scout-light-blue/30 dark:bg-scout-light-blue/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-scout-light-blue">
                  <Target className="h-5 w-5" />
                  User Profile Setup
                </CardTitle>
                <CardDescription>Configure your personal research preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={onSetupUserProfile} variant="outline" className="w-full">
                  {userProfile ? 'Complete Profile' : 'Create Profile'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Research Tabs */}
      <Tabs defaultValue="all" className="space-y-4" onValueChange={setSelectedStatus}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Research</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search companies..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-64" />
            </div>
            <Button variant={showOnlyStarred ? "default" : "outline"} size="sm" onClick={() => setShowOnlyStarred(!showOnlyStarred)} className="flex items-center gap-2">
              <Star className={`h-4 w-4 ${showOnlyStarred ? 'fill-current' : ''}`} />
              {showOnlyStarred ? 'Show All' : 'Starred Only'}
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          {filteredResearch.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No research yet</h3>
                <p className="text-muted-foreground text-center mb-4">Start your first company research to see results here</p>
                <Button onClick={onStartResearch} disabled={!canStartResearch} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Start Research
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredResearch.map(renderResearchCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {filteredResearch.filter(item => item.status === 'pending').map(renderResearchCard)}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid gap-4">
            {filteredResearch.filter(item => item.status === 'completed').map(renderResearchCard)}
          </div>
        </TabsContent>
      </Tabs>

      {/* Research Results Modal */}
      {selectedResearch && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Research Analysis</h2>
                <Button variant="ghost" onClick={() => setSelectedResearch(null)}>×</Button>
              </div>
              <ResearchResults research={selectedResearch} />
            </div>
          </div>
        </div>
      )}

      {/* Credit Purchase Dialog */}
      <CreditPurchaseDialog open={showCreditPurchase} onOpenChange={setShowCreditPurchase} currentCredits={credits} />
    </div>
  );
};
