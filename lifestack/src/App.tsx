import { useEffect, useMemo, useState } from "react";
import "./index.css";
import type {
  Activity,
  ActivityCategory,
  ActivityPriority,
  ActivityStatus,
  ScheduledSession,
  TimeOfDay,
} from "./types";

type View = "dashboard" | "activities" | "schedule" | "ai";

const navItems: View[] = ["dashboard", "activities", "schedule", "ai"];

const ACTIVITIES_KEY = "lifestack.activities";
const SCHEDULE_KEY = "lifestack.schedule";

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

function normaliseActivity(activity: Activity): Activity {
  return {
    ...activity,
    lockedDays: activity.lockedDays ?? false,
    preferredDays: activity.preferredDays ?? [],
    preferredTime: activity.preferredTime ?? "evening",
    status: activity.status ?? "active",
  };
}

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [schedule, setSchedule] = useState<ScheduledSession[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formActivity, setFormActivity] = useState<Activity>(emptyActivity());
  const [copyStatus, setCopyStatus] = useState("");
  const [movingSessionId, setMovingSessionId] = useState<string | null>(null);

  useEffect(() => {
    const savedActivities = localStorage.getItem(ACTIVITIES_KEY);
    const savedSchedule = localStorage.getItem(SCHEDULE_KEY);

    if (savedActivities) {
      setActivities(JSON.parse(savedActivities).map(normaliseActivity));
    }

    if (savedSchedule) {
      setSchedule(JSON.parse(savedSchedule));
    }
  }, []);

  const aiPrompt = useMemo(() => {
    const activitySummary = activities
      .map((activity) => {
        const normalised = normaliseActivity(activity);

        return `- ${normalised.name}: ${normalised.category}, ${normalised.status}, ${normalised.priority} priority, ${normalised.frequencyPerWeek}x/week, ${normalised.sessionLengthMinutes} min/session, preferred ${normalised.preferredDays.length > 0 ? normalised.preferredDays.join(", ") : "any day"}, ${normalised.preferredTime}, ${normalised.lockedDays ? "locked to preferred days" : "flexible"}. Notes: ${normalised.notes || "none"}`;
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

    return `You are helping me review my weekly personal progress schedule.

My goals:
- Keep consistent progress across software projects, training, meals, hobbies, and life admin.
- Respect locked sessions.
- Avoid overloading heavy fitness sessions on the same day.
- Avoid unnecessary duplicate sessions on the same day.
- Keep the plan realistic and sustainable.

Activities:
${activitySummary || "No activities added yet."}

Current generated schedule:
${scheduleSummary || "No schedule generated yet."}

Please:
1. Review whether this schedule is balanced.
2. Identify overloaded days or weak spots.
3. Suggest changes while respecting locked sessions.
4. Explain the reasoning briefly.
5. Give me a revised weekly schedule in a clear day-by-day format.`;
  }, [activities, schedule]);

  function saveActivities(next: Activity[]) {
    setActivities(next);
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(next));
  }

  function saveSchedule(next: ScheduledSession[]) {
    setSchedule(next);
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(next));
  }

  function updateForm<K extends keyof Activity>(key: K, value: Activity[K]) {
    setFormActivity((current) => ({
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

  function startEditing(activity: Activity) {
    setEditingId(activity.id);
    setFormActivity(normaliseActivity(activity));
    setView("activities");
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

  function deleteActivity(id: string) {
    saveActivities(activities.filter((activity) => activity.id !== id));
    saveSchedule(schedule.filter((session) => session.activityId !== id));

    if (editingId === id) {
      resetForm();
    }
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
      const lockedDays = activity.preferredDays.slice(0, activity.frequencyPerWeek);

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
        const extraNeeded = activity.frequencyPerWeek - activity.preferredDays.length;
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

  async function copyAiPrompt() {
    await navigator.clipboard.writeText(aiPrompt);
    setCopyStatus("Copied!");
    window.setTimeout(() => setCopyStatus(""), 1800);
  }

  const completed = schedule.filter((session) => session.completed).length;

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
                <span>Sessions</span>
                <strong>{schedule.length}</strong>
              </div>

              <div className="stat-card">
                <span>Progress</span>
                <strong>
                  {completed} / {schedule.length}
                </strong>
              </div>
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