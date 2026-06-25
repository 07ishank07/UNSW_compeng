// Shape-matched to upcomingEventsQuery + pastEventsQuery projections.
// Used when NEXT_PUBLIC_USE_MOCKS=true — swap to sanityFetch() for live data.

export const mockUpcomingEvents = [
  {
    _id: "mock-event-1",
    title: "End-of-Semester Social",
    slug: "end-of-semester-social",
    eventType: "social",
    startDateTime: "2026-11-20T18:00:00+11:00",
    endDateTime: "2026-11-20T21:00:00+11:00",
    location: "Roundhouse, UNSW Kensington",
    shortDescription:
      "Wind down the semester with the CompEngSoc crew — free food, good company, and the usual chaos.",
    ticketUrl: null,
    image: null,
  },
  {
    _id: "mock-event-2",
    title: "PCB Design Workshop",
    slug: "pcb-design-workshop",
    eventType: "workshop",
    startDateTime: "2026-10-08T16:00:00+11:00",
    endDateTime: "2026-10-08T19:00:00+11:00",
    location: "Electrical Engineering Building G17, UNSW",
    shortDescription:
      "Hands-on KiCad session: design a two-layer PCB from schematic to Gerbers, ready to order.",
    ticketUrl: "https://example.com/tickets/pcb-workshop",
    image: null,
  },
  {
    _id: "mock-event-3",
    title: "Industry Night 2026",
    slug: "industry-night-2026",
    eventType: "networking",
    startDateTime: "2026-09-17T17:30:00+10:00",
    endDateTime: "2026-09-17T20:30:00+10:00",
    location: "John Niland Scientia Building, UNSW",
    shortDescription:
      "Meet engineers from our sponsor companies. Bring your resume — this one counts.",
    ticketUrl: "https://example.com/tickets/industry-night",
    image: null,
  },
];

export const mockPastEvents = [
  {
    _id: "mock-event-past-1",
    title: "Orientation BBQ",
    slug: "orientation-bbq",
    eventType: "social",
    startDateTime: "2026-02-19T12:00:00+11:00",
    location: "Library Lawn, UNSW Kensington",
    image: null,
  },
];
