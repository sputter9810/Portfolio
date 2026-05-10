import { useEffect, useMemo, useRef, useState } from "react";
import "./index.css";
import type {
  Activity,
  ActivityCategory,
  ActivityPriority,
  ActivityStatus,
  CaptureItem,
  Project,
  ProjectMilestone,
  ProjectPriority,
  ProjectStatus,
  ScheduledSession,
  TimeOfDay,
} from "./types";

type View = "dashboard" | "activities" | "projects" | "schedule" | "inbox" | "ai";

type BackupData = {
  version: string;
  exportedAt: string;
  activities: Activity[];
  schedule: ScheduledSession[];
  captures: CaptureItem[];
  projects: Project[];
};

const navItems: View[] = [
  "dashboard",
  "activities",
  "projects",
  "schedule",
  "inbox",
  "ai",
];

const ACTIVITIES_KEY = "lifestack.activities";
const SCHEDULE_KEY = "lifestack.schedule";
const CAPTURES_KEY = "lifestack.captures";
const PROJECTS_KEY = "lifestack.projects";

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function priorityScore(priority: ActivityPriority) {
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return 1;
}

function isHeavyActivity(activity: Activity) {
  return (
    activity.category === "fitness" ||
    activity.sessionLengthMinutes >= 90 ||
    activity.priority === "high"
  );
}

function getDayScore(
  day: string,
  activity: Activity,
  dayLoad: Record<string, number>,
  dayFitnessCount: Record<string, number>,
  dayHeavyCount: Record<string, number>,
  existingActivityDays: Set<string>
) {
  let score = 0;

  score += dayLoad[day];

  if (activity.category === "fitness") {
    score += dayFitnessCount[day] * 90;
  }

  if (isHeavyActivity(activity)) {
    score += dayHeavyCount[day] * 120;
  }

  if (existingActivityDays.has(day)) {
    score += 500;
  }

  if (day === "Sunday") {
    score += 30;
  }

  if (day === "Saturday" && activity.category === "project") {
    score += 40;
  }

  return score;
}

function emptyActivity(): Activity {
  return {
    id: "",
    name: "",
    category: "project",
    status: "active",
    priority: "medium",
    frequencyPerWeek: 2,
    sessionLengthMinutes: 60,
    preferredDays: [],
    preferredTime: "evening",
    lockedDays: false,
    notes: "",
  };
}

function emptyProject(): Project {
  const now = new Date().toISOString();

  return {
    id: "",
    name: "",
    description: "",
    category: "Software",
    status: "planning",
    priority: "medium",
    currentVersion: "v0.1.0",
    targetVersion: "v1.0.0",
    techStack: "",
    nextAction: "",
    blockers: "",
    linkedActivityId: "",
    milestones: [],
    createdAt: now,
    updatedAt: now,
  };
}

function normaliseActivity(activity: Activity): Activity {
  return {
    ...activity,
    lockedDays: activity.lockedDays ?? false,
    preferredDays: activity.preferredDays ?? [],
    preferredTime: activity.preferredTime ?? "evening",
    status: activity.status ?? "active",
  };
}

function normaliseSession(session: ScheduledSession): ScheduledSession {
  return {
    ...session,
    locked: session.locked ?? false,
    completed: session.completed ?? false,
  };
}

function normaliseCapture(capture: CaptureItem): CaptureItem {
  return {
    ...capture,
    processed: capture.processed ?? false,
    createdAt: capture.createdAt ?? new Date().toISOString(),
  };
}

function normaliseProject(project: Project): Project {
  const now = new Date().toISOString();

  return {
    ...emptyProject(),
    ...project,
    status: project.status ?? "planning",
    priority: project.priority ?? "medium",
    currentVersion: project.currentVersion ?? "v0.1.0",
    targetVersion: project.targetVersion ?? "v1.0.0",
    linkedActivityId: project.linkedActivityId ?? "",
    milestones: Array.isArray(project.milestones) ? project.milestones : [],
    createdAt: project.createdAt ?? now,
    updatedAt: project.updatedAt ?? now,
  };
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getProjectProgress(project: Project) {
  if (project.milestones.length === 0) return 0;

  const completed = project.milestones.filter(
    (milestone) => milestone.completed
  ).length;

  return Math.round((completed / project.milestones.length) * 100);
}

function getDaysSinceUpdated(project: Project) {
  const updated = new Date(project.updatedAt).getTime();
  const now = Date.now();
  const diff = now - updated;

  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function getProjectHealthScore(project: Project) {
  let score = 50;

  if (project.priority === "high") score += 20;
  if (project.priority === "medium") score += 10;

  if (project.status === "active") score += 20;
  if (project.status === "polishing") score += 18;
  if (project.status === "planning") score += 8;
  if (project.status === "maintenance") score += 5;
  if (project.status === "released") score -= 5;
  if (project.status === "shelved") score -= 20;
  if (project.status === "archived") score -= 35;

  score += Math.round(getProjectProgress(project) * 0.25);

  if (project.nextAction.trim()) score += 10;
  if (project.blockers.trim()) score -= 15;

  const daysSinceUpdated = getDaysSinceUpdated(project);

  if (daysSinceUpdated > 14) score -= 10;
  if (daysSinceUpdated > 30) score -= 20;

  return Math.min(100, Math.max(0, score));
}

function getRecommendedProject(projects: Project[]) {
  const eligibleProjects = projects.filter((project) =>
    ["planning", "active", "polishing", "maintenance"].includes(project.status)
  );

  if (eligibleProjects.length === 0) return null;

  return [...eligibleProjects].sort(
    (a, b) => getProjectHealthScore(b) - getProjectHealthScore(a)
  )[0];
}

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [schedule, setSchedule] = useState<ScheduledSession[]>([]);
  const [captures, setCaptures] = useState<CaptureItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [captureText, setCaptureText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [projectEditingId, setProjectEditingId] = useState<string | null>(null);
  const [formActivity, setFormActivity] = useState<Activity>(emptyActivity());
  const [projectForm, setProjectForm] = useState<Project>(emptyProject());
  const [milestoneDrafts, setMilestoneDrafts] = useState<Record<string, string>>({});
  const [copyStatus, setCopyStatus] = useState("");
  const [movingSessionId, setMovingSessionId] = useState<string | null>(null);
  const [dataMessage, setDataMessage] = useState("");

  const importInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const savedActivities = localStorage.getItem(ACTIVITIES_KEY);
    const savedSchedule = localStorage.getItem(SCHEDULE_KEY);
    const savedCaptures = localStorage.getItem(CAPTURES_KEY);
    const savedProjects = localStorage.getItem(PROJECTS_KEY);

    if (savedActivities) {
      setActivities(JSON.parse(savedActivities).map(normaliseActivity));
    }

    if (savedSchedule) {
      setSchedule(JSON.parse(savedSchedule).map(normaliseSession));
    }

    if (savedCaptures) {
      setCaptures(JSON.parse(savedCaptures).map(normaliseCapture));
    }

    if (savedProjects) {
      setProjects(JSON.parse(savedProjects).map(normaliseProject));
    }
  }, []);

  const aiPrompt = useMemo(() => {
    const activitySummary = activities
      .map((activity) => {
        const normalised = normaliseActivity(activity);

        return `- ${normalised.name}: ${normalised.category}, ${normalised.status}, ${normalised.priority} priority, ${normalised.frequencyPerWeek}x/week, ${normalised.sessionLengthMinutes} min/session, preferred ${
          normalised.preferredDays.length > 0
            ? normalised.preferredDays.join(", ")
            : "any day"
        }, ${normalised.preferredTime}, ${
          normalised.lockedDays ? "locked to preferred days" : "flexible"
        }. Notes: ${normalised.notes || "none"}`;
      })
      .join("\n");

    const projectSummary = projects
      .map((project) => {
        const completedMilestones = project.milestones.filter(
          (milestone) => milestone.completed
        ).length;

        return `- ${project.name}: ${project.status}, ${project.priority} priority, current ${project.currentVersion}, target ${project.targetVersion}, ${completedMilestones}/${project.milestones.length} milestones complete. Progress: ${getProjectProgress(project)}%. Health: ${getProjectHealthScore(project)}%. Next action: ${project.nextAction || "none"}. Blockers: ${project.blockers || "none"}.`;
      })
      .join("\n");

    const scheduleSummary = weekDays
      .map((day) => {
        const sessions = schedule.filter((session) => session.day === day);

        if (sessions.length === 0) {
          return `${day}: No sessions planned.`;
        }

        return `${day}:\n${sessions
          .map(
            (session) =>
              `  - ${session.activityName}: ${session.category}, ${session.timeOfDay}, ${session.durationMinutes} min, ${session.locked ? "locked" : "flexible"}, ${session.completed ? "completed" : "planned"}`
          )
          .join("\n")}`;
      })
      .join("\n\n");

    const captureSummary = captures
      .filter((capture) => !capture.processed)
      .map((capture) => `- ${capture.text}`)
      .join("\n");

    return `You are helping me review my weekly personal progress schedule and project priorities.

My goals:
- Keep consistent progress across software projects, training, meals, hobbies, and life admin.
- Respect locked sessions.
- Avoid overloading heavy fitness sessions on the same day.
- Avoid unnecessary duplicate sessions on the same day.
- Keep the plan realistic and sustainable.
- Prioritise projects that are close to v1.0 or portfolio-ready.
- Consider unprocessed inbox captures if they affect planning.

Projects:
${projectSummary || "No projects added yet."}

Activities:
${activitySummary || "No activities added yet."}

Current generated schedule:
${scheduleSummary || "No schedule generated yet."}

Unprocessed inbox captures:
${captureSummary || "No unprocessed captures."}

Please:
1. Review whether this schedule is balanced.
2. Identify overloaded days or weak spots.
3. Suggest changes while respecting locked sessions.
4. Identify whether any inbox captures should become tasks, activities, or notes.
5. Recommend which project should be focused next and why.
6. Give me a revised weekly schedule in a clear day-by-day format.`;
  }, [activities, schedule, captures, projects]);

  function saveActivities(next: Activity[]) {
    setActivities(next);
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(next));
  }

  function saveSchedule(next: ScheduledSession[]) {
    setSchedule(next);
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(next));
  }

  function saveCaptures(next: CaptureItem[]) {
    setCaptures(next);
    localStorage.setItem(CAPTURES_KEY, JSON.stringify(next));
  }

  function saveProjects(next: Project[]) {
    setProjects(next);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(next));
  }

  function updateForm<K extends keyof Activity>(key: K, value: Activity[K]) {
    setFormActivity((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateProjectForm<K extends keyof Project>(key: K, value: Project[K]) {
    setProjectForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function toggleFormDay(day: string) {
    setFormActivity((current) => {
      const preferredDays = current.preferredDays.includes(day)
        ? current.preferredDays.filter((item) => item !== day)
        : [...current.preferredDays, day];

      return {
        ...current,
        preferredDays,
      };
    });
  }

  function resetForm() {
    setEditingId(null);
    setFormActivity(emptyActivity());
  }

  function resetProjectForm() {
    setProjectEditingId(null);
    setProjectForm(emptyProject());
  }

  function startEditing(activity: Activity) {
    setEditingId(activity.id);
    setFormActivity(normaliseActivity(activity));
    setView("activities");
  }

  function startEditingProject(project: Project) {
    setProjectEditingId(project.id);
    setProjectForm(normaliseProject(project));
    setView("projects");
  }

  function upsertActivity() {
    const activity: Activity = {
      ...formActivity,
      id: editingId ?? crypto.randomUUID(),
      name: formActivity.name.trim(),
    };

    if (!activity.name) return;

    if (activity.lockedDays && activity.preferredDays.length === 0) {
      alert("Locked activities need at least one preferred day selected.");
      return;
    }

    if (editingId) {
      saveActivities(
        activities.map((item) => (item.id === editingId ? activity : item))
      );
    } else {
      saveActivities([...activities, activity]);
    }

    resetForm();
  }

  function upsertProject() {
    const now = new Date().toISOString();

    const project: Project = {
      ...projectForm,
      id: projectEditingId ?? crypto.randomUUID(),
      name: projectForm.name.trim(),
      createdAt: projectEditingId ? projectForm.createdAt : now,
      updatedAt: now,
    };

    if (!project.name) return;

    if (projectEditingId) {
      saveProjects(
        projects.map((item) => (item.id === projectEditingId ? project : item))
      );
    } else {
      saveProjects([project, ...projects]);
    }

    resetProjectForm();
  }

  function deleteActivity(id: string) {
    saveActivities(activities.filter((activity) => activity.id !== id));
    saveSchedule(schedule.filter((session) => session.activityId !== id));

    if (editingId === id) {
      resetForm();
    }
  }

  function deleteProject(id: string) {
    saveProjects(projects.filter((project) => project.id !== id));

    if (projectEditingId === id) {
      resetProjectForm();
    }
  }

  function addMilestone(projectId: string) {
    const title = (milestoneDrafts[projectId] || "").trim();

    if (!title) return;

    const project = projects.find((item) => item.id === projectId);
    const targetVersion = project?.targetVersion || "v1.0.0";

    const milestone: ProjectMilestone = {
      id: crypto.randomUUID(),
      title,
      targetVersion,
      completed: false,
      notes: "",
    };

    saveProjects(
      projects.map((item) =>
        item.id === projectId
          ? {
              ...item,
              milestones: [...item.milestones, milestone],
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );

    setMilestoneDrafts((current) => ({
      ...current,
      [projectId]: "",
    }));
  }

  function toggleMilestone(projectId: string, milestoneId: string) {
    saveProjects(
      projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              milestones: project.milestones.map((milestone) =>
                milestone.id === milestoneId
                  ? { ...milestone, completed: !milestone.completed }
                  : milestone
              ),
              updatedAt: new Date().toISOString(),
            }
          : project
      )
    );
  }

  function deleteMilestone(projectId: string, milestoneId: string) {
    saveProjects(
      projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              milestones: project.milestones.filter(
                (milestone) => milestone.id !== milestoneId
              ),
              updatedAt: new Date().toISOString(),
            }
          : project
      )
    );
  }

  function addCapture() {
    const text = captureText.trim();

    if (!text) return;

    const newCapture: CaptureItem = {
      id: crypto.randomUUID(),
      text,
      createdAt: new Date().toISOString(),
      processed: false,
    };

    saveCaptures([newCapture, ...captures]);
    setCaptureText("");
  }

  function toggleCaptureProcessed(id: string) {
    saveCaptures(
      captures.map((capture) =>
        capture.id === id
          ? { ...capture, processed: !capture.processed }
          : capture
      )
    );
  }

  function deleteCapture(id: string) {
    saveCaptures(captures.filter((capture) => capture.id !== id));
  }

  function clearProcessedCaptures() {
    saveCaptures(captures.filter((capture) => !capture.processed));
    setDataMessage("Processed captures cleared.");
    window.setTimeout(() => setDataMessage(""), 2400);
  }

  function addSession(
    generated: ScheduledSession[],
    activity: Activity,
    day: string,
    locked: boolean,
    dayLoad: Record<string, number>,
    dayFitnessCount: Record<string, number>,
    dayHeavyCount: Record<string, number>
  ) {
    generated.push({
      id: crypto.randomUUID(),
      activityId: activity.id,
      activityName: activity.name,
      category: activity.category,
      day,
      timeOfDay: activity.preferredTime,
      durationMinutes: activity.sessionLengthMinutes,
      completed: false,
      locked,
    });

    dayLoad[day] += activity.sessionLengthMinutes;

    if (activity.category === "fitness") {
      dayFitnessCount[day] += 1;
    }

    if (isHeavyActivity(activity)) {
      dayHeavyCount[day] += 1;
    }
  }

  function generateSchedule() {
    const generated: ScheduledSession[] = [];

    const activeActivities = [...activities]
      .map(normaliseActivity)
      .filter((activity) => activity.status === "active")
      .sort((a, b) => priorityScore(b.priority) - priorityScore(a.priority));

    const dayLoad: Record<string, number> = Object.fromEntries(
      weekDays.map((day) => [day, 0])
    );

    const dayFitnessCount: Record<string, number> = Object.fromEntries(
      weekDays.map((day) => [day, 0])
    );

    const dayHeavyCount: Record<string, number> = Object.fromEntries(
      weekDays.map((day) => [day, 0])
    );

    const lockedActivities = activeActivities.filter(
      (activity) => activity.lockedDays && activity.preferredDays.length > 0
    );

    const flexibleActivities = activeActivities.filter(
      (activity) => !activity.lockedDays || activity.preferredDays.length === 0
    );

    for (const activity of lockedActivities) {
      const lockedDays = activity.preferredDays.slice(
        0,
        activity.frequencyPerWeek
      );

      for (const day of lockedDays) {
        addSession(
          generated,
          activity,
          day,
          true,
          dayLoad,
          dayFitnessCount,
          dayHeavyCount
        );
      }

      if (activity.frequencyPerWeek > activity.preferredDays.length) {
        const extraNeeded =
          activity.frequencyPerWeek - activity.preferredDays.length;
        const existingActivityDays = new Set(activity.preferredDays);

        for (let i = 0; i < extraNeeded; i++) {
          const bestDay = [...weekDays].sort(
            (a, b) =>
              getDayScore(
                a,
                activity,
                dayLoad,
                dayFitnessCount,
                dayHeavyCount,
                existingActivityDays
              ) -
              getDayScore(
                b,
                activity,
                dayLoad,
                dayFitnessCount,
                dayHeavyCount,
                existingActivityDays
              )
          )[0];

          addSession(
            generated,
            activity,
            bestDay,
            false,
            dayLoad,
            dayFitnessCount,
            dayHeavyCount
          );

          existingActivityDays.add(bestDay);
        }
      }
    }

    for (const activity of flexibleActivities) {
      const possibleDays =
        activity.preferredDays.length > 0 ? activity.preferredDays : weekDays;

      const existingActivityDays = new Set<string>();

      for (let i = 0; i < activity.frequencyPerWeek; i++) {
        const bestDay = [...possibleDays].sort(
          (a, b) =>
            getDayScore(
              a,
              activity,
              dayLoad,
              dayFitnessCount,
              dayHeavyCount,
              existingActivityDays
            ) -
            getDayScore(
              b,
              activity,
              dayLoad,
              dayFitnessCount,
              dayHeavyCount,
              existingActivityDays
            )
        )[0];

        addSession(
          generated,
          activity,
          bestDay,
          false,
          dayLoad,
          dayFitnessCount,
          dayHeavyCount
        );

        existingActivityDays.add(bestDay);
      }
    }

    saveSchedule(generated);
    setMovingSessionId(null);
    setView("schedule");
  }

  function toggleSession(id: string) {
    saveSchedule(
      schedule.map((session) =>
        session.id === id
          ? { ...session, completed: !session.completed }
          : session
      )
    );
  }

  function moveSession(sessionId: string, newDay: string) {
    saveSchedule(
      schedule.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              day: newDay,
              locked: false,
            }
          : session
      )
    );

    setMovingSessionId(null);
  }

  function clearSchedule() {
    saveSchedule([]);
    setMovingSessionId(null);
  }

  function weeklyReset() {
    const resetSchedule = schedule.map((session) => ({
      ...session,
      completed: false,
    }));

    saveSchedule(resetSchedule);
    setMovingSessionId(null);
    setDataMessage("Weekly reset complete. Completed sessions were cleared.");
    window.setTimeout(() => setDataMessage(""), 2400);
  }

  function weeklyResetAndRegenerate() {
    generateSchedule();
    setDataMessage("Weekly reset complete. A fresh schedule was generated.");
    window.setTimeout(() => setDataMessage(""), 2400);
  }

  function exportBackup() {
    const backup: BackupData = {
      version: "1.2.0",
      exportedAt: new Date().toISOString(),
      activities,
      schedule,
      captures,
      projects,
    };

    const file = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lifestack-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    link.click();

    URL.revokeObjectURL(url);

    setDataMessage("Backup exported.");
    window.setTimeout(() => setDataMessage(""), 2400);
  }

  function importBackupFile(file: File | undefined) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as BackupData;

        if (!Array.isArray(parsed.activities) || !Array.isArray(parsed.schedule)) {
          throw new Error("Invalid LifeStack backup file.");
        }

        const importedActivities = parsed.activities.map(normaliseActivity);
        const importedSchedule = parsed.schedule.map(normaliseSession);
        const importedCaptures = Array.isArray(parsed.captures)
          ? parsed.captures.map(normaliseCapture)
          : [];
        const importedProjects = Array.isArray(parsed.projects)
          ? parsed.projects.map(normaliseProject)
          : [];

        saveActivities(importedActivities);
        saveSchedule(importedSchedule);
        saveCaptures(importedCaptures);
        saveProjects(importedProjects);

        setDataMessage("Backup imported successfully.");
        window.setTimeout(() => setDataMessage(""), 2400);
      } catch {
        setDataMessage("Import failed. Please choose a valid LifeStack backup.");
        window.setTimeout(() => setDataMessage(""), 3200);
      }
    };

    reader.readAsText(file);
  }

  async function copyAiPrompt() {
    await navigator.clipboard.writeText(aiPrompt);
    setCopyStatus("Copied!");
    window.setTimeout(() => setCopyStatus(""), 1800);
  }

  const completed = schedule.filter((session) => session.completed).length;
  const unprocessedCaptures = captures.filter((capture) => !capture.processed);
  const processedCaptures = captures.filter((capture) => capture.processed);
  const activeProjects = projects.filter((project) =>
    ["planning", "active", "polishing", "maintenance"].includes(project.status)
  );
  const recommendedProject = getRecommendedProject(projects);
  const nearReleaseProjects = projects.filter((project) => {
    const progress = getProjectProgress(project);
    return progress >= 70 && project.status !== "released";
  });
  const blockedProjects = projects.filter((project) => project.blockers.trim());

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>LifeStack</h1>
        <p>Personal progress scheduler</p>

        <nav>
          {navItems.map((viewName) => (
            <button
              key={viewName}
              className={view === viewName ? "nav-button active" : "nav-button"}
              onClick={() => setView(viewName)}
            >
              {viewName === "ai" ? "AI Planner" : viewName}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        {dataMessage && <div className="status-banner">{dataMessage}</div>}

        {view === "dashboard" && (
          <section>
            <p className="eyebrow">Overview</p>

            <div className="page-header">
              <div>
                <h2>Dashboard</h2>
                <p className="muted">
                  Your projects, habits, training, meals and hobbies in one
                  place.
                </p>
              </div>

              <button className="primary-button" onClick={generateSchedule}>
                Generate Schedule
              </button>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <span>Activities</span>
                <strong>{activities.length}</strong>
              </div>

              <div className="stat-card">
                <span>Projects</span>
                <strong>{activeProjects.length}</strong>
              </div>

              <div className="stat-card">
                <span>Inbox</span>
                <strong>{unprocessedCaptures.length}</strong>
              </div>
            </div>

            <div className="utility-grid">
              <article className="card">
                <h3>Weekly reset</h3>
                <p className="muted">
                  Start a new week without changing your activities.
                </p>

                <div className="row-actions utility-actions">
                  <button className="secondary-button" onClick={weeklyReset}>
                    Clear Completion
                  </button>

                  <button
                    className="primary-button"
                    onClick={weeklyResetAndRegenerate}
                  >
                    Reset + Regenerate
                  </button>
                </div>
              </article>

              <article className="card">
                <h3>Backup & restore</h3>
                <p className="muted">
                  Export your local LifeStack data or restore from a backup.
                </p>

                <div className="row-actions utility-actions">
                  <button className="secondary-button" onClick={exportBackup}>
                    Export Backup
                  </button>

                  <button
                    className="secondary-button"
                    onClick={() => importInputRef.current?.click()}
                  >
                    Import Backup
                  </button>

                  <input
                    ref={importInputRef}
                    className="hidden-file-input"
                    type="file"
                    accept="application/json"
                    onChange={(event) =>
                      importBackupFile(event.target.files?.[0])
                    }
                  />
                </div>
              </article>
            </div>
          </section>
        )}

        {view === "activities" && (
          <section>
            <p className="eyebrow">Planning inputs</p>

            <div className="page-header">
              <div>
                <h2>{editingId ? "Edit Activity" : "Add Activity"}</h2>
                <p className="muted">
                  Add fixed sessions and flexible goals for LifeStack to plan.
                </p>
              </div>

              {editingId && (
                <button className="secondary-button" onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
            </div>

            <form
              className="card activity-form"
              onSubmit={(event) => {
                event.preventDefault();
                upsertActivity();
              }}
            >
              <input
                value={formActivity.name}
                onChange={(event) => updateForm("name", event.target.value)}
                placeholder="Name"
              />

              <select
                value={formActivity.category}
                onChange={(event) =>
                  updateForm("category", event.target.value as ActivityCategory)
                }
              >
                <option value="project">Project</option>
                <option value="fitness">Fitness</option>
                <option value="meal">Meal</option>
                <option value="hobby">Hobby</option>
                <option value="life">Life</option>
                <option value="other">Other</option>
              </select>

              <select
                value={formActivity.status}
                onChange={(event) =>
                  updateForm("status", event.target.value as ActivityStatus)
                }
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="complete">Complete</option>
              </select>

              <select
                value={formActivity.priority}
                onChange={(event) =>
                  updateForm("priority", event.target.value as ActivityPriority)
                }
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <input
                type="number"
                min="1"
                max="7"
                value={formActivity.frequencyPerWeek}
                onChange={(event) =>
                  updateForm("frequencyPerWeek", Number(event.target.value))
                }
              />

              <input
                type="number"
                min="10"
                step="5"
                value={formActivity.sessionLengthMinutes}
                onChange={(event) =>
                  updateForm("sessionLengthMinutes", Number(event.target.value))
                }
              />

              <select
                value={formActivity.preferredTime}
                onChange={(event) =>
                  updateForm("preferredTime", event.target.value as TimeOfDay)
                }
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>

              <label className="lock-toggle">
                <input
                  type="checkbox"
                  checked={formActivity.lockedDays}
                  onChange={(event) =>
                    updateForm("lockedDays", event.target.checked)
                  }
                />
                <span>
                  Lock to preferred days
                  <small>
                    Use this for fixed sessions like climbing, calisthenics, or
                    daily project work.
                  </small>
                </span>
              </label>

              <div>
                <p className="field-label">Preferred days</p>

                <div className="day-picker">
                  {weekDays.map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={
                        formActivity.preferredDays.includes(day)
                          ? "day-chip selected"
                          : "day-chip"
                      }
                      onClick={() => toggleFormDay(day)}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={formActivity.notes}
                onChange={(event) => updateForm("notes", event.target.value)}
                placeholder="Notes"
              />

              <button className="primary-button">
                {editingId ? "Update Activity" : "Add Activity"}
              </button>
            </form>

            <div className="activity-list">
              {activities.map((activity) => {
                const normalised = normaliseActivity(activity);

                return (
                  <div key={normalised.id} className="card activity-row">
                    <div>
                      <strong>{normalised.name}</strong>

                      <p className="muted">
                        {normalised.category} · {normalised.status} ·{" "}
                        {normalised.priority} · {normalised.frequencyPerWeek}
                        x/week · {normalised.sessionLengthMinutes} min
                      </p>

                      <p className="muted">
                        Preferred:{" "}
                        {normalised.preferredDays.length > 0
                          ? normalised.preferredDays.join(", ")
                          : "any day"}{" "}
                        · {normalised.preferredTime}
                      </p>

                      <div className="pill-row">
                        {normalised.lockedDays && (
                          <span className="pill locked">locked</span>
                        )}
                      </div>

                      {normalised.notes && <p>{normalised.notes}</p>}
                    </div>

                    <div className="row-actions">
                      <button
                        className="secondary-button"
                        onClick={() => startEditing(normalised)}
                      >
                        Edit
                      </button>

                      <button
                        className="danger-button"
                        onClick={() => deleteActivity(normalised.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {view === "projects" && (
          <section>
            <p className="eyebrow">Portfolio brain</p>

            <div className="page-header">
              <div>
                <h2>{projectEditingId ? "Edit Project" : "Projects"}</h2>
                <p className="muted">
                  Track project versions, milestones, next actions, and shelf
                  status.
                </p>
              </div>

              {projectEditingId && (
                <button className="secondary-button" onClick={resetProjectForm}>
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="project-insights-grid">
              <article className="card insight-card">
                <span className="muted">Recommended focus</span>

                {recommendedProject ? (
                  <>
                    <strong>{recommendedProject.name}</strong>
                    <p className="muted">
                      Health score: {getProjectHealthScore(recommendedProject)}%
                    </p>
                    <span className="pill recommended">focus next</span>
                  </>
                ) : (
                  <p className="muted">No active projects to recommend yet.</p>
                )}
              </article>

              <article className="card insight-card">
                <span className="muted">Near release</span>
                <strong>{nearReleaseProjects.length}</strong>
                <p className="muted">Projects at 70%+ milestone completion.</p>
              </article>

              <article className="card insight-card">
                <span className="muted">Blocked</span>
                <strong>{blockedProjects.length}</strong>
                <p className="muted">Projects with blockers or warning notes.</p>
              </article>
            </div>

            <form
              className="card project-form"
              onSubmit={(event) => {
                event.preventDefault();
                upsertProject();
              }}
            >
              <input
                value={projectForm.name}
                onChange={(event) =>
                  updateProjectForm("name", event.target.value)
                }
                placeholder="Project name"
              />

              <textarea
                value={projectForm.description}
                onChange={(event) =>
                  updateProjectForm("description", event.target.value)
                }
                placeholder="Project description"
              />

              <div className="form-grid">
                <input
                  value={projectForm.category}
                  onChange={(event) =>
                    updateProjectForm("category", event.target.value)
                  }
                  placeholder="Category"
                />

                <select
                  value={projectForm.status}
                  onChange={(event) =>
                    updateProjectForm(
                      "status",
                      event.target.value as ProjectStatus
                    )
                  }
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="polishing">Polishing</option>
                  <option value="released">Released</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="shelved">Shelved</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="form-grid">
                <select
                  value={projectForm.priority}
                  onChange={(event) =>
                    updateProjectForm(
                      "priority",
                      event.target.value as ProjectPriority
                    )
                  }
                >
                  <option value="high">High priority</option>
                  <option value="medium">Medium priority</option>
                  <option value="low">Low priority</option>
                </select>

                <select
                  value={projectForm.linkedActivityId}
                  onChange={(event) =>
                    updateProjectForm("linkedActivityId", event.target.value)
                  }
                >
                  <option value="">No linked activity</option>
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grid">
                <input
                  value={projectForm.currentVersion}
                  onChange={(event) =>
                    updateProjectForm("currentVersion", event.target.value)
                  }
                  placeholder="Current version e.g. v0.4.0"
                />

                <input
                  value={projectForm.targetVersion}
                  onChange={(event) =>
                    updateProjectForm("targetVersion", event.target.value)
                  }
                  placeholder="Target version e.g. v1.0.0"
                />
              </div>

              <input
                value={projectForm.techStack}
                onChange={(event) =>
                  updateProjectForm("techStack", event.target.value)
                }
                placeholder="Tech stack e.g. React, TypeScript, Vite"
              />

              <textarea
                value={projectForm.nextAction}
                onChange={(event) =>
                  updateProjectForm("nextAction", event.target.value)
                }
                placeholder="Next action"
              />

              <textarea
                value={projectForm.blockers}
                onChange={(event) =>
                  updateProjectForm("blockers", event.target.value)
                }
                placeholder="Blockers / notes"
              />

              <button className="primary-button">
                {projectEditingId ? "Update Project" : "Add Project"}
              </button>
            </form>

            <div className="project-list">
              {projects.length === 0 ? (
                <article className="card">
                  <p className="muted">
                    No projects yet. Add LifeStack, Momentum, Game Manager, or
                    Data Structure Visualiser to get started.
                  </p>
                </article>
              ) : (
                projects.map((project) => {
                  const linkedActivity = activities.find(
                    (activity) => activity.id === project.linkedActivityId
                  );

                  const completedMilestones = project.milestones.filter(
                    (milestone) => milestone.completed
                  ).length;

                  return (
                    <article key={project.id} className="card project-card">
                      <div className="project-card-header">
                        <div>
                          <h3>{project.name}</h3>
                          <p className="muted">{project.description}</p>
                        </div>

                        <div className="row-actions">
                          <button
                            className="secondary-button"
                            onClick={() => startEditingProject(project)}
                          >
                            Edit
                          </button>

                          <button
                            className="danger-button"
                            onClick={() => deleteProject(project.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="project-meta-grid">
                        <span className="pill">{project.status}</span>
                        <span className="pill">{project.priority}</span>
                        <span className="pill">
                          {project.currentVersion} → {project.targetVersion}
                        </span>

                        {recommendedProject?.id === project.id && (
                          <span className="pill recommended">
                            recommended focus
                          </span>
                        )}

                        {linkedActivity && (
                          <span className="pill locked">
                            linked: {linkedActivity.name}
                          </span>
                        )}
                      </div>

                      <div className="project-progress-row">
                        <div className="project-card-footer">
                          <span>Progress: {getProjectProgress(project)}%</span>
                          <span>Health: {getProjectHealthScore(project)}%</span>
                          <span>
                            Updated {getDaysSinceUpdated(project)} days ago
                          </span>
                        </div>

                        <div className="health-bar">
                          <div
                            className="health-fill"
                            style={{
                              width: `${getProjectHealthScore(project)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {project.techStack && (
                        <p className="muted">Stack: {project.techStack}</p>
                      )}

                      {project.nextAction && (
                        <div className="project-note">
                          <strong>Next action</strong>
                          <p>{project.nextAction}</p>
                        </div>
                      )}

                      {project.blockers && (
                        <div className="project-note warning-note">
                          <strong>Blockers / notes</strong>
                          <p>{project.blockers}</p>
                        </div>
                      )}

                      <div className="milestone-section">
                        <div className="milestone-header">
                          <h4>
                            Milestones {completedMilestones}/
                            {project.milestones.length}
                          </h4>
                        </div>

                        <div className="milestone-list">
                          {project.milestones.length === 0 ? (
                            <p className="muted">
                              No milestones yet. Add what needs to be done
                              before {project.targetVersion}.
                            </p>
                          ) : (
                            project.milestones.map((milestone) => (
                              <div
                                key={milestone.id}
                                className={
                                  milestone.completed
                                    ? "milestone-item complete"
                                    : "milestone-item"
                                }
                              >
                                <button
                                  className="milestone-toggle"
                                  onClick={() =>
                                    toggleMilestone(project.id, milestone.id)
                                  }
                                >
                                  {milestone.completed ? "✓" : ""}
                                </button>

                                <div>
                                  <strong>{milestone.title}</strong>
                                  <p className="muted">
                                    Target: {milestone.targetVersion}
                                  </p>
                                </div>

                                <button
                                  className="danger-button compact-button"
                                  onClick={() =>
                                    deleteMilestone(project.id, milestone.id)
                                  }
                                >
                                  Delete
                                </button>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="milestone-add-row">
                          <input
                            value={milestoneDrafts[project.id] || ""}
                            onChange={(event) =>
                              setMilestoneDrafts((current) => ({
                                ...current,
                                [project.id]: event.target.value,
                              }))
                            }
                            placeholder={`Add milestone for ${project.targetVersion}`}
                          />

                          <button
                            className="secondary-button"
                            onClick={() => addMilestone(project.id)}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        )}

        {view === "schedule" && (
          <section>
            <p className="eyebrow">Weekly rhythm</p>

            <div className="page-header">
              <div>
                <h2>Schedule</h2>
                <p className="muted">
                  Generate a week, then manually move sessions if your real week
                  needs adjustment.
                </p>
              </div>

              <div className="row-actions">
                <button className="primary-button" onClick={generateSchedule}>
                  Regenerate
                </button>

                <button className="secondary-button" onClick={weeklyReset}>
                  Weekly Reset
                </button>

                <button className="danger-button" onClick={clearSchedule}>
                  Clear
                </button>
              </div>
            </div>

            <div className="schedule-grid">
              {weekDays.map((day) => {
                const daySessions = schedule.filter(
                  (session) => session.day === day
                );

                const totalMinutes = daySessions.reduce(
                  (total, session) => total + session.durationMinutes,
                  0
                );

                return (
                  <div key={day} className="card day-card">
                    <div className="day-card-header">
                      <h3>{day}</h3>
                      <span className="day-total">{totalMinutes} min</span>
                    </div>

                    {daySessions.length === 0 ? (
                      <p className="muted empty-day">No sessions planned.</p>
                    ) : (
                      <div className="session-list">
                        {daySessions.map((session) => (
                          <div
                            key={session.id}
                            className={
                              session.completed
                                ? "session-card completed"
                                : "session-card"
                            }
                          >
                            <button
                              className="session-main-button"
                              onClick={() => toggleSession(session.id)}
                            >
                              <div>
                                <strong>{session.activityName}</strong>
                                <span className="session-meta">
                                  {session.category} · {session.timeOfDay} ·{" "}
                                  {session.durationMinutes} min
                                </span>
                              </div>

                              <div className="session-footer">
                                {session.locked && (
                                  <span className="pill locked">locked</span>
                                )}

                                <span className="session-status">
                                  {session.completed ? "Done" : "Planned"}
                                </span>
                              </div>
                            </button>

                            {movingSessionId === session.id ? (
                              <div className="move-panel">
                                <p className="move-label">Move to:</p>

                                <div className="move-day-grid">
                                  {weekDays.map((targetDay) => (
                                    <button
                                      key={targetDay}
                                      className={
                                        targetDay === session.day
                                          ? "move-day-button current"
                                          : "move-day-button"
                                      }
                                      onClick={() =>
                                        moveSession(session.id, targetDay)
                                      }
                                    >
                                      {targetDay.slice(0, 3)}
                                    </button>
                                  ))}
                                </div>

                                <button
                                  className="secondary-button compact-button"
                                  onClick={() => setMovingSessionId(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                className="secondary-button compact-button"
                                onClick={() => setMovingSessionId(session.id)}
                              >
                                Move
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {view === "inbox" && (
          <section>
            <p className="eyebrow">Quick capture</p>

            <div className="page-header">
              <div>
                <h2>Inbox</h2>
                <p className="muted">
                  Dump thoughts here first. Process them into modules later.
                </p>
              </div>

              <button
                className="secondary-button"
                onClick={clearProcessedCaptures}
              >
                Clear Processed
              </button>
            </div>

            <form
              className="card capture-form"
              onSubmit={(event) => {
                event.preventDefault();
                addCapture();
              }}
            >
              <textarea
                value={captureText}
                onChange={(event) => setCaptureText(event.target.value)}
                placeholder="Capture a thought, project idea, meal note, training reminder..."
              />

              <button className="primary-button">Add Capture</button>
            </form>

            <div className="capture-grid">
              <article className="card">
                <h3>Unprocessed</h3>

                <div className="capture-list">
                  {unprocessedCaptures.length === 0 ? (
                    <p className="muted">No open captures.</p>
                  ) : (
                    unprocessedCaptures.map((capture) => (
                      <div key={capture.id} className="capture-item">
                        <p>{capture.text}</p>

                        <div className="capture-meta-row">
                          <span>{formatDateTime(capture.createdAt)}</span>

                          <div className="row-actions">
                            <button
                              className="secondary-button compact-button"
                              onClick={() => toggleCaptureProcessed(capture.id)}
                            >
                              Processed
                            </button>

                            <button
                              className="danger-button compact-button"
                              onClick={() => deleteCapture(capture.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </article>

              <article className="card">
                <h3>Processed</h3>

                <div className="capture-list">
                  {processedCaptures.length === 0 ? (
                    <p className="muted">Processed captures will appear here.</p>
                  ) : (
                    processedCaptures.map((capture) => (
                      <div key={capture.id} className="capture-item processed">
                        <p>{capture.text}</p>

                        <div className="capture-meta-row">
                          <span>{formatDateTime(capture.createdAt)}</span>

                          <div className="row-actions">
                            <button
                              className="secondary-button compact-button"
                              onClick={() => toggleCaptureProcessed(capture.id)}
                            >
                              Reopen
                            </button>

                            <button
                              className="danger-button compact-button"
                              onClick={() => deleteCapture(capture.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </article>
            </div>
          </section>
        )}

        {view === "ai" && (
          <section>
            <p className="eyebrow">AI planning assistant</p>

            <div className="page-header">
              <div>
                <h2>AI Planner</h2>
                <p className="muted">
                  Generate a structured prompt from your LifeStack data for
                  schedule review.
                </p>
              </div>

              <button className="primary-button" onClick={copyAiPrompt}>
                {copyStatus || "Copy Prompt"}
              </button>
            </div>

            <div className="card ai-card">
              <h3>Generated planning prompt</h3>
              <p className="muted">
                Paste this into ChatGPT to get a schedule review or revised
                weekly plan without using a paid API.
              </p>

              <textarea className="ai-prompt-box" value={aiPrompt} readOnly />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
