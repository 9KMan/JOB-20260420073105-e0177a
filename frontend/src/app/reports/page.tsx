'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import axios from 'axios';

interface ARAgingBucket {
  count: number;
  amount: number;
}

interface ARAgingData {
  buckets: Record<string, ARAgingBucket>;
  total_outstanding: number;
  total_claims: number;
}

interface DenialData {
  overall_denial_rate: number;
  total_claims: number;
  denied_claims: number;
  by_payer: Array<{
    payer: string;
    total: number;
    denied: number;
    rate: number;
  }>;
}

export default function ReportsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [arAging, setArAging] = useState<ARAgingData | null>(null);
  const [denialRate, setDenialRate] = useState<DenialData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadReports();
  }, [isAuthenticated, router]);

  const loadReports = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [arRes, denialRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/reports/ar-aging`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/reports/denial-rate`, { headers })
      ]);

      setArAging(arRes.data);
      setDenialRate(denialRes.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load reports');
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Financial and operational insights</p>
        </div>

        {error && (
          <Card className="mb-6">
            <CardContent className="text-red-600">{error}</CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">Total Outstanding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary-600">
                  {arAging ? formatCurrency(arAging.total_outstanding) : '$0.00'}
                </div>
                <p className="text-xs text-gray-500 mt-1">{arAging?.total_claims || 0} claims</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">Denial Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {denialRate?.overall_denial_rate || 0}%
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {denialRate?.denied_claims || 0} of {denialRate?.total_claims || 0} claims
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">0-30 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {arAging ? formatCurrency(arAging.buckets['0-30']?.amount || 0) : '$0.00'}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {arAging?.buckets['0-30']?.count || 0} claims
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">31-60 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {arAging ? formatCurrency(arAging.buckets['31-60']?.amount || 0) : '$0.00'}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {arAging?.buckets['31-60']?.count || 0} claims
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>A/R Aging Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {['0-30', '31-60', '61-90', '90+'].map((bucket) => (
                  <div key={bucket} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">{bucket} Days</p>
                    <p className="text-xl font-bold mt-1">
                      {arAging ? formatCurrency(arAging.buckets[bucket]?.amount || 0) : '$0'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {arAging?.buckets[bucket]?.count || 0} claims
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Denial Analysis by Payer</CardTitle>
            </CardHeader>
            <CardContent>
              {!denialRate?.by_payer?.length ? (
                <p className="text-gray-500 text-center py-8">No denial data available</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Payer</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Total Claims</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Denied</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Denial Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {denialRate.by_payer.map((item, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-3 px-4 font-medium">{item.payer || 'Unknown'}</td>
                          <td className="py-3 px-4 text-right">{item.total}</td>
                          <td className="py-3 px-4 text-right">{item.denied}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              item.rate > 20 ? 'bg-red-100 text-red-800' :
                              item.rate > 10 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {item.rate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
