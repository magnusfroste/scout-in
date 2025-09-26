import { supabase } from '@/integrations/supabase/client';

export interface N8nAnalysisResponse {
  fit_score?: number;
  [key: string]: any; // Allow any additional fields from n8n
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
    
    if (analysisOutput && typeof analysisOutput.executive_summary?.fit_score === 'number') {
      // Dynamically capture ALL fields from n8n response except fit_score
      const researchResults = Object.entries(analysisOutput)
        .filter(([key]) => key !== 'fit_score' && key !== 'status')
        .reduce((acc, [key, value]) => ({
          ...acc,
          [key]: value || ''
        }), {});

      // Update the research record with parsed analysis
      const { error } = await supabase
        .from('lab_prospect_research')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          fit_score: analysisOutput.executive_summary.fit_score,
          research_results: researchResults as any
        })
        .eq('id', researchId);
      
      if (error) throw error;
      
      console.log('💾 Analysis saved to database with pure markdown content');
      
      return { 
        success: true, 
        fitScore: analysisOutput.executive_summary.fit_score 
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