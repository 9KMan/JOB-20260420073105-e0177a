'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Sidebar } from '@/components/layout/sidebar';
import { patientsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const [patient, setPatient] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadPatient();
  }, [isAuthenticated, router, params.id]);

  const loadPatient = async () => {
    try {
      const data = await patientsApi.get(Number(params.id));
      setPatient(data);
    } catch (error) {
      console.error('Failed to load patient:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!patient) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Patient not found</p>
              <Button className="mt-4" onClick={() => router.push('/patients')}>
                Back to Patients
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {patient.first_name} {patient.last_name}
          </h1>
          <p className="text-gray-500 mt-1">Patient details</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Demographics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">{patient.date_of_birth || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{patient.gender || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{patient.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{patient.email || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Insurance Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Member ID</p>
                  <p className="font-medium">{patient.member_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Group Number</p>
                  <p className="font-medium">{patient.group_number || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{patient.address_line1 || 'N/A'}</p>
              {patient.address_line2 && <p>{patient.address_line2}</p>}
              <p>
                {patient.city || ''}, {patient.state || ''} {patient.zip_code || ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Claim History</CardTitle>
            </CardHeader>
            <CardContent>
              {claims.length === 0 ? (
                <p className="text-gray-500">No claims found for this patient</p>
              ) : (
                <div className="space-y-4">
                  {claims.map((claim: any) => (
                    <div key={claim.id} className="border-b pb-3 last:border-0">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{claim.claim_number}</p>
                          <p className="text-sm text-gray-500">
                            {claim.service_date ? formatDate(claim.service_date) : 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            claim.status === 'paid' ? 'bg-green-100 text-green-800' :
                            claim.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {claim.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
