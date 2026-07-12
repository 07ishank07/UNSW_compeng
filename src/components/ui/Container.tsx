import type { ElementType, ReactNode } from "react";

/**
 * Container — the ONE page-width primitive (SIGNAL §7 Layout Constitution):
 * `max-w-[1200px]` centred, with the standard `px-6 md:px-10` gutters. All page
 * content sits inside one; full-bleed sections wrap an inner Container. Being a
 * server component keeps it free of client JS. `as` lets it stand in for a
 * semantic element (section/header/main) without an extra wrapper.
 *
 * (Inner routes still use the legacy inline `max-w-6xl px-6` pattern; they migrate
 * to Container as each is redesigned — do not big-bang the swap.)
 */
type Props = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

export function Container({ children, className = "", as: Tag = "div" }: Props) {
  return <Tag className={`mx-auto w-full max-w-[1200px] px-6 md:px-10 ${className}`}>{children}</Tag>;
}
