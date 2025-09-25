import { supabase } from '@/integrations/supabase/client';

export interface N8nAnalysisResponse {
  fit_score?: number;
  status?: string;
  executive_summary?: string;
  strategic_fit?: string;
  decision_makers?: string;
  change_capacity?: string;
  challenges_position?: string;
  technology_profile?: string;
  business_impact?: string;
  contact_strategy?: string;
}

/**
 * Parses n8n response and updates the research record in the database
 * Now handles pure markdown strings within minimal JSON wrapper
 */
export const parseAndSaveN8nResponse = async (
  responseText: string, 
  researchId: string,
  prospectCompanyName: string
): Promise<{ success: boolean; fitScore?: number; error?: string }> => {
  try {
    const responseData = JSON.parse(responseText);
    const analysisOutput: N8nAnalysisResponse = Array.isArray(responseData) 
      ? responseData[0].output 
      : responseData.output;
    
    if (analysisOutput && typeof analysisOutput.fit_score === 'number') {
      // Store direct markdown strings from new n8n prompt
      const researchResults = {
        executive_summary: analysisOutput.executive_summary || '',
        strategic_fit: analysisOutput.strategic_fit || '',
        decision_makers: analysisOutput.decision_makers || '',
        change_capacity: analysisOutput.change_capacity || '',
        challenges_position: analysisOutput.challenges_position || '',
        technology_profile: analysisOutput.technology_profile || '',
        business_impact: analysisOutput.business_impact || '',
        contact_strategy: analysisOutput.contact_strategy || ''
      };

      // Update the research record with parsed analysis
      const { error } = await supabase
        .from('lab_prospect_research')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          fit_score: analysisOutput.fit_score,
          research_results: researchResults as any,
          decision_makers: analysisOutput.decision_makers || '',
          contact_strategy: analysisOutput.contact_strategy || '',
          value_proposition: analysisOutput.business_impact || ''
        })
        .eq('id', researchId);
      
      if (error) throw error;
      
      console.log('💾 Analysis saved to database with pure markdown content');
      
      return { 
        success: true, 
        fitScore: analysisOutput.fit_score 
      };
    } else {
      return { 
        success: false, 
        error: 'Invalid analysis response format - missing fit_score' 
      };
    }
  } catch (parseError) {
    console.error('❌ Failed to parse analysis response:', parseError);
    return { 
      success: false, 
      error: parseError instanceof Error ? parseError.message : 'Unknown parsing error' 
    };
  }
};