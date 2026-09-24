import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '../components/Navbar';

export const metadata: Metadata = {
  title: 'VerzusXYZ — Universal Esports Platform',
  description: 'Skill-based esports matches and tournaments for any game verified by OCR and computer vision.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-surface text-white antialiased flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
          <footer className="border-t border-surface-border py-8 text-center text-xs text-gray-500">
            <p>© {new Date().getFullYear()} VerzusXYZ Esports. Free-tier open architecture. Zero paid game APIs required.</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
