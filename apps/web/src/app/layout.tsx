import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '../components/Navbar';
import { PartyBar } from '../components/PartyBar';

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
      <body className="min-h-screen bg-[#0C0C12] text-white antialiased flex flex-col font-sans selection:bg-[#FF5500] selection:text-white">
        <Providers>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-28 sm:pb-32">
            {children}
          </main>
          <footer className="border-t border-[#1E1E2C] py-8 pb-28 text-center text-xs text-gray-500">
            <p>© {new Date().getFullYear()} VerzusXYZ Esports · FACEIT-Standard Competitive Engine · Universal OCR Verification</p>
          </footer>
          <PartyBar />
        </Providers>
      </body>
    </html>
  );
}
