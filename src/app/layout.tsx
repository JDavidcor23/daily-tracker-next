import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { SupabaseProvider } from '@/context/SupabaseContext';
import Layout from '@/components/Layout';
import { TOAST_DURATION_MS } from '@/lib/constants';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Daily Tracker",
  description: "AI-powered personal daily tracker",
};

const TOAST_STYLE = {
  borderRadius: '12px',
  background: '#1e293b',
  color: '#f8fafc',
  fontSize: '14px',
  fontWeight: 500,
} as const;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <SupabaseProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: TOAST_DURATION_MS,
              style: TOAST_STYLE,
              success: {
                iconTheme: { primary: '#6366f1', secondary: '#white' },
              },
            }}
          />
          <Layout>
            {children}
          </Layout>
        </SupabaseProvider>
      </body>
    </html>
  );
}
