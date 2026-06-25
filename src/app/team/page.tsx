import type { Metadata } from "next";
import { getExec } from "@/lib/content";
import TeamGrid from "@/components/modules/TeamGrid";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Team — CompEngSoc",
  description:
    "The 2026 executive committee of the UNSW Computer Engineering Society.",
};

export default async function TeamPage() {
  const members = await getExec();
  return (
    <main>
      <PageHeader
        label="// the-board"
        title="Team"
        subtitle="The founding exec building CompEngSoc from the ground up."
      />
      <TeamGrid members={members} />
    </main>
  );
}
