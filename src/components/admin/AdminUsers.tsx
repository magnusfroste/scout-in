import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, Coins, Search, Plus, Minus, ShieldCheck, ShieldOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface UserRow {
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  credits: number | null;
  full_name: string | null;
  profile_complete: boolean | null;
  research_count: number;
  role: string | null;
}

export function AdminUsers() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [creditAmounts, setCreditAmounts] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<string | null>(null);
  const [togglingRole, setTogglingRole] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);

    // Fetch profiles, lab_user_profiles, roles, and research counts
    const [profilesRes, labProfilesRes, rolesRes, researchRes] = await Promise.all([
      supabase.from('profiles').select('user_id, email, first_name, last_name'),
      supabase.from('lab_user_profiles').select('user_id, full_name, credits, is_complete'),
      supabase.from('user_roles').select('user_id, role'),
      supabase.from('lab_prospect_research').select('user_id'),
    ]);

    const profiles = profilesRes.data || [];
    const labProfiles = labProfilesRes.data || [];
    const roles = rolesRes.data || [];
    const research = researchRes.data || [];

    // Count research per user
    const researchCounts: Record<string, number> = {};
    research.forEach((r) => {
      researchCounts[r.user_id] = (researchCounts[r.user_id] || 0) + 1;
    });

    // Merge data
    const merged: UserRow[] = profiles.map((p) => {
      const lab = labProfiles.find((lp) => lp.user_id === p.user_id);
      const role = roles.find((r) => r.user_id === p.user_id);
      return {
        user_id: p.user_id,
        email: p.email,
        first_name: p.first_name,
        last_name: p.last_name,
        credits: lab?.credits ?? null,
        full_name: lab?.full_name || null,
        profile_complete: lab?.is_complete ?? null,
        research_count: researchCounts[p.user_id] || 0,
        role: role?.role || null,
      };
    });

    setUsers(merged);
    setLoading(false);
  };

  const adjustCredits = async (userId: string, amount: number) => {
    if (amount === 0) return;
    setUpdating(userId);

    // Get current credits
    const { data: current } = await supabase
      .from('lab_user_profiles')
      .select('credits')
      .eq('user_id', userId)
      .maybeSingle();

    if (!current) {
      toast({ title: 'Error', description: 'User has no profile yet', variant: 'destructive' });
      setUpdating(null);
      return;
    }

    const newCredits = Math.max(0, (current.credits || 0) + amount);

    const { error: updateError } = await supabase
      .from('lab_user_profiles')
      .update({ credits: newCredits })
      .eq('user_id', userId);

    if (updateError) {
      toast({ title: 'Error', description: updateError.message, variant: 'destructive' });
    } else {
      // Log transaction
      await supabase.from('lab_credit_transactions').insert({
        user_id: userId,
        amount: amount,
        description: `Admin adjustment: ${amount > 0 ? '+' : ''}${amount} credits`,
      });

      toast({ title: 'Credits updated', description: `${amount > 0 ? '+' : ''}${amount} credits` });
      setCreditAmounts((prev) => ({ ...prev, [userId]: '' }));
      fetchUsers();
    }
    setUpdating(null);
  };

  const toggleAdmin = async (userId: string, currentRole: string | null) => {
    if (userId === currentUser?.id) {
      toast({ title: 'Error', description: 'Du kan inte ändra din egen roll', variant: 'destructive' });
      return;
    }
    setTogglingRole(userId);

    if (currentRole === 'admin') {
      // Remove admin role
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Admin-roll borttagen' });
        fetchUsers();
      }
    } else {
      // Add admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin' });

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Admin-roll tilldelad' });
        fetchUsers();
      }
    }
    setTogglingRole(null);
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q)
    );
  });

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Users</h2>
          <Badge variant="secondary" className="text-xs">{users.length}</Badge>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((user) => (
            <div
              key={user.user_id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'No name'}
                  </p>
                  {user.role && (
                    <Badge variant="outline" className="text-[10px]">{user.role}</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={togglingRole === user.user_id || user.user_id === currentUser?.id}
                    onClick={() => toggleAdmin(user.user_id, user.role)}
                    title={user.role === 'admin' ? 'Ta bort admin' : 'Gör till admin'}
                  >
                    {togglingRole === user.user_id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : user.role === 'admin' ? (
                      <ShieldOff className="h-3.5 w-3.5 text-destructive" />
                    ) : (
                      <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </Button>
                  {user.profile_complete && (
                    <Badge className="text-[10px] bg-primary/10 text-primary border-0">Profile ✓</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  {user.research_count} research{user.research_count !== 1 ? 'es' : ''}
                </p>
              </div>

              {/* Credits section */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right mr-2">
                  <div className="flex items-center gap-1">
                    <Coins className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-semibold text-foreground">
                      {user.credits ?? '—'}
                    </span>
                  </div>
                </div>
                <Input
                  type="number"
                  value={creditAmounts[user.user_id] || ''}
                  onChange={(e) =>
                    setCreditAmounts((prev) => ({ ...prev, [user.user_id]: e.target.value }))
                  }
                  placeholder="±"
                  className="w-16 h-8 text-xs text-center"
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  disabled={!creditAmounts[user.user_id] || updating === user.user_id}
                  onClick={() => {
                    const amt = parseInt(creditAmounts[user.user_id] || '0');
                    if (amt) adjustCredits(user.user_id, amt);
                  }}
                >
                  {updating === user.user_id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Plus className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No users found.</p>
          )}
        </div>
      )}
    </Card>
  );
}
