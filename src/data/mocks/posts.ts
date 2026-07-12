// Shape-matched to postsQuery projection (desc publishedAt, like the GROQ).
// Two posts per category so the blog's sectioned/filtered layouts render full.

export const mockPosts = [
  {
    _id: "mock-post-8",
    title: "From Verilog to Bitstream: A COMP3601 Survival Pipeline",
    slug: "verilog-to-bitstream",
    category: "technical",
    excerpt:
      "The exact toolchain path from RTL to a working bitstream — with the Vivado warnings you can ignore and the two you absolutely cannot.",
    publishedAt: "2026-07-01T10:00:00+10:00",
    author: "James Liu",
    cover: null,
  },
  {
    _id: "mock-post-7",
    title: "Peer Tutoring Opens for Term 3 — Sign-ups Live",
    slug: "peer-tutoring-term-3",
    category: "announcement",
    excerpt:
      "Free weekly sessions for ELEC2141, COMP2521, and DESN2000, run by students who took them last term. Spots are capped — grab one early.",
    publishedAt: "2026-06-30T09:00:00+10:00",
    author: "Priya Sharma",
    cover: null,
  },
  {
    _id: "mock-post-6",
    title: "Paid Summer Research: Embedded Systems Lab Taking Undergrads",
    slug: "paid-summer-research-embedded",
    category: "opportunity",
    excerpt:
      "The embedded systems lab is hiring undergrad research assistants over summer — real firmware, real hardware, real pay.",
    publishedAt: "2026-06-12T09:00:00+10:00",
    author: "Priya Sharma",
    cover: null,
  },
  {
    _id: "mock-post-5",
    title: "Recap: Industry Night 2026 — 8 Companies, 120 Students",
    slug: "industry-night-2026-recap",
    category: "recap",
    excerpt:
      "Resumes moved, questions landed, and at least three internships started as conversations over pizza. Here's how the night went.",
    publishedAt: "2026-05-02T18:00:00+10:00",
    author: "Aisha Okonkwo",
    cover: null,
  },
  {
    _id: "mock-post-4",
    title: "Debouncing Buttons Properly: Hardware vs. Firmware",
    slug: "debouncing-buttons-properly",
    category: "technical",
    excerpt:
      "RC filters, Schmitt triggers, or a 10-line state machine? When each debounce strategy wins, with scope traces to prove it.",
    publishedAt: "2026-04-14T12:00:00+10:00",
    author: "James Liu",
    cover: null,
  },
  {
    _id: "mock-post-2",
    title: "Recap: PCB Design Workshop — From Schematic to Gerbers in 3 Hours",
    slug: "pcb-design-workshop-recap",
    category: "recap",
    excerpt:
      "Twenty students, one KiCad tutorial, and a board ready to manufacture. Here's how it went.",
    publishedAt: "2026-03-22T14:00:00+11:00",
    author: "James Liu",
    cover: null,
  },
  {
    _id: "mock-post-3",
    title: "Atlassian 2027 Grad Program — Applications Open",
    slug: "atlassian-2027-grad-program",
    category: "opportunity",
    excerpt:
      "Applications for the 2027 graduate cohort are open now. What the process looks like and how to make a hardware-flavoured resume land.",
    publishedAt: "2026-03-05T09:00:00+11:00",
    author: "Aisha Okonkwo",
    cover: null,
  },
  {
    _id: "mock-post-1",
    title: "CompEngSoc Is Now Official — Here's What That Means For You",
    slug: "compengsoc-is-now-official",
    category: "announcement",
    excerpt:
      "UNSW's Computer Engineering Society has received official club status. Here's what we're building and how you can get involved.",
    publishedAt: "2026-02-10T09:00:00+11:00",
    author: "Priya Sharma",
    cover: null,
  },
];
