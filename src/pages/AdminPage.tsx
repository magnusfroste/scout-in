import { Navigate } from 'react-router-dom';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Loader2, Shield } from 'lucide-react';
import { AdminStats } from '@/components/admin/AdminStats';
import { AdminWebhooks } from '@/components/admin/AdminWebhooks';
import { AdminUsers } from '@/components/admin/AdminUsers';

export default function AdminPage() {
  const { isAdmin, isLoading: adminLoading } = useAdminCheck();

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Admin</h1>
      </div>

      <AdminStats />
      <AdminUsers />
      <AdminWebhooks />
    </div>
  );
}
