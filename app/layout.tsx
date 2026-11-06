import type { Metadata } from 'next';
import './globals.css';
import { PortalProvider } from '@/context/PortalContext';
import ToastContainer from '@/components/ToastContainer';

export const metadata: Metadata = {
  title: 'CISD HR Portal - Centre for International Strategic Dialogue',
  description: 'Enterprise Human Resource Management System for CISD',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-cisd-navy-900 selection:text-white">
        <PortalProvider>
          {children}
          <ToastContainer />
        </PortalProvider>
      </body>
    </html>
  );
}
