import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildWebhookPayload, sendWebhookRequest } from '../webhookService';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('webhookService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('buildWebhookPayload', () => {
    it('builds enhanced webhook payload with all fields', () => {
      const formData = {
        company_name: 'Test Company',
        website_url: 'https://test.com',
        linkedin_url: 'https://linkedin.com/company/test',
        research_type: 'standard' as const,
        notes: 'Test notes'
      };

      const companyProfile = {
        id: 'cp-123',
        company_name: 'My Company',
        industry: 'Technology',
        communication_style: 'professional',
        target_industries: ['SaaS', 'Fintech']
      };

      const userProfile = {
        id: 'up-123',
        full_name: 'John Doe',
        communication_style: 'consultative',
        outreach_experience: 'expert'
      };

      const result = buildWebhookPayload(formData, companyProfile as any, userProfile as any, 'research-123');

      expect(result.prospect_data.company_name).toBe('Test Company');
      expect(result.prospect_data.website_url).toBe('https://test.com');
      expect(result.research_id).toBe('research-123');
      expect(result.company_profile).toEqual(companyProfile);
      expect(result.user_profile).toEqual(userProfile);
      expect(result.processing_hints).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('handles missing optional fields', () => {
      const formData = {
        company_name: 'Test Company',
        website_url: 'https://test.com',
        research_type: 'quick' as const
      };

      const result = buildWebhookPayload(formData, {} as any, {} as any, 'research-123');

      expect(result.prospect_data.company_name).toBe('Test Company');
      expect(result.prospect_data.notes).toBe('');
      expect(result.processing_hints.research_depth).toBe('quick');
    });
  });

  describe('sendWebhookRequest', () => {
    it('returns success on successful response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('{"status": "ok"}')
      });

      const payload = {
        prospect_data: { company_name: 'Test' },
        timestamp: new Date().toISOString()
      } as any;

      const result = await sendWebhookRequest('https://webhook.url', payload);

      expect(result.success).toBe(true);
      expect(result.response).toBe('{"status": "ok"}');
      expect(mockFetch).toHaveBeenCalledWith('https://webhook.url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'cors'
      });
    });

    it('returns error on failed response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error')
      });

      const result = await sendWebhookRequest('https://webhook.url', {} as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Webhook failed: 500');
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      const result = await sendWebhookRequest('https://unreachable.url', {} as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot reach');
    });

    it('handles generic errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Unknown error'));

      const result = await sendWebhookRequest('https://webhook.url', {} as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });
  });
});
