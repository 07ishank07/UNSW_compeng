import type { Sponsor, SponsorTier } from "@/lib/types";
import SponsorCard from "@/components/modules/SponsorCard";

type Props = { sponsors: Sponsor[] };

const TIERS: SponsorTier[] = ["platinum", "gold", "silver", "partner"];

const TIER_CONFIG: Record<
  SponsorTier,
  { label: string; volt: string; labelClass: string; ruleClass: string }
> = {
  platinum: {
    label: "Platinum",
    volt: "12V0",
    labelClass: "text-gold",
    ruleClass: "border-gold/40",
  },
  gold: {
    label: "Gold",
    volt: "5V0",
    labelClass: "text-copper-bright",
    ruleClass: "border-copper-bright/40",
  },
  silver: {
    label: "Silver",
    volt: "3V3",
    labelClass: "text-copper",
    ruleClass: "border-copper/40",
  },
  partner: {
    label: "Partner",
    volt: "1V8",
    labelClass: "text-ghost",
    ruleClass: "border-solder",
  },
};

export default function SponsorsGrid({ sponsors }: Props) {
  return (
    <div className="px-6 py-10 space-y-14">
      {TIERS.map((tier) => {
        const group = sponsors.filter((s) => s.tier === tier);
        if (group.length === 0) return null;
        const cfg = TIER_CONFIG[tier];
        return (
          <section key={tier}>
            <div className="flex items-center gap-3 mb-6">
              <span
                className={`font-mono text-mono-label uppercase tracking-[0.04em] ${cfg.labelClass}`}
              >
                {cfg.label}
              </span>
              <span className="font-mono text-mono-label tracking-[0.04em] text-ghost">
                · {cfg.volt}
              </span>
              <div
                className={`flex-1 border-t ${cfg.ruleClass}`}
                aria-hidden="true"
              />
            </div>
            <ul
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              role="list"
            >
              {group.map((s) => (
                <li key={s._id}>
                  <SponsorCard sponsor={s} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
