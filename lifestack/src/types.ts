export type ActivityCategory =
  | "project"
  | "fitness"
  | "meal"
  | "hobby"
  | "life"
  | "other";

export type ActivityPriority = "low" | "medium" | "high";

export type Activity = {
  id: string;
  name: string;
  category: ActivityCategory;
  priority: ActivityPriority;
  frequencyPerWeek: number;
  sessionLengthMinutes: number;
  notes: string;
};