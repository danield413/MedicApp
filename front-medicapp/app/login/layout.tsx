import { Meteors } from '@/components/ui';
import React from 'react';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex items-center justify-center min-h-screen p-4">
      {children}
      <Meteors />
    </main>
  );
}
