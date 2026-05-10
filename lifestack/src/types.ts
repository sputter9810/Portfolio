export type ActivityCategory =
  | "project"
  | "fitness"
  | "meal"
  | "hobby"
  | "life"
  | "other";

export type ActivityPriority = "low" | "medium" | "high";

export type TimeOfDay = "morning" | "afternoon" | "evening";

export type ActivityStatus = "active" | "paused" | "complete";

export type Activity = {
  id: string;
  name: string;
  category: ActivityCategory;
  status: ActivityStatus;
  priority: ActivityPriority;
  frequencyPerWeek: number;
  sessionLengthMinutes: number;
  preferredDays: string[];
  preferredTime: TimeOfDay;
  lockedDays: boolean;
  notes: string;
};

export type ScheduledSession = {
  id: string;
  activityId: string;
  activityName: string;
  category: ActivityCategory;
  day: string;
  timeOfDay: TimeOfDay;
  durationMinutes: number;
  completed: boolean;
  locked: boolean;
};

export type CaptureItem = {
  id: string;
  text: string;
  createdAt: string;
  processed: boolean;
};

export type ProjectStatus =
  | "planning"
  | "active"
  | "polishing"
  | "released"
  | "maintenance"
  | "shelved"
  | "archived";

export type ProjectPriority = "low" | "medium" | "high";

export type ProjectMilestone = {
  id: string;
  title: string;
  targetVersion: string;
  completed: boolean;
  notes: string;
};

export type PortfolioChecklist = {
  readmeComplete: boolean;
  deployed: boolean;
  githubClean: boolean;
  screenshotsAdded: boolean;
  mobileResponsive: boolean;
  versionOneReleased: boolean;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  category: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  currentVersion: string;
  targetVersion: string;
  techStack: string;
  nextAction: string;
  blockers: string;
  linkedActivityId: string;
  milestones: ProjectMilestone[];
  portfolioChecklist: PortfolioChecklist;
  createdAt: string;
  updatedAt: string;
};
