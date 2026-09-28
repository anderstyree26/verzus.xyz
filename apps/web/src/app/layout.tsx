import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { GameRail } from '../components/GameRail';
import { TopHeader } from '../components/TopHeader';
import { PartyBar } from '../components/PartyBar';

export const metadata: Metadata = {
  title: 'VerzusXYZ — Universal Esports Arena',
  description: 'Skill-based esports matchmaking, party duels, and tournaments for any game verified by client-side OCR.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased flex font-sans selection:bg-primary selection:text-white overflow-x-hidden">
        <Providers>
          {/* Vertical Navigation Rail */}
          <GameRail />

          {/* Main App Workspace */}
          <div className="flex-1 flex flex-col min-w-0 bg-background overflow-x-hidden">
            <TopHeader />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-32 min-w-0">
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
