'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Sidebar } from '@/components/layout/sidebar';
import { claimsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import type { Claim } from '@/types';

export default function ClaimDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadClaim();
  }, [isAuthenticated, router, params.id]);

  const loadClaim = async () => {
    try {
      const data = await claimsApi.get(Number(params.id));
      setClaim(data);
    } catch (error) {
      console.error('Failed to load claim:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setActionLoading(true);
    try {
      await claimsApi.submit(Number(params.id));
      loadClaim();
    } catch (error) {
      console.error('Failed to submit claim:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this claim?')) return;
    setActionLoading(true);
    try {
      await claimsApi.delete(Number(params.id));
      router.push('/claims');
    } catch (error) {
      console.error('Failed to delete claim:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!claim) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Claim not found</p>
              <Button className="mt-4" onClick={() => router.push('/claims')}>
                Back to Claims
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Claim {claim.claim_number}</h1>
            <p className="text-gray-500 mt-1">Claim details and management</p>
          </div>
          <div className="flex gap-4">
            {claim.status === 'draft' && (
              <Button onClick={handleSubmit} disabled={actionLoading}>
                {actionLoading ? 'Submitting...' : 'Submit Claim'}
              </Button>
            )}
            <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
              Delete
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Claim Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(claim.status)}`}>
                    {claim.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Claim Number</p>
                  <p className="font-medium">{claim.claim_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Claim Type</p>
                  <p className="font-medium">{claim.claim_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">{claim.amount ? formatCurrency(Number(claim.amount)) : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Service Date</p>
                  <p className="font-medium">{claim.service_date ? formatDate(claim.service_date) : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submission Date</p>
                  <p className="font-medium">{claim.submission_date ? formatDate(claim.submission_date) : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payer</p>
                  <p className="font-medium">{claim.payer_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payer ID</p>
                  <p className="font-medium">{claim.payer_id || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient</CardTitle>
              </CardHeader>
              <CardContent>
                {claim.patient ? (
                  <div>
                    <p className="font-medium">{claim.patient.first_name} {claim.patient.last_name}</p>
                    <p className="text-sm text-gray-500">Member ID: {claim.patient.member_id || 'N/A'}</p>
                    <p className="text-sm text-gray-500">Group: {claim.patient.group_number || 'N/A'}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">No patient information</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Provider</CardTitle>
              </CardHeader>
              <CardContent>
                {claim.provider ? (
                  <div>
                    <p className="font-medium">
                      {claim.provider.first_name} {claim.provider.last_name}
                      {claim.provider.credentials && `, ${claim.provider.credentials}`}
                    </p>
                    <p className="text-sm text-gray-500">NPI: {claim.provider.npi}</p>
                    <p className="text-sm text-gray-500">{claim.provider.specialty || 'General Practice'}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">No provider information</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Diagnosis & Procedures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Diagnosis Codes (ICD-10)</p>
                  <p className="font-mono">{claim.diagnosis_codes || 'None'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Procedure Codes (CPT)</p>
                  <p className="font-mono">{claim.procedure_codes || 'None'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {claim.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{claim.notes}</p>
              </CardContent>
            </Card>
          )}

          {claim.rejection_reason && (
            <Card>
              <CardHeader>
                <CardTitle>Rejection Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600">{claim.rejection_reason}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
