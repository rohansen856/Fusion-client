// Dummy in-browser notifications for local demo / QA of the Dashboard UI.
// State is persisted to localStorage so user interactions survive reloads.
// No backend changes are required.

const STORAGE_KEY = "mockDashboardNotifications_v1";

const ACCEPTANCE_WINDOW_DAYS = 3;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function nowIso() {
  return new Date().toISOString();
}

function inDays(days) {
  return new Date(Date.now() + days * MS_PER_DAY).toISOString();
}

function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function writeState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable / quota exceeded – ignore */
  }
}

// Called when a demo is first shown so the "created at" and the auto-reject
// deadline track the user's install time (not the code build time).
function initTimestamps(state, defaults) {
  const next = { ...state };
  let changed = false;
  for (const d of defaults) {
    if (!next[d.id]) {
      next[d.id] = {
        createdAt: nowIso(),
        offerDeadline: d.kind === "offer" ? inDays(ACCEPTANCE_WINDOW_DAYS) : null,
      };
      changed = true;
    }
  }
  if (changed) writeState(next);
  return next;
}

const DEFAULT_MOCKS = [
  {
    id: "mock-interview-1",
    kind: "interview",
    verb: "Interview scheduled · Acme Corp — SDE Intern",
    description:
      "Your technical interview with Acme Corp for the SDE Intern role is scheduled on 22 Apr 2026 at 14:00 IST. Join the Google Meet link 10 minutes early with a government ID.",
    data: {
      module: "Placement",
      flag: "notification",
      category: "INTERVIEW",
      meta: {
        company: "Acme Corp",
        role: "SDE Intern",
        round: "Technical Round 1",
        when: "22 Apr 2026, 14:00 IST",
        mode: "Online (Google Meet)",
      },
    },
    unread: true,
  },
  {
    id: "mock-offer-1",
    kind: "offer",
    verb: "Job offer · Globex Inc — Software Engineer",
    description:
      "You have received an offer of ₹ 18.00 LPA for the Software Engineer role at Globex Inc. Accept or decline within 3 days — the offer auto-rejects after that.",
    data: {
      module: "Placement",
      flag: "notification",
      category: "OFFER",
      meta: {
        company: "Globex Inc",
        role: "Software Engineer",
        ctc: "₹ 18.00 LPA",
        location: "Bengaluru",
      },
    },
    unread: true,
    status: "PENDING", // ACCEPTED | DECLINED | AUTO_REJECTED
  },
  {
    id: "mock-ann-1",
    kind: "announcement",
    verb: "Campus drive · Microsoft visiting 20 Apr 2026",
    description:
      "Microsoft is visiting campus on 20 Apr 2026 for SDE 1 roles. Register via the Job Postings tab. Last date to register: 18 Apr 2026, 18:00.",
    data: {
      module: "Placement",
      flag: "announcement",
      category: "DRIVE",
    },
    unread: true,
  },
];

function mergeUserState(mock, state) {
  const saved = state[mock.id] || {};
  const merged = {
    ...mock,
    ...saved,
    data: { ...mock.data, ...(saved.data || {}) },
    // Keep the flag/category from the default (avoid the user patch
    // accidentally clobbering routing flags).
    timestamp: saved.createdAt || mock.timestamp || nowIso(),
    offerDeadline: saved.offerDeadline ?? mock.offerDeadline ?? null,
    starred: !!saved.starred,
    deleted: !!saved.deleted,
    unread: saved.unread !== undefined ? !!saved.unread : !!mock.unread,
    mock: true,
  };

  if (merged.kind === "offer") {
    merged.status = saved.status || mock.status || "PENDING";
    if (merged.status === "PENDING" && merged.offerDeadline) {
      const dl = new Date(merged.offerDeadline).getTime();
      if (!Number.isNaN(dl) && Date.now() > dl) {
        merged.status = "AUTO_REJECTED";
        // persist the auto-reject so the dashboard stays consistent
        state[mock.id] = { ...(state[mock.id] || {}), status: "AUTO_REJECTED" };
        writeState(state);
      }
    }
  }
  return merged;
}

export function loadMockNotifications() {
  let state = readState();
  state = initTimestamps(state, DEFAULT_MOCKS);
  return DEFAULT_MOCKS.filter((m) => !(state[m.id]?.deleted)).map((m) =>
    mergeUserState(m, state),
  );
}

export function patchMockNotification(id, patch) {
  const state = readState();
  state[id] = { ...(state[id] || {}), ...patch };
  writeState(state);
}

export function isMockNotification(id) {
  return typeof id === "string" && id.startsWith("mock-");
}

export function resetMockNotifications() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export const OFFER_ACCEPTANCE_DAYS = ACCEPTANCE_WINDOW_DAYS;

export function formatTimeLeft(deadlineIso) {
  if (!deadlineIso) return null;
  const dl = new Date(deadlineIso).getTime();
  if (Number.isNaN(dl)) return null;
  const diff = dl - Date.now();
  if (diff <= 0) return "Expired";
  const hrs = Math.floor(diff / (60 * 60 * 1000));
  const days = Math.floor(hrs / 24);
  const remHrs = hrs % 24;
  const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  if (days > 0) return `${days}d ${remHrs}h left`;
  if (hrs > 0) return `${hrs}h ${mins}m left`;
  return `${mins}m left`;
}
