import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { 
  checkUserCredits, 
  getUserCredits, 
  deductCredits, 
  addCredits,
  getCreditTransactions 
} from '../creditService';
import { RESEARCH_CREDIT_COST } from '@/types/credits';

// Mock supabase
vi.mock('@/integrations/supabase/client');

describe('creditService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkUserCredits', () => {
    it('returns hasCredits: true when user has sufficient credits', async () => {
      const mockData = { credits: 5 };
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: mockData, error: null })
          })
        })
      } as any);

      const result = await checkUserCredits('user-123');

      expect(result.hasCredits).toBe(true);
      expect(result.currentBalance).toBe(5);
    });

    it('returns hasCredits: false when user has no credits', async () => {
      const mockData = { credits: 0 };
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: mockData, error: null })
          })
        })
      } as any);

      const result = await checkUserCredits('user-123');

      expect(result.hasCredits).toBe(false);
      expect(result.currentBalance).toBe(0);
    });

    it('returns hasCredits: false when user profile not found', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
          })
        })
      } as any);

      const result = await checkUserCredits('user-123');

      expect(result.hasCredits).toBe(false);
      expect(result.currentBalance).toBe(0);
    });

    it('throws error on database failure', async () => {
      const mockError = new Error('Database error');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: mockError })
          })
        })
      } as any);

      await expect(checkUserCredits('user-123')).rejects.toThrow('Database error');
    });
  });

  describe('getUserCredits', () => {
    it('returns credit balance', async () => {
      const mockData = { credits: 10 };
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: mockData, error: null })
          })
        })
      } as any);

      const result = await getUserCredits('user-123');

      expect(result).toBe(10);
    });

    it('returns 0 when user not found', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
          })
        })
      } as any);

      const result = await getUserCredits('user-123');

      expect(result).toBe(0);
    });
  });

  describe('RESEARCH_CREDIT_COST', () => {
    it('is defined as 1 credit', () => {
      expect(RESEARCH_CREDIT_COST).toBe(1);
    });
  });
});
