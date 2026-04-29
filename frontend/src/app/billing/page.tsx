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
import { Input } from '@/components/ui/input';

export default function BillingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadClaims();
  }, [isAuthenticated, router]);

  const loadClaims = async () => {
    try {
      const data = await claimsApi.list({ limit: 100 });
      setClaims(data);
    } catch (error) {
      console.error('Failed to load claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostPayment = async () => {
    if (!selectedClaim || !paymentAmount) return;
    setProcessing(true);
    try {
      // This would call the backend API to post payment
      // For now, we'll just close the modal
      setShowPaymentModal(false);
      setPaymentAmount('');
      setPaymentMethod('');
      setPaymentRef('');
      loadClaims();
    } catch (error) {
      console.error('Failed to post payment:', error);
    } finally {
      setProcessing(false);
    }
  };

  const openPaymentModal = (claim: Claim) => {
    setSelectedClaim(claim);
    setPaymentAmount(claim.amount ? String(claim.amount - (claim as any).paid_amount || 0) : '');
    setShowPaymentModal(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const claimsWithBalance = claims.filter(c => c.status !== 'paid' && c.amount);

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
          <p className="text-gray-500 mt-1">Manage claim payments and billing</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Claims with Outstanding Balance</CardTitle>
            </CardHeader>
            <CardContent>
              {claimsWithBalance.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No outstanding claims</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Claim #</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Patient</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Balance</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claimsWithBalance.map((claim) => {
                        const balance = (claim.amount || 0) - ((claim as any).paid_amount || 0);
                        return (
                          <tr key={claim.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{claim.claim_number}</td>
                            <td className="py-3 px-4">
                              {claim.patient ? `${claim.patient.first_name} ${claim.patient.last_name}` : `-`}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(claim.status)}`}>
                                {claim.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">{formatCurrency(Number(claim.amount))}</td>
                            <td className="py-3 px-4 font-medium text-primary-600">
                              {formatCurrency(balance)}
                            </td>
                            <td className="py-3 px-4">
                              <Button size="sm" onClick={() => openPaymentModal(claim)}>
                                Post Payment
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {showPaymentModal && selectedClaim && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Post Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Claim</p>
                    <p className="font-medium">{selectedClaim.claim_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <Input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select method</option>
                      <option value="check">Check</option>
                      <option value="eft">EFT</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                    <Input
                      type="text"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder="Check #, EFT trace #, etc."
                    />
                  </div>
                  <div className="flex justify-end gap-4 pt-4">
                    <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handlePostPayment} disabled={processing || !paymentAmount}>
                      {processing ? 'Processing...' : 'Post Payment'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
