'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Sidebar } from '@/components/layout/sidebar';
import { claimsApi, patientsApi, providersApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function NewClaimPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    patient_id: '',
    provider_id: '',
    claim_type: 'professional',
    service_date: '',
    diagnosis_codes: '',
    procedure_codes: '',
    payer_name: '',
    payer_id: '',
    amount: '',
    notes: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, router]);

  const loadData = async () => {
    try {
      const [patientsRes, providersRes] = await Promise.all([
        patientsApi.list({ limit: 100 }),
        providersApi.list({ limit: 100 })
      ]);
      setPatients(patientsRes);
      setProviders(providersRes);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        patient_id: parseInt(formData.patient_id),
        provider_id: parseInt(formData.provider_id),
        amount: formData.amount ? parseFloat(formData.amount) : undefined
      };

      await claimsApi.create(payload);
      router.push('/claims');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create claim');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">New Claim</h1>
          <p className="text-gray-500 mt-1">Create a new medical claim</p>
        </div>

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
                  <select
                    name="patient_id"
                    value={formData.patient_id}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select patient</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.first_name} {p.last_name} ({p.member_id || 'No member ID'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provider *</label>
                  <select
                    name="provider_id"
                    value={formData.provider_id}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select provider</option>
                    {providers.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.first_name} {p.last_name} {p.credentials && `(${p.credentials})`} - {p.npi}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Claim Type *</label>
                  <select
                    name="claim_type"
                    value={formData.claim_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="professional">Professional</option>
                    <option value="institutional">Institutional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Date *</label>
                  <input
                    type="date"
                    name="service_date"
                    value={formData.service_date}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payer Name</label>
                  <Input
                    type="text"
                    name="payer_name"
                    value={formData.payer_name}
                    onChange={handleChange}
                    placeholder="Blue Cross Blue Shield"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payer ID</label>
                  <Input
                    type="text"
                    name="payer_id"
                    value={formData.payer_id}
                    onChange={handleChange}
                    placeholder="BCBS001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                  <Input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="1500.00"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis Codes (ICD-10)</label>
                  <Input
                    type="text"
                    name="diagnosis_codes"
                    value={formData.diagnosis_codes}
                    onChange={handleChange}
                    placeholder="J06.9, J20.9"
                  />
                  <p className="text-xs text-gray-500 mt-1">Comma-separated ICD-10 codes</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Procedure Codes (CPT)</label>
                  <Input
                    type="text"
                    name="procedure_codes"
                    value={formData.procedure_codes}
                    onChange={handleChange}
                    placeholder="99213, 87880"
                  />
                  <p className="text-xs text-gray-500 mt-1">Comma-separated CPT codes</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Additional notes for this claim..."
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.push('/claims')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Claim'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
