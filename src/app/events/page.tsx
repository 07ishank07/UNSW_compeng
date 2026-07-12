import type { Metadata } from "next";
import { getUpcomingEvents, getPastEvents } from "@/lib/content";
import EventsTimeline from "@/components/modules/EventsTimeline";
import PageHeader from "@/components/ui/PageHeader";
import { FIELD } from "@/lib/fieldRecipes";

export const metadata: Metadata = {
  title: "Events — CompEngSoc",
  description:
    "Upcoming and past events from the UNSW Computer Engineering Society.",
};

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([
    getUpcomingEvents(),
    getPastEvents(),
  ]);
  return (
    <main>
      <PageHeader
        label="// signal-timeline"
        title="Events"
        subtitle="Hands-on workshops, industry nights, and the social events that make CompEng feel like a community."
        signal={{ ...FIELD.crimson, shape: "wave", opacity: 0.8, seed: 0 }}
      />
      <EventsTimeline upcoming={upcoming} past={past} />
    </main>
  );
}
