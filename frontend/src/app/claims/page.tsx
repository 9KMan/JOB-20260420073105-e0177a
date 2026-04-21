'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Sidebar } from '@/components/layout/sidebar';
import { claimsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import type { Claim } from '@/types';

export default function ClaimsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadClaims();
  }, [isAuthenticated, router]);

  const loadClaims = async () => {
    try {
      const data = await claimsApi.list();
      setClaims(data);
    } catch (error) {
      console.error('Failed to load claims:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Claims</h1>
            <p className="text-gray-500 mt-1">Manage your medical claims</p>
          </div>
          <Button onClick={() => router.push('/claims/new')}>
            New Claim
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Claims</CardTitle>
          </CardHeader>
          <CardContent>
            {claims.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No claims found. Create your first claim.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Claim #</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Patient</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Provider</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.map((claim) => (
                      <tr key={claim.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/claims/${claim.id}`)}>
                        <td className="py-3 px-4 font-medium">{claim.claim_number}</td>
                        <td className="py-3 px-4">
                          {claim.patient ? `${claim.patient.first_name} ${claim.patient.last_name}` : `-`}
                        </td>
                        <td className="py-3 px-4">
                          {claim.provider ? `${claim.provider.first_name} ${claim.provider.last_name}` : `-`}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(claim.status)}`}>
                            {claim.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {claim.amount ? formatCurrency(Number(claim.amount)) : `-`}
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-sm">
                          {formatDate(claim.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}