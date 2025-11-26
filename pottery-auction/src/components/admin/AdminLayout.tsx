'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  backHref?: string;
}

export default function AdminLayout({ children, title, backHref = '/admin' }: AdminLayoutProps) {
  const router = useRouter();
  const { userProfile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-medium-cream/30 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-medium-green border-t-transparent rounded-full animate-pottery-wheel" />
      </div>
    );
  }

  if (!userProfile?.isAdmin) {
    return (
      <div className="min-h-screen bg-medium-cream/30 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-medium-dark mb-4">Access Denied</h1>
          <p className="text-medium-dark/70">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-medium-cream/30">
      <div className="medium-gradient text-white py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(backHref)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
