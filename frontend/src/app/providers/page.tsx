'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Sidebar } from '@/components/layout/sidebar';
import { providersApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import type { Provider } from '@/types';

export default function ProvidersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadProviders();
  }, [isAuthenticated, router]);

  const loadProviders = async () => {
    try {
      const data = await providersApi.list();
      setProviders(data);
    } catch (error) {
      console.error('Failed to load providers:', error);
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
            <h1 className="text-3xl font-bold text-gray-900">Providers</h1>
            <p className="text-gray-500 mt-1">Manage your provider network</p>
          </div>
          <Button onClick={() => router.push('/providers/new')}>
            Add Provider
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Providers</CardTitle>
          </CardHeader>
          <CardContent>
            {providers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No providers found. Add your first provider.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {providers.map((provider) => (
                  <div key={provider.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/providers/${provider.id}`)}>
                    <div className="mb-2">
                      <h3 className="font-medium">
                        {provider.first_name} {provider.last_name}
                        {provider.credentials && <span className="text-gray-500">, {provider.credentials}</span>}
                      </h3>
                      {provider.specialty && (
                        <p className="text-sm text-primary-600">{provider.specialty}</p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">NPI: {provider.npi}</p>
                    {provider.specialty && (
                      <p className="text-sm text-gray-500">{provider.phone || 'No phone'}</p>
                    )}
                    {provider.city && provider.state && (
                      <p className="text-sm text-gray-500">{provider.city}, {provider.state}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">Added {formatDate(provider.created_at)}</p>
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