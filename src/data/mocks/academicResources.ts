// Shape-matched to academicResourcesQuery projection.

export const mockAcademicResources = [
  {
    _id: "mock-resource-1",
    title: "CompEng Degree Planner Wiki",
    courseCode: null,
    category: "wiki",
    externalUrl: "https://example.com/wiki",
    fileUrl: null,
    description: "Community-maintained guide to course sequencing, WAM strategy, and elective picks for the CompEng degree.",
    hasBody: false,
  },
  {
    _id: "mock-resource-2",
    title: "ELEC2141 Digital Circuit Design — Condensed Notes",
    courseCode: "ELEC2141",
    category: "notes",
    externalUrl: "https://example.com/elec2141-notes",
    fileUrl: null,
    description: "Covers combinational logic, FSMs, timing analysis, and FPGA basics. Crowd-sourced from T1 2025.",
    hasBody: false,
  },
  {
    _id: "mock-resource-3",
    title: "COMP3601 Design Project A — Cheat Sheet",
    courseCode: "COMP3601",
    category: "cheatsheet",
    externalUrl: null,
    fileUrl: "https://example.com/comp3601-cheatsheet.pdf",
    description: "One-page reference covering project report structure, FPGA pin constraints, and common Vivado gotchas.",
    hasBody: false,
  },
  {
    _id: "mock-resource-4",
    title: "KiCad PCB Design Starter Guide",
    courseCode: null,
    category: "pcb",
    externalUrl: "https://example.com/kicad-guide",
    fileUrl: null,
    description: "Step-by-step walkthrough from schematic capture to Gerber export, tuned for JLCPCB fab constraints.",
    hasBody: false,
  },
];
