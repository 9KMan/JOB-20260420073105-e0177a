import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MedClaims Pro - Medical Claims Submission Platform',
  description: 'Professional SaaS platform for surgeons and medical coders to submit and manage insurance claims',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}