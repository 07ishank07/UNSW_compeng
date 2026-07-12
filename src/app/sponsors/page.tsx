import type { Metadata } from "next";
import { getSponsors, getSiteSettings } from "@/lib/content";
import SponsorsGrid from "@/components/modules/SponsorsGrid";
import PageHeader from "@/components/ui/PageHeader";
import { FIELD } from "@/lib/fieldRecipes";

export const metadata: Metadata = {
  title: "Sponsors — CompEngSoc",
  description:
    "The organisations powering UNSW's Computer Engineering Society.",
};

export default async function SponsorsPage() {
  const [sponsors, settings] = await Promise.all([getSponsors(), getSiteSettings()]);
  return (
    <main>
      <PageHeader
        label="// power-delivery-network"
        title="Sponsors"
        subtitle="The organisations that power our workshops, events, and student programs."
        signal={{ ...FIELD.gold, shape: "sphere", opacity: 0.8, seed: 0 }}
      />
      <SponsorsGrid sponsors={sponsors} contactEmail={settings?.contactEmail ?? null} />
    </main>
  );
}
