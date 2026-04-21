'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { claimsApi, patientsApi, providersApi } from '@/lib/api';
import { useState } from 'react';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import type { Claim, Patient, Provider } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, router]);

  const loadData = async () => {
    try {
      const [claimsRes, patientsRes, providersRes] = await Promise.all([
        claimsApi.list({ limit: 5 }),
        patientsApi.list({ limit: 5 }),
        providersApi.list({ limit: 5 }),
      ]);
      setClaims(claimsRes);
      setPatients(patientsRes);
      setProviders(providersRes);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const totalClaimsAmount = claims.reduce((sum, c) => sum + (c.amount || 0), 0);
  const pendingClaims = claims.filter(c => c.status === 'submitted' || c.status === 'draft').length;
  const paidClaims = claims.filter(c => c.status === 'paid').length;

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your medical claims activity</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Total Claims</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{claims.length}</div>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalClaimsAmount)}</div>
              <p className="text-xs text-gray-500 mt-1">Submitted value</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingClaims}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paidClaims}</div>
              <p className="text-xs text-gray-500 mt-1">Successfully paid</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Claims</CardTitle>
            </CardHeader>
            <CardContent>
              {claims.length === 0 ? (
                <p className="text-gray-500 text-sm">No claims yet</p>
              ) : (
                <div className="space-y-4">
                  {claims.map((claim) => (
                    <div key={claim.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">{claim.claim_number}</p>
                        <p className="text-sm text-gray-500">
                          {claim.patient?.first_name} {claim.patient?.last_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(claim.status)}`}>
                          {claim.status}
                        </span>
                        {claim.amount && (
                          <p className="text-sm font-medium mt-1">{formatCurrency(Number(claim.amount))}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Patients & Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Patients: {patients.length}</p>
                  {patients.slice(0, 3).map((patient) => (
                    <p key={patient.id} className="text-sm">
                      {patient.first_name} {patient.last_name}
                    </p>
                  ))}
                </div>
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium text-gray-500 mb-2">Providers: {providers.length}</p>
                  {providers.slice(0, 3).map((provider) => (
                    <p key={provider.id} className="text-sm">
                      {provider.first_name} {provider.last_name} {provider.credentials && `(${provider.credentials})`}
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}