import './globals.css';
import React from 'react';
import { AuthProvider } from '../components/AuthContext.jsx';
import AppLayout from '../components/layout/AppLayout';
import { Toaster } from 'sonner';

export const metadata = { title: 'StudyMate', description: 'Learning platform' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-slate-900 dark:text-slate-100 transition-colors">
        <AuthProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </AuthProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
