"use client";

import Link from "next/link";

// Route error boundary — machine-voice fault state + retry. Client component by
// Next contract; deliberately minimal (a broken tree shouldn't pull in
// motion/depth code) — plain next/link, no view-transitions wrapper.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 items-center py-24">
      <div className="mx-auto flex w-full max-w-xl flex-col items-start gap-4 px-6">
        <p className="font-mono text-mono-label uppercase text-crimson-soft">
          {"// bus fault — render failed"}
          {error.digest ? ` · ${error.digest}` : ""}
        </p>
        <h1 className="font-display font-semibold text-h2 text-ink">Something broke</h1>
        <p className="text-body text-ink-muted">
          A transient fault tripped this page. Retry, or come back shortly.
        </p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={reset}
            className="rounded-control bg-accent-gold px-5 py-2.5 font-body text-sm font-semibold text-ink-inverse shadow-ambient lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold"
          >
            Retry
          </button>
          <Link
            href="/"
            className="rounded-control border border-hairline px-5 py-2.5 font-mono text-mono-label uppercase text-ink lift hover:border-hairline-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold"
          >
            ← Home
          </Link>
        </div>
      </div>
    </main>
  );
}
