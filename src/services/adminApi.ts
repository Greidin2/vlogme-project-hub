import { apiConfig } from "../config/api";

export type AccessRoleId = "admin" | "content-manager" | "platform-lead" | "marketing" | "viewer";

export type AccessEntry = {
  email: string;
  name: string;
  role: AccessRoleId;
  status: "active" | "paused";
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
};

export type CurrentAccess = {
  identity: {
    email: string;
    name?: string;
  };
  role: AccessRoleId;
  status: "active" | "paused";
  isAdmin: boolean;
};

export type ReportAttachment = {
  name: string;
  type: string;
  base64: string;
};

export type MeetingFormat = "text" | "google-doc";

export type ReportItem = {
  id: string;
  kind: "report" | "meeting";
  title: string;
  description: string;
  category: "general" | "content" | "publication" | "marketing" | "help" | "meeting";
  eventDate: string;
  createdAt: string;
  meetingFormat?: MeetingFormat;
  googleDocUrl?: string | null;
  submittedBy: {
    email: string;
    name?: string;
    role?: AccessRoleId;
  };
  attachments: Array<{
    id: string;
    originalName: string;
    mimeType: string;
    size: number;
    downloadUrl: string | null;
  }>;
};

type JsonResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

export type HistoryFilters = {
  role?: string;
  email?: string;
  from?: string;
  to?: string;
  q?: string;
};

function buildQuery(filters?: HistoryFilters) {
  const params = new URLSearchParams();

  if (!filters) {
    return "";
  }

  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<JsonResult<T>> {
  try {
    const response = await fetch(url, {
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
      ...init,
    });

    const text = await response.text();
    const data = text ? (JSON.parse(text) as unknown) : null;

    if (!response.ok) {
      const message = typeof data === "object" && data !== null && "error" in data
        ? String((data as { error?: unknown }).error ?? "Request failed")
        : response.statusText;

      return { ok: false, status: response.status, message };
    }

    return { ok: true, data: data as T };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      message: error instanceof Error ? error.message : "Unexpected request error",
    };
  }
}

export async function getCurrentAccess() {
  return requestJson<CurrentAccess>(apiConfig.me);
}

export async function listAccessEntries() {
  return requestJson<{ entries: AccessEntry[] }>(apiConfig.accessEntries);
}

export async function saveAccessEntry(entry: AccessEntry) {
  return requestJson<{ entry: AccessEntry }>(apiConfig.accessEntries, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(entry),
  });
}

export async function removeAccessEntry(email: string) {
  return requestJson<{ ok: true }>(`${apiConfig.accessEntries}/${encodeURIComponent(email)}`, {
    method: "DELETE",
  });
}

export async function listReports() {
  return requestJson<{ reports: ReportItem[] }>(apiConfig.reports);
}

export async function createReport(input: {
  title: string;
  description: string;
  category: "general" | "content" | "publication" | "marketing" | "help";
  eventDate: string;
  attachments: ReportAttachment[];
}) {
  return requestJson<{ report: ReportItem }>(apiConfig.reports, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export async function listMeetings() {
  return requestJson<{ meetings: ReportItem[] }>(apiConfig.meetings);
}

export async function createMeeting(input: {
  title: string;
  description: string;
  category: "meeting" | "general";
  eventDate: string;
  meetingFormat: MeetingFormat;
  googleDocUrl?: string;
  attachments: ReportAttachment[];
}) {
  return requestJson<{ meeting: ReportItem }>(apiConfig.meetings, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export async function getReportFile(fileId: string) {
  return apiConfig.reportFile(fileId);
}

export async function listHistoryEntries(kind: "report" | "meeting", filters?: HistoryFilters) {
  const endpoint = kind === "report" ? apiConfig.reports : apiConfig.meetings;
  return requestJson<{ reports?: ReportItem[]; meetings?: ReportItem[] }>(`${endpoint}${buildQuery(filters)}`);
}
