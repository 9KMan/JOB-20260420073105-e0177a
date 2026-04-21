'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Sidebar } from '@/components/layout/sidebar';
import { patientsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import type { Patient } from '@/types';

export default function PatientsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadPatients();
  }, [isAuthenticated, router]);

  const loadPatients = async () => {
    try {
      const data = await patientsApi.list();
      setPatients(data);
    } catch (error) {
      console.error('Failed to load patients:', error);
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
            <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-500 mt-1">Manage your patient records</p>
          </div>
          <Button onClick={() => router.push('/patients/new')}>
            Add Patient
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Patients</CardTitle>
          </CardHeader>
          <CardContent>
            {patients.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No patients found. Add your first patient.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {patients.map((patient) => (
                  <div key={patient.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/patients/${patient.id}`)}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{patient.first_name} {patient.last_name}</h3>
                      <span className={`w-2 h-2 rounded-full ${patient.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    </div>
                    {patient.member_id && (
                      <p className="text-sm text-gray-500">Member ID: {patient.member_id}</p>
                    )}
                    {patient.phone && (
                      <p className="text-sm text-gray-500">{patient.phone}</p>
                    )}
                    {patient.email && (
                      <p className="text-sm text-gray-500">{patient.email}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">Added {formatDate(patient.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}