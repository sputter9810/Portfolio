export const currentUser = {
  id: 1,
  name: "Sam",
  role: "head_setter",
};

export const nextSetDay = {
  id: 1,
  name: "South Wall Reset",
  date: "2026-06-02",
  startTime: "7:00 AM",
  sectors: ["South Wall"],
  status: "Published",
  notes: "Focus on beginner movement, technical grade 6s, and fewer powerful climbs.",
};

export const assignments = [
  {
    id: 1,
    setter: "Jess",
    grade: 5,
    colour: "Blue",
    sector: "South Wall",
    styleTags: ["Technical", "Balance"],
    status: "Planned",
  },
  {
    id: 2,
    setter: "Sam",
    grade: 7,
    colour: "Purple",
    sector: "South Wall",
    styleTags: ["Powerful", "Compression"],
    status: "Needs Tweaks",
  },
  {
    id: 3,
    setter: "Mia",
    grade: 4,
    colour: "Green",
    sector: "South Wall",
    styleTags: ["Beginner-friendly"],
    status: "Complete",
  },
];

export const routeHealth = {
  activeRoutes: 42,
  flaggedRoutes: 3,
  needsTweaks: 2,
  missingGrades: ["Grade 3", "Grade 8"],
};

export const holdUsageAlerts = [
  "Orange Core Jugs have not been used in 9 weeks.",
  "White Cheeta Slopers are available for the next reset.",
  "Blue Kilter Pinches are currently overused.",
];

export const recentActivity = [
  "South Wall plan was published.",
  "Jess marked Blue Grade 5 as complete.",
  "Purple Grade 7 was flagged for tweaks.",
  "Green Grade 4 received positive feedback.",
];

export const routes = [
  {
    id: 1,
    code: "SW-001",
    sector: "South Wall",
    setter: "Jess",
    dateSet: "2026-05-12",
    colour: "Blue",
    grade: 5,
    holdSets: ["Blue Core Jugs"],
    styleTags: ["Technical", "Balance"],
    status: "Active",
    feedback: {
      positive: 8,
      neutral: 2,
      negative: 1,
    },
    notes: "Good movement, slightly tricky middle section.",
  },
  {
    id: 2,
    code: "SW-002",
    sector: "South Wall",
    setter: "Sam",
    dateSet: "2026-05-12",
    colour: "Purple",
    grade: 7,
    holdSets: ["Purple Kilter Pinches"],
    styleTags: ["Powerful", "Compression"],
    status: "Needs Tweaks",
    feedback: {
      positive: 3,
      neutral: 1,
      negative: 4,
    },
    notes: "Finish may be too morpho.",
  },
  {
    id: 3,
    code: "NW-014",
    sector: "North Wall",
    setter: "Mia",
    dateSet: "2026-05-05",
    colour: "Green",
    grade: 4,
    holdSets: ["Green Cheeta Jugs"],
    styleTags: ["Beginner-friendly", "Flow"],
    status: "Active",
    feedback: {
      positive: 12,
      neutral: 1,
      negative: 0,
    },
    notes: "Popular warmup climb.",
  },
  {
    id: 4,
    code: "SL-009",
    sector: "Slab",
    setter: "Tom",
    dateSet: "2026-04-28",
    colour: "Yellow",
    grade: 6,
    holdSets: ["Yellow Squadra Feet"],
    styleTags: ["Slab", "Technical"],
    status: "Flagged",
    feedback: {
      positive: 2,
      neutral: 2,
      negative: 5,
    },
    notes: "Customers report insecure fall zone feeling.",
  },
];