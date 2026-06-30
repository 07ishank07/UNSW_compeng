// Single source for the primary nav links, shared by the desktop Nav bar and the
// mobile overlay so the two never drift.
export const navLinks = [
  { href: "/events", label: "Events" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/academics", label: "Academics" },
  { href: "/blog", label: "Blog" },
  { href: "/team", label: "Team" },
] as const;
