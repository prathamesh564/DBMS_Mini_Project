'use client';

import { Suspense } from 'react';
import LoginPage from '../login/page';

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
