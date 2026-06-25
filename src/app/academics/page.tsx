import type { Metadata } from "next";
import { getAcademicResources } from "@/lib/content";
import AcademicsGrid from "@/components/modules/AcademicsGrid";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Academics — CompEngSoc",
  description:
    "Peer-maintained resources for UNSW Computer Engineering students.",
};

export default async function AcademicsPage() {
  const resources = await getAcademicResources();
  return (
    <main>
      <PageHeader
        label="// memory-map"
        title="Academics"
        subtitle="Peer-maintained notes, cheat sheets, and guides for the CompEng degree."
      />
      <AcademicsGrid resources={resources} />
    </main>
  );
}
