import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Webhook, Shield } from 'lucide-react';

interface WebhookEntry {
  id: string;
  webhook_url: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminPage() {
  const { isAdmin, isLoading: adminLoading } = useAdminCheck();
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<WebhookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (isAdmin) fetchWebhooks();
  }, [isAdmin]);

  const fetchWebhooks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('webhook_testing')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setWebhooks(data);
    setLoading(false);
  };

  const addWebhook = async () => {
    if (!newUrl.trim()) return;
    setAdding(true);

    const { error } = await supabase
      .from('webhook_testing')
      .insert({ webhook_url: newUrl.trim(), is_active: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Webhook added' });
      setNewUrl('');
      fetchWebhooks();
    }
    setAdding(false);
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    // If activating, deactivate all others first
    if (!currentActive) {
      await supabase
        .from('webhook_testing')
        .update({ is_active: false })
        .neq('id', id);
    }

    const { error } = await supabase
      .from('webhook_testing')
      .update({ is_active: !currentActive })
      .eq('id', id);

    if (!error) fetchWebhooks();
  };

  const deleteWebhook = async (id: string) => {
    const { error } = await supabase
      .from('webhook_testing')
      .delete()
      .eq('id', id);

    if (!error) {
      toast({ title: 'Webhook deleted' });
      fetchWebhooks();
    }
  };

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Admin</h1>
      </div>

      {/* Webhook Management */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Webhook className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Webhooks</h2>
        </div>

        {/* Add new */}
        <div className="flex gap-2">
          <Input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1"
          />
          <Button onClick={addWebhook} disabled={adding || !newUrl.trim()} size="sm">
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : webhooks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No webhooks configured.</p>
        ) : (
          <div className="space-y-2">
            {webhooks.map((wh) => (
              <div
                key={wh.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30"
              >
                <Switch
                  checked={wh.is_active ?? false}
                  onCheckedChange={() => toggleActive(wh.id, wh.is_active ?? false)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono truncate text-foreground">{wh.webhook_url}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(wh.created_at).toLocaleDateString()}{' '}
                    {wh.is_active && (
                      <span className="text-primary font-medium">• Active</span>
                    )}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteWebhook(wh.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
