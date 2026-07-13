import { Link } from "next-view-transitions";
import { Container } from "@/components/ui/Container";

// 404 — calm base ground, no field: an unmapped address doesn't earn a station.
export default function NotFound() {
  return (
    <main className="flex flex-1 items-center py-24">
      <Container>
        <div className="mx-auto flex max-w-xl flex-col items-start gap-4">
          <p className="font-mono text-mono-label uppercase text-purple-soft">
            {"// 404 — address not mapped"}
          </p>
          <h1 className="font-display font-semibold text-h2 text-ink">Page not found</h1>
          <p className="text-body text-ink-muted">
            Nothing is wired to this address. Check the URL, or head back to the board.
          </p>
          <Link
            href="/"
            className="rounded-control border border-hairline px-5 py-2.5 font-mono text-mono-label uppercase text-ink lift hover:border-hairline-gold hover:text-accent-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold"
          >
            ← Back to home
          </Link>
        </div>
      </Container>
    </main>
  );
}
