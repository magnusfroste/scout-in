import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Loader2, Activity, Users, Coins, FileSearch } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalCredits: number;
  totalResearch: number;
  completedResearch: number;
}

export function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [profilesRes, labProfilesRes, researchRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('lab_user_profiles').select('credits'),
      supabase.from('lab_prospect_research').select('status'),
    ]);

    const totalCredits = (labProfilesRes.data || []).reduce((sum, p) => sum + (p.credits || 0), 0);
    const research = researchRes.data || [];

    setStats({
      totalUsers: profilesRes.count || 0,
      totalCredits,
      totalResearch: research.length,
      completedResearch: research.filter((r) => r.status === 'completed').length,
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { label: 'Users', value: stats.totalUsers, icon: Users },
    { label: 'Total Credits', value: stats.totalCredits, icon: Coins },
    { label: 'Research', value: stats.totalResearch, icon: FileSearch },
    { label: 'Completed', value: stats.completedResearch, icon: Activity },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((c) => (
        <Card key={c.label} className="p-4 flex items-center gap-3">
          <c.icon className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-2xl font-bold text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
