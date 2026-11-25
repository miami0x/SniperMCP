import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100">
      {/* DOCS HERO */}
      <section className="relative flex min-h-[82vh] flex-col justify-between overflow-hidden">
        {/* Shifted down so the workbench & marksman sit lower in frame */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 top-24 bg-cover bg-[80%_top] bg-no-repeat md:top-32 md:bg-[center_top]"
          style={{ backgroundImage: "url('/hero-docs.jpg')" }}
        />
        {/* Seamless top, left, and bottom fades */}
        <div className="pointer-events-none absolute inset-x-0 top-20 h-32 bg-gradient-to-b from-[#050505] to-transparent md:top-28" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/65 to-transparent md:bg-gradient-to-r md:from-black/95 md:via-black/65 md:to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050505] to-transparent" />

        <header className="relative z-10 mx-auto mt-5 w-[94%] max-w-6xl rounded-full border border-white/15 bg-black/55 px-6 py-3 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg font-bold tracking-[-0.03em] text-white">
              SniperMCP
            </Link>
            <div className="flex items-center gap-6 text-xs font-light text-zinc-300">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <Link
                href="/terminal"
                className="rounded-full bg-white px-4 py-1.5 font-medium text-black hover:bg-zinc-200"
              >
                Launch Terminal ↗
              </Link>
            </div>
          </div>
        </header>

        <div className="relative z-10 mx-auto w-[94%] max-w-6xl pb-16 pt-48 md:py-20">
          <div className="max-w-xl">
            <p className="text-xs font-light uppercase tracking-[0.22em] text-emerald-400/80">
              Documentation &amp; Guardrails
            </p>
            <h1 className="mt-3 text-4xl font-extralight tracking-[-0.03em] text-white sm:text-5xl">
              Calibrate your rules before you sign.
            </h1>
            <p className="mt-4 text-sm font-light leading-relaxed text-zinc-300">
              Everything you need to know about Robinhood Chain RPC routing, natural-language rule
              compilation, and pre-flight bytecode simulation.
            </p>
          </div>
        </div>
      </section>

      {/* DOCS CONTENT */}
      <main className="mx-auto max-w-4xl space-y-12 px-6 py-16">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
          <h2 className="text-xl font-semibold text-white">1. Network Parameters</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 font-mono text-xs text-zinc-300 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.06] bg-black/40 p-4">
              <span className="block text-zinc-500">Mainnet Chain ID</span>
              <span className="mt-1 block text-white">4663 (0x1237)</span>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-black/40 p-4">
              <span className="block text-zinc-500">Testnet Chain ID</span>
              <span className="mt-1 block text-white">46630 (0xb626)</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
          <h2 className="text-xl font-semibold text-white">2. Pre-Flight Simulation</h2>
          <p className="mt-3 text-sm font-normal leading-relaxed text-zinc-300">
            Before any swap is executed, SniperMCP queries the active Robinhood Chain RPC to verify
            deployed contract bytecode, estimate live L2 gas in gwei, and flag unverified or
            illiquid pools.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
          <h2 className="text-xl font-semibold text-white">3. Custody Boundaries</h2>
          <p className="mt-3 text-sm font-normal leading-relaxed text-zinc-300">
            SniperMCP is 100% non-custodial. No private keys are stored on our servers, and every
            transaction requires explicit wallet confirmation.
          </p>
        </div>
      </main>
    </div>
  );
}
