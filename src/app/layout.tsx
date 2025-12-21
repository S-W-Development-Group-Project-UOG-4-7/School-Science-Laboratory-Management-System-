import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Science Lab Management System',
  description: 'School Science Lab Management System for Sri Lankan Government School',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
