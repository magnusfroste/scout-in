import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Filter,
  MoreHorizontal,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ResearchResults } from './ResearchResults';
import { getExportFormat, exportResearchToPDF, exportToJSON } from '@/lib/exportUtils';
import { parseAndSaveN8nResponse } from '@/lib/researchResponseUtils';

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

interface CompanyProfile {
  id: string;
  company_name: string;
  is_complete: boolean;
}

interface UserProfile {
  id: string;
  full_name: string;
  is_complete: boolean;
}

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
  const [research, setResearch] = useState<ResearchItem[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedResearch, setSelectedResearch] = useState<ResearchItem | null>(null);
  const [showOnlyStarred, setShowOnlyStarred] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  // Set up polling for pending research
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const hasPending = research.some(r => r.status === 'pending');
    if (hasPending) {
      interval = setInterval(() => {
        loadData();
      }, 3000); // Poll every 3 seconds when there's pending research
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [research.filter(r => r.status === 'pending').length]); // Only depend on pending count

  // Dummy user ID for POC demo
  const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load user's research
      const { data: researchData, error: researchError } = await supabase
        .from('lab_prospect_research')
        .select('*')
        .eq('user_id', DEMO_USER_ID)
        .order('created_at', { ascending: false });

      if (researchError) throw researchError;

      // Load company profile
      const { data: companyData, error: companyError } = await supabase
        .from('lab_company_profiles')
        .select('id, company_name, is_complete')
        .eq('user_id', DEMO_USER_ID)
        .maybeSingle();

      if (companyError) {
        console.error('Company profile error:', companyError);
      }

      // Load user profile
      const { data: userData, error: userError } = await supabase
        .from('lab_user_profiles')
        .select('id, full_name, is_complete')
        .eq('user_id', DEMO_USER_ID)
        .maybeSingle();

      if (userError) {
        console.error('User profile error:', userError);
      }

      // Check for newly completed research and show notifications
      if (researchData && research.length > 0) {
        const newlyCompleted = researchData.filter(newItem => 
          newItem.status === 'completed' && 
          research.find(oldItem => oldItem.id === newItem.id && oldItem.status === 'pending')
        );
        
        newlyCompleted.forEach(item => {
          toast({
            title: "Research Complete!",
            description: `Analysis finished for ${item.prospect_company_name}${item.fit_score ? ` (Fit Score: ${item.fit_score}%)` : ''}`,
            duration: 6000
          });
        });
      }

      setResearch(researchData || []);
      setCompanyProfile(companyData);
      setUserProfile(userData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error loading data",
        description: "Please refresh the page to try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resendWebhook = async (researchItem: ResearchItem) => {
    try {
      // Get the company and user profiles
      const [companyProfile, userProfile] = await Promise.all([
        supabase.from('lab_company_profiles').select('*').eq('user_id', DEMO_USER_ID).single(),
        supabase.from('lab_user_profiles').select('*').eq('user_id', DEMO_USER_ID).single()
      ]);

      if (companyProfile.error || userProfile.error) {
        throw new Error('Error fetching profiles for resend');
      }

      // Get webhook URL
      const { data: webhookData } = await supabase
        .from('webhook_testing')
        .select('webhook_url')
        .eq('is_active', true)
        .single();

      const webhookUrl = webhookData?.webhook_url || 'https://example.com/webhook';

      // Prepare the webhook payload
      const webhookPayload = {
        prospect_data: {
          company_name: researchItem.prospect_company_name,
          website_url: researchItem.prospect_website_url,
          linkedin_url: researchItem.prospect_linkedin_url,
          research_type: researchItem.research_type,
          notes: researchItem.notes || ''
        },
        company_profile: companyProfile.data,
        user_profile: userProfile.data,
        timestamp: new Date().toISOString(),
        research_id: researchItem.id
      };

      // Send POST request
      console.log('🚀 Sending webhook to:', webhookUrl);
      console.log('📦 Payload:', JSON.stringify(webhookPayload, null, 2));
      
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
          mode: 'cors' // Explicitly set CORS mode
        });

        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);

        if (response.ok) {
          const responseText = await response.text();
          console.log('✅ Webhook response:', responseText);
          
          // Parse and save the n8n analysis response
          const parseResult = await parseAndSaveN8nResponse(
            responseText, 
            researchItem.id, 
            researchItem.prospect_company_name
          );
          
          if (parseResult.success) {
            // Refresh the data to show updated results
            loadData();
            
            toast({
              title: "Analysis Complete!",
              description: `Research analysis completed for ${researchItem.prospect_company_name}${parseResult.fitScore ? ` (Fit Score: ${parseResult.fitScore}/100)` : ''}`,
              duration: 5000
            });
          } else {
            toast({
              title: "Analysis Received",
              description: `Research data sent for ${researchItem.prospect_company_name}, but analysis parsing failed: ${parseResult.error}`,
              variant: "destructive",
              duration: 5000
            });
          }
        } else {
          const errorText = await response.text();
          console.error('❌ Webhook error response:', errorText);
          throw new Error(`Webhook failed: ${response.status} - ${errorText}`);
        }
      } catch (fetchError) {
        console.error('🚨 Fetch error:', fetchError);
        
        // Check if it's a CORS error
        if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
          toast({
            title: "CORS Error",
            description: `Cannot reach ${webhookUrl} - likely a CORS issue. Check n8n webhook settings.`,
            variant: "destructive",
            duration: 8000
          });
        } else {
          throw fetchError;
        }
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast({
        title: "Resend Failed",
        description: error instanceof Error ? error.message : "Failed to resend webhook",
        variant: "destructive"
      });
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
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFitScoreColor = (score?: number) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const toggleStar = async (researchId: string, currentStarred: boolean) => {
    try {
      const { error } = await supabase
        .from('lab_prospect_research')
        .update({ is_starred: !currentStarred })
        .eq('id', researchId);

      if (error) throw error;

      // Update local state immediately for better UX
      setResearch(prev => prev.map(item => 
        item.id === researchId 
          ? { ...item, is_starred: !currentStarred }
          : item
      ));

      toast({
        title: !currentStarred ? "Research starred" : "Research unstarred",
        description: "Research item updated successfully.",
        duration: 2000
      });
    } catch (error) {
      console.error('Error toggling star:', error);
      toast({
        title: "Error",
        description: "Failed to update star status.",
        variant: "destructive"
      });
    }
  };

  const exportResearch = async (research: ResearchItem) => {
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

  const canStartResearch = companyProfile?.is_complete && userProfile?.is_complete;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prospect Exploration</h1>
          <p className="text-muted-foreground">
            Manage your company research and prospect analysis
          </p>
        </div>
        
        <Button 
          onClick={onStartResearch}
          disabled={!canStartResearch}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Research
        </Button>
      </div>

      {/* Setup Cards */}
      {(!companyProfile?.is_complete || !userProfile?.is_complete) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!companyProfile?.is_complete && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Building2 className="h-5 w-5" />
                  Company Profile Setup
                </CardTitle>
                <CardDescription>
                  Set up your company profile to enable personalized research
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={onSetupCompanyProfile} variant="outline" className="w-full">
                  {companyProfile ? 'Complete Profile' : 'Create Profile'}
                </Button>
              </CardContent>
            </Card>
          )}

          {!userProfile?.is_complete && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Target className="h-5 w-5" />
                  User Profile Setup
                </CardTitle>
                <CardDescription>
                  Configure your personal research preferences
                </CardDescription>
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
              <Input
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button 
              variant={showOnlyStarred ? "default" : "outline"} 
              size="sm"
              onClick={() => setShowOnlyStarred(!showOnlyStarred)}
              className="flex items-center gap-2"
            >
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
                <p className="text-muted-foreground text-center mb-4">
                  Start your first company research to see results here
                </p>
                <Button 
                  onClick={onStartResearch}
                  disabled={!canStartResearch}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Start Research
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredResearch.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{item.prospect_company_name}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-yellow-100"
                            onClick={() => toggleStar(item.id, item.is_starred || false)}
                          >
                            <Star className={`h-4 w-4 ${item.is_starred ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`} />
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
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
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
                          <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                            {item.error_message}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {item.status === 'completed' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => exportResearch(item)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {filteredResearch.filter(item => item.status === 'pending').map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{item.prospect_company_name}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-yellow-100"
                          onClick={() => toggleStar(item.id, item.is_starred || false)}
                        >
                          <Star className={`h-4 w-4 ${item.is_starred ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`} />
                        </Button>
                        {getStatusBadge(item.status)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span>{item.prospect_website_url}</span>
                        <span>•</span>
                        <span className="font-medium text-foreground">Research Type: {item.research_type}</span>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Created {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => resendWebhook(item)}
                        className="flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Resend
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid gap-4">
            {filteredResearch.filter(item => item.status === 'completed').map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{item.prospect_company_name}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-yellow-100"
                          onClick={() => toggleStar(item.id, item.is_starred || false)}
                        >
                          <Star className={`h-4 w-4 ${item.is_starred ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`} />
                        </Button>
                        {getStatusBadge(item.status)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span>{item.prospect_website_url}</span>
                        <span>•</span>
                        <span className="font-medium text-foreground">Research Type: {item.research_type}</span>
                        {item.fit_score && (
                          <>
                            <span>•</span>
                            <span className={`font-medium ${getFitScoreColor(item.fit_score)}`}>
                              Fit Score: {item.fit_score}%
                            </span>
                          </>
                        )}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Created {new Date(item.created_at).toLocaleDateString()}
                        {item.completed_at && (
                          <span> • Completed {new Date(item.completed_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedResearch(item)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Analysis
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => exportResearch(item)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                <Button variant="ghost" onClick={() => setSelectedResearch(null)}>
                  ×
                </Button>
              </div>
              <ResearchResults research={selectedResearch} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};