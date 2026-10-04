import { supabase } from '@/integrations/supabase/client';
import type { Json, TablesUpdate } from '@/integrations/supabase/types';
import type { ProspectResearch, ResearchFormData, ResearchResults } from '@/types/research';
import type { CompanyProfile, UserProfile } from '@/types/profiles';

// ============ Research CRUD Operations ============

export async function createResearchRecord(
  userId: string,
  companyProfileId: string,
  userProfileId: string,
  formData: ResearchFormData,
  webhookUrl: string
): Promise<ProspectResearch> {
  const { data, error } = await supabase
    .from('lab_prospect_research')
    .insert({
      user_id: userId,
      company_profile_id: companyProfileId,
      user_profile_id: userProfileId,
      prospect_company_name: formData.company_name,
      prospect_website_url: formData.website_url,
      prospect_linkedin_url: formData.linkedin_url ?? null,
      research_type: formData.research_type || 'standard',
      notes: formData.notes || '',
      webhook_url: webhookUrl,
      status: 'pending',
      started_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getResearchById(researchId: string): Promise<ProspectResearch | null> {
  const { data, error } = await supabase
    .from('lab_prospect_research')
    .select('*')
    .eq('id', researchId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getUserResearchList(userId: string): Promise<ProspectResearch[]> {
  const { data, error } = await supabase
    .from('lab_prospect_research')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateResearchStatus(
  researchId: string,
  status: string,
  errorMessage?: string
): Promise<void> {
  const update: TablesUpdate<'lab_prospect_research'> = { status };
  
  if (status === 'completed') {
    update.completed_at = new Date().toISOString();
  }
  if (errorMessage !== undefined) {
    update.error_message = errorMessage;
  }

  const { error } = await supabase
    .from('lab_prospect_research')
    .update(update)
    .eq('id', researchId);

  if (error) throw error;
}

export async function saveResearchResults(
  researchId: string,
  fitScore: number,
  results: ResearchResults
): Promise<void> {
  const { error } = await supabase
    .from('lab_prospect_research')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      fit_score: fitScore,
      research_results: JSON.parse(JSON.stringify(results)) as Json
    })
    .eq('id', researchId);

  if (error) throw error;
}

export async function deleteResearch(researchId: string): Promise<void> {
  const { error } = await supabase
    .from('lab_prospect_research')
    .delete()
    .eq('id', researchId);

  if (error) throw error;
}

export async function toggleResearchStar(researchId: string, isStarred: boolean): Promise<void> {
  const { error } = await supabase
    .from('lab_prospect_research')
    .update({ is_starred: isStarred })
    .eq('id', researchId);

  if (error) throw error;
}

// ============ Webhook URL ============

export async function getActiveWebhookUrl(): Promise<string> {
  const { data } = await supabase
    .from('webhook_testing')
    .select('webhook_url')
    .eq('is_active', true)
    .maybeSingle();

  return data?.webhook_url || 'https://example.com/webhook';
}
