import { SplitHeadline } from "@/components/motion/SplitHeadline";

type Props = {
  label: string;
  title: string;
  subtitle?: string;
};

export default function PageHeader({ label, title, subtitle }: Props) {
  return (
    <header className="px-6 py-12 border-b border-solder">
      <p className="font-mono text-mono-label uppercase tracking-[0.04em] text-ghost mb-3">
        {label}
      </p>
      <SplitHeadline as="h1" weight={[400, 560]} className="font-display text-h2 text-silk">
        {title}
      </SplitHeadline>
      {subtitle && (
        <p className="text-body text-ghost mt-3 max-w-2xl">{subtitle}</p>
      )}
    </header>
  );
}
