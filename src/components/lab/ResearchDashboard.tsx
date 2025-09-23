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
  MoreHorizontal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ResearchItem {
  id: string;
  prospect_company_name: string;
  prospect_website_url: string;
  prospect_linkedin_url?: string;
  research_type: string;
  status: string;
  fit_score?: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  tags: string[];
  notes?: string;
  is_starred: boolean;
  created_at: string;
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
  
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load user's research
      const { data: researchData, error: researchError } = await supabase
        .from('lab_prospect_research')
        .select('*')
        .order('created_at', { ascending: false });

      if (researchError) throw researchError;

      // Load company profile
      const { data: companyData, error: companyError } = await supabase
        .from('lab_company_profiles')
        .select('id, company_name, is_complete')
        .single();

      if (companyError && companyError.code !== 'PGRST116') {
        console.error('Company profile error:', companyError);
      }

      // Load user profile
      const { data: userData, error: userError } = await supabase
        .from('lab_user_profiles')
        .select('id, full_name, is_complete')
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error('User profile error:', userError);
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

  const filteredResearch = research.filter(item => {
    const matchesSearch = item.prospect_company_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
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
          <h1 className="text-3xl font-bold">Research Dashboard</h1>
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
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Research</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="starred">Starred</TabsTrigger>
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
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
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
                          {item.is_starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
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
                        
                        {item.tags.length > 0 && (
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
                          <Button variant="outline" size="sm">
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
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{item.prospect_company_name}</h3>
                      <p className="text-muted-foreground">{item.prospect_website_url}</p>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid gap-4">
            {filteredResearch.filter(item => item.status === 'completed').map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{item.prospect_company_name}</h3>
                      <p className="text-muted-foreground">{item.prospect_website_url}</p>
                      {item.fit_score && (
                        <p className={getFitScoreColor(item.fit_score)}>
                          Fit Score: {item.fit_score}%
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(item.status)}
                      <Button variant="outline" size="sm">
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

        <TabsContent value="starred">
          <div className="grid gap-4">
            {filteredResearch.filter(item => item.is_starred).map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{item.prospect_company_name}</h3>
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      </div>
                      <p className="text-muted-foreground">{item.prospect_website_url}</p>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};