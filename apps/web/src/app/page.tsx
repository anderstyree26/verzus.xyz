import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/30 rounded-full text-xs font-semibold text-accent mb-6">
        <span>🚀 100% Free Tier · Zero Game APIs · Type-Based OCR Verification</span>
      </div>

      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl">
        Compete in Any Game for Skill-Based Glory
      </h1>

      <p className="mt-4 text-base sm:text-lg text-gray-400 max-w-2xl">
        Mobile, PC, Console, or Physical. VerzusXYZ uses client-side optical character recognition
        and server verification to turn any screen into an esports arena.
      </p>

      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <Link
          href="/matches/new"
          className="px-6 py-3 bg-accent hover:bg-accent-600 font-bold text-sm rounded-lg transition shadow-[0_0_20px_rgba(139,92,246,0.4)]"
        >
          Quick Play Now
        </Link>
        <Link
          href="/challenges"
          className="px-6 py-3 bg-surface-elevated hover:bg-surface-border border border-surface-border font-bold text-sm rounded-lg transition"
        >
          Browse Open Challenges
        </Link>
        <Link
          href="/tournaments"
          className="px-6 py-3 bg-surface-elevated hover:bg-surface-border border border-surface-border font-bold text-sm rounded-lg transition"
        >
          Tournaments
        </Link>
      </div>

      {/* Feature Grid */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
        <div className="p-6 bg-surface-elevated border border-surface-border rounded-lg">
          <div className="w-10 h-10 rounded-md bg-accent/20 text-accent flex items-center justify-center font-bold text-lg mb-3">
            👁️
          </div>
          <h3 className="text-lg font-bold">Client-Side OCR</h3>
          <p className="text-sm text-gray-400 mt-2">
            No game developer integration needed. Real-time in-browser OCR reads scores directly from your screen share.
          </p>
        </div>

        <div className="p-6 bg-surface-elevated border border-surface-border rounded-lg">
          <div className="w-10 h-10 rounded-md bg-accent/20 text-accent flex items-center justify-center font-bold text-lg mb-3">
            ⚡
          </div>
          <h3 className="text-lg font-bold">8 Universal Engines</h3>
          <p className="text-sm text-gray-400 mt-2">
            High Score, Low Time, Survival, Head-to-Head, Win/Loss, Composite Stats, Progression, and Physical whiteboards.
          </p>
        </div>

        <div className="p-6 bg-surface-elevated border border-surface-border rounded-lg">
          <div className="w-10 h-10 rounded-md bg-accent/20 text-accent flex items-center justify-center font-bold text-lg mb-3">
            🛡️
          </div>
          <h3 className="text-lg font-bold">Anti-Cheat & HITL Review</h3>
          <p className="text-sm text-gray-400 mt-2">
            Velocity anomaly detection, replay checks, and human-in-the-loop review queues ensure fair competition.
          </p>
        </div>
      </div>
    </div>
  );
}
