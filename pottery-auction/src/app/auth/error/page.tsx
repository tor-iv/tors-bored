'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-medium-cream/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-theme-error-light rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="text-theme-error" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Authentication Error
        </h1>
        <p className="text-gray-600 mb-6">
          There was a problem signing you in. The link may have expired or already been used.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-medium-green text-white rounded-lg hover:bg-medium-green/90 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
