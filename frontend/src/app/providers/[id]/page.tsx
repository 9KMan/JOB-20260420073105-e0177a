'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Sidebar } from '@/components/layout/sidebar';
import { providersApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ProviderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadProvider();
  }, [isAuthenticated, router, params.id]);

  const loadProvider = async () => {
    try {
      const data = await providersApi.get(Number(params.id));
      setProvider(data);
    } catch (error) {
      console.error('Failed to load provider:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!provider) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Provider not found</p>
              <Button className="mt-4" onClick={() => router.push('/providers')}>
                Back to Providers
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
            {provider.first_name} {provider.last_name}
            {provider.credentials && `, ${provider.credentials}`}
          </h1>
          <p className="text-gray-500 mt-1">Provider details</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Provider Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">NPI</p>
                  <p className="font-medium font-mono">{provider.npi}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Specialty</p>
                  <p className="font-medium">{provider.specialty || 'General Practice'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tax ID</p>
                  <p className="font-medium">{provider.tax_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{provider.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fax</p>
                  <p className="font-medium">{provider.fax || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{provider.address_line1 || 'N/A'}</p>
              {provider.address_line2 && <p>{provider.address_line2}</p>}
              <p>
                {provider.city || ''}, {provider.state || ''} {provider.zip_code || ''}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
