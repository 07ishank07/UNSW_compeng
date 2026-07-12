/**
 * TickerBand — the mono machine-voice marquee (docs/design-language.md §0.2.5):
 * a hairline-bounded band whose uppercase items scroll in a pure-CSS transform
 * loop (globals.css `.marquee`, 36s linear), pausing on hover and rendering as
 * a static row under reduced motion. Gold items on the raised base-2 band with
 * slate diamond separators — the ticker is the hero's warm under-rule in the
 * colour-field rhythm (§0.2.1).
 *
 * Decorative: the whole band is aria-hidden (its keywords repeat content that
 * exists elsewhere); items arrive as props — no copy lives here.
 */

type Props = { items: readonly string[] };

function Row({ items }: Props) {
  return (
    <div className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="px-8 font-mono text-mono-label uppercase text-accent-gold">
            {item}
          </span>
          <span className="h-1.5 w-1.5 rotate-45 bg-accent-slate" />
        </span>
      ))}
    </div>
  );
}

export default function TickerBand({ items }: Props) {
  return (
    <div aria-hidden="true" className="marquee relative isolate border-y border-hairline py-4">
      {/* Soft scrim strip — anchors the gold items over the field without a
          solid band (decorative row; globals.css .scrim-soft). */}
      <div className="scrim-soft absolute inset-0 -z-10" />
      <div className="marquee-track">
        <Row items={items} />
        <Row items={items} />
      </div>
    </div>
  );
}
