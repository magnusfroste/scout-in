import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { 
  createResearchRecord,
  getResearchById,
  getUserResearchList,
  updateResearchStatus,
  toggleResearchStar,
  deleteResearch,
  getActiveWebhookUrl
} from '../researchService';

vi.mock('@/integrations/supabase/client');

describe('researchService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createResearchRecord', () => {
    it('creates a new research record', async () => {
      const mockResearch = {
        id: 'research-123',
        prospect_company_name: 'Test Company',
        status: 'pending'
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockResearch, error: null })
          })
        })
      } as any);

      const formData = {
        company_name: 'Test Company',
        website_url: 'https://test.com',
        research_type: 'standard' as const
      };

      const result = await createResearchRecord(
        'user-123',
        'company-profile-123',
        'user-profile-123',
        formData,
        'https://webhook.url'
      );

      expect(result).toEqual(mockResearch);
      expect(supabase.from).toHaveBeenCalledWith('lab_prospect_research');
    });

    it('throws on database error', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: new Error('Insert failed') })
          })
        })
      } as any);

      const formData = {
        company_name: 'Test Company',
        website_url: 'https://test.com',
        research_type: 'standard' as const
      };

      await expect(
        createResearchRecord('user-123', 'cp-123', 'up-123', formData, 'https://webhook.url')
      ).rejects.toThrow('Insert failed');
    });
  });

  describe('getResearchById', () => {
    it('returns research when found', async () => {
      const mockResearch = {
        id: 'research-123',
        prospect_company_name: 'Test Company'
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: mockResearch, error: null })
          })
        })
      } as any);

      const result = await getResearchById('research-123');

      expect(result).toEqual(mockResearch);
    });

    it('returns null when not found', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
          })
        })
      } as any);

      const result = await getResearchById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getUserResearchList', () => {
    it('returns list of research for user', async () => {
      const mockList = [
        { id: 'r1', prospect_company_name: 'Company 1' },
        { id: 'r2', prospect_company_name: 'Company 2' }
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockList, error: null })
          })
        })
      } as any);

      const result = await getUserResearchList('user-123');

      expect(result).toEqual(mockList);
      expect(result).toHaveLength(2);
    });

    it('returns empty array when no research found', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: null })
          })
        })
      } as any);

      const result = await getUserResearchList('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('updateResearchStatus', () => {
    it('updates research status', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        })
      } as any);

      await expect(
        updateResearchStatus('research-123', 'completed')
      ).resolves.not.toThrow();
    });

    it('updates status with error message', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        })
      } as any);

      await expect(
        updateResearchStatus('research-123', 'failed', 'Connection timeout')
      ).resolves.not.toThrow();
    });
  });

  describe('toggleResearchStar', () => {
    it('toggles star status', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        })
      } as any);

      await expect(
        toggleResearchStar('research-123', true)
      ).resolves.not.toThrow();
    });
  });

  describe('deleteResearch', () => {
    it('deletes research record', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        })
      } as any);

      await expect(deleteResearch('research-123')).resolves.not.toThrow();
    });
  });

  describe('getActiveWebhookUrl', () => {
    it('returns active webhook URL', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ 
              data: { webhook_url: 'https://active.webhook.url' }, 
              error: null 
            })
          })
        })
      } as any);

      const result = await getActiveWebhookUrl();

      expect(result).toBe('https://active.webhook.url');
    });

    it('returns default URL when none active', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
          })
        })
      } as any);

      const result = await getActiveWebhookUrl();

      expect(result).toBe('https://example.com/webhook');
    });
  });
});
