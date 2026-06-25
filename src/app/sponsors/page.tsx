import type { Metadata } from "next";
import { getSponsors } from "@/lib/content";
import SponsorsGrid from "@/components/modules/SponsorsGrid";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Sponsors — CompEngSoc",
  description:
    "The organisations powering UNSW's Computer Engineering Society.",
};

export default async function SponsorsPage() {
  const sponsors = await getSponsors();
  return (
    <main>
      <PageHeader
        label="// power-delivery-network"
        title="Sponsors"
        subtitle="The organisations that power our workshops, events, and student programs."
      />
      <SponsorsGrid sponsors={sponsors} />
    </main>
  );
}
