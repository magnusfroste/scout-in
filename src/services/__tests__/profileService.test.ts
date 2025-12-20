import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { 
  getUserProfile, 
  getCompanyProfile, 
  getProfiles,
  upsertUserProfile,
  upsertCompanyProfile
} from '../profileService';

vi.mock('@/integrations/supabase/client');

describe('profileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('returns user profile when found', async () => {
      const mockProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        full_name: 'Test User',
        is_complete: true,
        credits: 5
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile, error: null })
          })
        })
      } as any);

      const result = await getUserProfile('user-123');

      expect(result).toEqual(mockProfile);
      expect(supabase.from).toHaveBeenCalledWith('lab_user_profiles');
    });

    it('returns null when profile not found', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
          })
        })
      } as any);

      const result = await getUserProfile('user-123');

      expect(result).toBeNull();
    });

    it('throws on database error', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: new Error('DB Error') })
          })
        })
      } as any);

      await expect(getUserProfile('user-123')).rejects.toThrow('DB Error');
    });
  });

  describe('getCompanyProfile', () => {
    it('returns company profile when found', async () => {
      const mockProfile = {
        id: 'company-123',
        user_id: 'user-123',
        company_name: 'Test Company',
        is_complete: true
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile, error: null })
          })
        })
      } as any);

      const result = await getCompanyProfile('user-123');

      expect(result).toEqual(mockProfile);
      expect(supabase.from).toHaveBeenCalledWith('lab_company_profiles');
    });
  });

  describe('getProfiles', () => {
    it('returns both profiles when found', async () => {
      const mockUserProfile = { id: 'up-123', full_name: 'Test User' };
      const mockCompanyProfile = { id: 'cp-123', company_name: 'Test Company' };

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'lab_user_profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: mockUserProfile, error: null })
              })
            })
          } as any;
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: mockCompanyProfile, error: null })
            })
          })
        } as any;
      });

      const result = await getProfiles('user-123');

      expect(result.userProfile).toEqual(mockUserProfile);
      expect(result.companyProfile).toEqual(mockCompanyProfile);
    });
  });

  describe('upsertUserProfile', () => {
    it('creates or updates user profile', async () => {
      const mockProfile = { id: 'profile-123', full_name: 'Updated Name' };
      
      vi.mocked(supabase.from).mockReturnValue({
        upsert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProfile, error: null })
          })
        })
      } as any);

      const formData = {
        full_name: 'Updated Name',
        role_in_organization: 'Developer',
        outreach_experience: 'intermediate',
        prospects_per_week: '5-10',
        communication_style: 'professional',
        introduction_style: 'direct',
        credibility_preference: [],
        preferred_contact_channel: [],
        followup_timing: '1-2 days',
        nonresponse_handling: 'follow-up',
        pain_points_focus: [],
        expertise_positioning: 'consultant',
        objection_handling: [],
        meeting_format: [],
        meeting_duration: '30 min',
        success_metrics: []
      };

      const result = await upsertUserProfile('user-123', formData);

      expect(result).toEqual(mockProfile);
      expect(supabase.from).toHaveBeenCalledWith('lab_user_profiles');
    });
  });
});
