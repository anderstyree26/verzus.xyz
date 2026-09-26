import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { GameRail } from '../components/GameRail';
import { TopHeader } from '../components/TopHeader';
import { PartyBar } from '../components/PartyBar';

export const metadata: Metadata = {
  title: 'VerzusXYZ — Universal Esports & FACEIT Arena',
  description: 'Skill-based esports matchmaking, party duels, and tournaments for any game verified by client-side OCR.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#08080C] text-white antialiased flex font-sans selection:bg-[#FF5500] selection:text-white overflow-x-hidden">
        <Providers>
          {/* Vertical Game Rail (FACEIT Left Rail) */}
          <GameRail />

          {/* Main App Workspace */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#0C0C12] overflow-x-hidden">
            <TopHeader />
            <main className="flex-1 p-3 sm:p-5 lg:p-6 pb-28 sm:pb-32 w-full max-w-[1600px] mx-auto">
              {children}
            </main>
          </div>

          {/* Persistent Bottom Party Dock */}
          <PartyBar />
        </Providers>
      </body>
    </html>
  );
}
