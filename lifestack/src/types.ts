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