import Link from 'next/link';

const STOCK_PAIRS = ['$TTEQ', '$NVDA', '$META', '$TSLA', '$AAPL', '$SPY', '$AMD', '$MSFT', 'WETH'];

const SUPPORTED_VENUES = [
  'Pons',
  'LONG',
  'PAIR',
  'Uniswap v4',
  'Bankr',
  'Stonkfun',
  'Pools.trade',
  'Fables',
  'GIGA DEX',
  'Longbow',
  'Borro.Markets',
  'Robinhood Blockscout',
];

const STEPS = [
  {
    num: '01',
    title: 'Scan stock-paired launches',
    desc: 'Monitor new Robinhood Chain pools in real time—filtered specifically for tokenized equity pairs like $TTEQ, $NVDA, and $META.',
  },
  {
    num: '02',
    title: 'Write rules in plain English',
    desc: 'No local CLI or MCP config files. Type your market cap, top-10 holder cap, and take-profit targets once and compile into a live trigger.',
  },
  {
    num: '03',
    title: 'Pre-flight bytecode guardrails',
    desc: 'Every target runs through on-chain bytecode verification, gas estimation, and honeypot checks before a single wei is signed.',
  },
];

const EXAMPLE_PROMPTS = [
  'Snipe new $TTEQ pairs under $100K cap, top 10 holders <15%, buy 0.05 ETH, auto-TP 2x',
  'Alert on $NVDA-paired launches with >$25K liquidity and safety score above 80',
  'Snipe $META pairs under $250K cap, stop-loss -30%, take profit 50% at 2.5x',
  'Simulate bytecode and gas on 0x... before quoting a 0.1 ETH swap route',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100">
      {/* HERO SECTION */}
      <section className="relative flex min-h-screen flex-col justify-between overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-right bg-no-repeat md:bg-center"
          style={{ backgroundImage: "url('/hero-sniper.jpg')" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/95 via-black/65 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#050505] to-transparent" />

        {/* Floating Smoked-Glass Navbar */}
        <header className="relative z-10 mx-auto mt-5 w-[94%] max-w-6xl rounded-full border border-white/15 bg-black/55 px-6 py-3 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <span
                className="bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-lg font-bold tracking-[-0.03em] text-transparent"
                style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.85))' }}
              >
                SniperMCP
              </span>
            </Link>

            <nav className="hidden items-center gap-7 text-xs font-light text-zinc-300 md:flex">
              <a href="#how-it-works" className="transition hover:text-white">
                How it works
              </a>
              <a href="#prompts" className="transition hover:text-white">
                Prompts
              </a>
              <a href="#pricing" className="transition hover:text-white">
                Fees
              </a>
              <Link href="/docs" className="transition hover:text-white">
                Docs
              </Link>
              <a
                href="https://github.com/miami0x/SniperMCP"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-white"
              >
                GitHub
              </a>
              <Link
                href="/terminal"
                className="rounded-full bg-white px-4 py-1.5 font-medium text-black transition hover:bg-zinc-200"
              >
                Launch Terminal ↗
              </Link>
            </nav>

            <Link
              href="/terminal"
              className="rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-black md:hidden"
            >
              Terminal ↗
            </Link>
          </div>
        </header>

        {/* Left-aligned Hero Content */}
        <div className="relative z-10 mx-auto flex w-[94%] max-w-6xl flex-1 flex-col justify-center py-16">
          <div className="max-w-xl">
            <Link
              href="/terminal"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-5 py-2.5 text-xs font-normal text-white backdrop-blur-md transition hover:bg-white hover:text-black"
            >
              Launch SniperMCP ↗
            </Link>

            <div className="mt-6 rounded-2xl border border-white/15 bg-black/70 p-4 font-mono text-xs leading-relaxed text-zinc-200 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              <div className="mb-1.5 text-[10px] uppercase tracking-widest text-zinc-500">
                Natural-Language Trigger
              </div>
              <p>
                &gt; Snipe new <span className="font-semibold text-white">$TTEQ</span> pairs under{' '}
                <span className="font-semibold text-white">$100K</span> cap, top 10 holders &lt;15%,
                buy <span className="font-semibold text-white">0.05 ETH</span>, auto-TP 2x
              </p>
            </div>

            <p className="mt-5 text-sm font-light leading-relaxed text-zinc-300">
              No local CLI, no MCP config files, no subscription. Reads, radar scans, and pre-flight
              simulations are free—just open the terminal and snipe Robinhood Chain&apos;s
              stock-paired trenches.
            </p>

            <h1 className="mt-8 text-4xl font-extralight leading-[1.08] tracking-[-0.03em] text-white sm:text-6xl">
              Your AI sniper,
              <br />
              <span className="bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text font-normal text-transparent">
                on Robinhood Chain.
              </span>
            </h1>
          </div>
        </div>
      </section>

      {/* 01. HOW IT WORKS */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-light uppercase tracking-[0.22em] text-emerald-400/80">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-extralight leading-snug tracking-[-0.03em] text-white sm:text-4xl">
            Built for relentless speed in the trenches, without a single line of terminal setup.
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-md transition hover:border-emerald-400/25"
            >
              <span className="font-mono text-sm font-semibold tracking-wider text-zinc-400">
                {step.num}
              </span>
              <h3 className="mt-6 text-lg font-semibold tracking-[-0.02em] text-white">
                {step.title}
              </h3>
              <p className="mt-3 text-sm font-normal leading-relaxed text-zinc-300">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 02. EXAMPLE PROMPTS */}
      <section id="prompts" className="border-t border-white/[0.08] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-light uppercase tracking-[0.22em] text-emerald-400/80">
              In plain English
            </p>
            <h2 className="mt-3 text-3xl font-extralight leading-snug tracking-[-0.03em] text-white sm:text-4xl">
              Type your edge once. Let the compiler handle the filters.
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            {EXAMPLE_PROMPTS.map((p, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-5 font-mono text-xs leading-relaxed text-zinc-200"
              >
                <span className="mr-2 text-emerald-400">&gt;</span>
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03. SUPPORTED ECOSYSTEM & STOCK PAIRS */}
      <section id="pairs" className="border-t border-white/[0.08] py-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-light uppercase tracking-[0.22em] text-zinc-500">
              Tokenized Stock Pairs · Chain 4663
            </p>
            <h3 className="mt-3 text-2xl font-extralight tracking-[-0.02em] text-white">
              Native radar for equity-backed liquidity.
            </h3>
            <div className="mt-6 flex flex-wrap gap-2">
              {STOCK_PAIRS.map((sym) => (
                <span
                  key={sym}
                  className="rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 font-mono text-xs text-white"
                >
                  {sym}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-light uppercase tracking-[0.22em] text-zinc-500">
              Indexed Venues &amp; Launchpads
            </p>
            <h3 className="mt-3 text-2xl font-extralight tracking-[-0.02em] text-white">
              One terminal across the Robinhood L2 stack.
            </h3>
            <div className="mt-6 flex flex-wrap gap-2">
              {SUPPORTED_VENUES.map((v) => (
                <span
                  key={v}
                  className="rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-1.5 text-xs font-light text-zinc-300"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 04. FEES & SELF-CUSTODY */}
      <section id="pricing" className="border-t border-white/[0.08] py-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <p className="text-xs font-light uppercase tracking-[0.22em] text-emerald-400/80">
              What it costs
            </p>
            <h3 className="mt-3 text-2xl font-extralight tracking-[-0.02em] text-white">
              No subscription. Transparent execution fees.
            </h3>
            <p className="mt-4 text-sm font-normal leading-relaxed text-zinc-300">
              Radar feeds, rule compilation, and pre-flight bytecode simulations are completely
              free. On-chain execution routes through the SniperMCP FeeRouter at a flat 0.5% swap
              fee—always displayed before you sign.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <p className="text-xs font-light uppercase tracking-[0.22em] text-emerald-400/80">
              Self-custody
            </p>
            <h3 className="mt-3 text-2xl font-extralight tracking-[-0.02em] text-white">
              Your keys never leave your wallet.
            </h3>
            <p className="mt-4 text-sm font-normal leading-relaxed text-zinc-300">
              SniperMCP never custodies private keys or requests unlimited token approvals. Every
              transaction is simulated first and signed directly by your connected wallet on
              Robinhood Chain.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.08] py-14">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-6 md:flex-row md:items-center">
          <div>
            <span className="text-sm font-semibold text-white">SniperMCP</span>
            <p className="mt-2 max-w-md text-xs font-light leading-relaxed text-zinc-500">
              Independent software for Robinhood Chain (Chain ID 4663). Not affiliated with
              Robinhood Markets. Not financial advice—always verify contracts before signing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-light text-zinc-400">
            <Link href="/terminal" className="transition hover:text-white">
              Terminal
            </Link>
            <Link href="/docs" className="transition hover:text-white">
              Docs
            </Link>
            <a
              href="https://github.com/miami0x/SniperMCP"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              GitHub
            </a>
            <Link
              href="/terminal"
              className="rounded-full bg-white px-5 py-2 font-medium text-black transition hover:bg-zinc-200"
            >
              Enter Terminal ↗
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
