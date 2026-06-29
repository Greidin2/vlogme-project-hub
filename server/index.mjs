import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import {
  accessFile,
  base64ToBytes,
  ensureStorage,
  normalizeEmail,
  readJsonFile,
  reportsFile,
  safeSlug,
  uploadDir,
  writeJsonFile,
} from "./lib/storage.mjs";
import { getAuthenticatedIdentity, getSeededAdminEmails } from "./lib/auth.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "dist");

const allowedRoles = [
  { id: "admin", label: "Админ" },
  { id: "content-manager", label: "Контент-менеджер" },
  { id: "platform-lead", label: "Platform Lead" },
  { id: "marketing", label: "Маркетинг" },
  { id: "viewer", label: "Просмотр" },
];

const allowedStatuses = new Set(["active", "paused"]);
const allowedCategories = new Set(["general", "content", "publication", "marketing", "help", "meeting"]);
const allowedKinds = new Set(["report", "meeting"]);
const allowedMeetingFormats = new Set(["text", "google-doc"]);

async function initializeData() {
  await ensureStorage();

  const seededAdmins = await getSeededAdminEmails();
  const accessEntries = await readJsonFile(accessFile, null);

  if (!Array.isArray(accessEntries) || accessEntries.length === 0) {
    const now = new Date().toISOString();
    await writeJsonFile(
      accessFile,
      seededAdmins.map((email) => ({
        email,
        name: "Admin",
        role: "admin",
        status: "active",
        createdAt: now,
        updatedAt: now,
      })),
    );
  }

  const reports = await readJsonFile(reportsFile, null);

  if (!Array.isArray(reports)) {
    await writeJsonFile(reportsFile, []);
  }
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

async function serveStaticAsset(pathname, res) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const candidatePath = path.normalize(path.join(distDir, safePath));

  const relative = path.relative(distDir, candidatePath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return false;
  }

  try {
    const stats = await fs.stat(candidatePath);
    if (!stats.isFile()) {
      throw new Error("Not a file");
    }

    const fileBuffer = await fs.readFile(candidatePath);
    const ext = path.extname(candidatePath).toLowerCase();
    const contentType =
      ext === ".html"
        ? "text/html; charset=utf-8"
        : ext === ".js"
          ? "text/javascript; charset=utf-8"
          : ext === ".css"
            ? "text/css; charset=utf-8"
            : ext === ".json"
              ? "application/json; charset=utf-8"
              : ext === ".svg"
                ? "image/svg+xml"
                : ext === ".png"
                  ? "image/png"
                  : ext === ".jpg" || ext === ".jpeg"
                    ? "image/jpeg"
                    : ext === ".webp"
                      ? "image/webp"
                      : "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": fileBuffer.length,
    });
    res.end(fileBuffer);
    return true;
  } catch {
    if (safePath !== "/index.html") {
      try {
        const indexBuffer = await fs.readFile(path.join(distDir, "index.html"));
        res.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Length": indexBuffer.length,
        });
        res.end(indexBuffer);
        return true;
      } catch {
        return false;
      }
    }

    return false;
  }
}

async function readJsonBody(req, limit = 1_048_576) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;

    if (size > limit) {
      const error = new Error("Payload too large");
      error.statusCode = 413;
      throw error;
    }

    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString("utf8");

  if (!raw.trim()) {
    return {};
  }

  return JSON.parse(raw);
}

async function loadAccessEntries() {
  const entries = await readJsonFile(accessFile, []);
  return Array.isArray(entries) ? entries : [];
}

async function saveAccessEntries(entries) {
  await writeJsonFile(accessFile, entries);
}

async function loadReports() {
  const reports = await readJsonFile(reportsFile, []);
  if (!Array.isArray(reports)) {
    return [];
  }

  return reports.map(normalizeHistoryEntry);
}

async function saveReports(reports) {
  await writeJsonFile(reportsFile, reports);
}

function getAllowedRoleIds() {
  return allowedRoles.map((role) => role.id);
}

function toDateInputValue(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return new Date().toISOString().slice(0, 10);
}

function normalizeHistoryEntry(entry) {
  const attachments = Array.isArray(entry.attachments) ? entry.attachments : [];
  const meetingFormat = typeof entry.meetingFormat === "string" && allowedMeetingFormats.has(entry.meetingFormat)
    ? entry.meetingFormat
    : (typeof entry.googleDocUrl === "string" && entry.googleDocUrl.trim() ? "google-doc" : "text");
  const googleDocUrl = typeof entry.googleDocUrl === "string" && entry.googleDocUrl.trim() ? entry.googleDocUrl.trim() : null;

  return {
    id: typeof entry.id === "string" ? entry.id : randomUUID(),
    kind: allowedKinds.has(entry.kind) ? entry.kind : "report",
    title: typeof entry.title === "string" ? entry.title : "",
    description: typeof entry.description === "string" ? entry.description : "",
    category: typeof entry.category === "string" && allowedCategories.has(entry.category) ? entry.category : "general",
    eventDate: toDateInputValue(entry.eventDate ?? entry.createdAt),
    createdAt: typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString(),
    meetingFormat: entry.kind === "meeting" ? meetingFormat : undefined,
    googleDocUrl: entry.kind === "meeting" ? googleDocUrl : null,
    submittedBy: {
      email: typeof entry.submittedBy?.email === "string" ? normalizeEmail(entry.submittedBy.email) : "",
      name: typeof entry.submittedBy?.name === "string" ? entry.submittedBy.name : "",
      role: typeof entry.submittedBy?.role === "string" && getAllowedRoleIds().includes(entry.submittedBy.role)
        ? entry.submittedBy.role
        : "viewer",
    },
    attachments: attachments
      .filter((attachment) => attachment && typeof attachment === "object")
      .map((attachment) => ({
        id: typeof attachment.id === "string" ? attachment.id : randomUUID(),
        originalName: typeof attachment.originalName === "string" ? attachment.originalName : "file",
        mimeType: typeof attachment.mimeType === "string" ? attachment.mimeType : "application/octet-stream",
        size: typeof attachment.size === "number" ? attachment.size : 0,
        storageName: typeof attachment.storageName === "string" ? attachment.storageName : "",
        downloadName: typeof attachment.downloadName === "string" ? attachment.downloadName : "file",
      })),
  };
}

function validateAccessEntry(payload) {
  const email = typeof payload.email === "string" ? normalizeEmail(payload.email) : "";
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const role = typeof payload.role === "string" ? payload.role.trim() : "";
  const status = typeof payload.status === "string" ? payload.status.trim() : "";

  if (!email || !email.includes("@")) {
    throw Object.assign(new Error("Email is required"), { statusCode: 400 });
  }

  if (!getAllowedRoleIds().includes(role)) {
    throw Object.assign(new Error("Unknown role"), { statusCode: 400 });
  }

  if (!allowedStatuses.has(status)) {
    throw Object.assign(new Error("Unknown status"), { statusCode: 400 });
  }

  return {
    email,
    name,
    role,
    status,
  };
}

function validateReportPayload(payload) {
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const description = typeof payload.description === "string" ? payload.description.trim() : "";
  const category = typeof payload.category === "string" ? payload.category.trim() : "general";
  const eventDate = typeof payload.eventDate === "string" ? payload.eventDate.trim() : toDateInputValue("");
  const attachments = Array.isArray(payload.attachments) ? payload.attachments : [];

  if (!title) {
    throw Object.assign(new Error("Title is required"), { statusCode: 400 });
  }

  if (!allowedCategories.has(category)) {
    throw Object.assign(new Error("Unknown category"), { statusCode: 400 });
  }

  return {
    title,
    description,
    category,
    eventDate: toDateInputValue(eventDate),
    attachments: attachments.slice(0, 3).filter((attachment) => {
      return attachment && typeof attachment === "object" && typeof attachment.base64 === "string";
    }),
  };
}

function validateMeetingPayload(payload) {
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const description = typeof payload.description === "string" ? payload.description.trim() : "";
  const eventDate = typeof payload.eventDate === "string" ? payload.eventDate.trim() : toDateInputValue("");
  const category = typeof payload.category === "string" ? payload.category.trim() : "meeting";
  const meetingFormat = typeof payload.meetingFormat === "string" && allowedMeetingFormats.has(payload.meetingFormat)
    ? payload.meetingFormat
    : "text";
  const googleDocUrl = typeof payload.googleDocUrl === "string" ? payload.googleDocUrl.trim() : "";
  const attachments = Array.isArray(payload.attachments) ? payload.attachments : [];

  if (!title) {
    throw Object.assign(new Error("Title is required"), { statusCode: 400 });
  }

  if (meetingFormat === "google-doc") {
    let parsedUrl;

    try {
      parsedUrl = new URL(googleDocUrl);
    } catch {
      throw Object.assign(new Error("Google Doc URL is required"), { statusCode: 400 });
    }

    if (parsedUrl.protocol !== "https:" || parsedUrl.hostname !== "docs.google.com") {
      throw Object.assign(new Error("Google Doc URL must use docs.google.com"), { statusCode: 400 });
    }
  }

  return {
    title,
    description,
    category: allowedCategories.has(category) ? category : "meeting",
    eventDate: toDateInputValue(eventDate),
    meetingFormat,
    googleDocUrl: meetingFormat === "google-doc" ? googleDocUrl : "",
    attachments: attachments.slice(0, 3).filter((attachment) => {
      return attachment && typeof attachment === "object" && typeof attachment.base64 === "string";
    }),
  };
}

function countActiveAdmins(entries) {
  return entries.filter((entry) => entry.role === "admin" && entry.status === "active").length;
}

function parseHistoryFilters(searchParams) {
  const kind = searchParams.get("kind");
  const role = searchParams.get("role");
  const email = searchParams.get("email");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const q = searchParams.get("q");

  return {
    kind: kind && allowedKinds.has(kind) ? kind : null,
    role: role && getAllowedRoleIds().includes(role) ? role : null,
    email: email && email.includes("@") ? normalizeEmail(email) : null,
    from: from && /^\d{4}-\d{2}-\d{2}$/.test(from) ? from : null,
    to: to && /^\d{4}-\d{2}-\d{2}$/.test(to) ? to : null,
    q: q && q.trim() ? q.trim().toLowerCase() : null,
  };
}

function isWithinDateRange(value, from, to) {
  if (from && value < from) {
    return false;
  }

  if (to && value > to) {
    return false;
  }

  return true;
}

function filterHistoryEntries(entries, filters) {
  return entries.filter((entry) => {
    if (filters.kind && entry.kind !== filters.kind) {
      return false;
    }

    if (filters.role && entry.submittedBy.role !== filters.role) {
      return false;
    }

    if (filters.email && entry.submittedBy.email !== filters.email) {
      return false;
    }

    if (!isWithinDateRange(entry.eventDate, filters.from, filters.to)) {
      return false;
    }

    if (filters.q) {
      const haystack = `${entry.title} ${entry.description} ${entry.submittedBy.email} ${entry.submittedBy.name}`.toLowerCase();
      if (!haystack.includes(filters.q)) {
        return false;
      }
    }

    return true;
  });
}

function pickPublicHistoryEntry(entry) {
  return {
    id: entry.id,
    kind: entry.kind,
    title: entry.title,
    description: entry.description,
    category: entry.category,
    eventDate: entry.eventDate,
    createdAt: entry.createdAt,
    submittedBy: entry.submittedBy,
    attachments: entry.attachments.map((file) => ({
      id: file.id,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      downloadUrl: `/api/files/${file.id}`,
    })),
  };
}

async function authorize(request, { adminOnly = false } = {}) {
  const identity = await getAuthenticatedIdentity(request);

  if (!identity) {
    const error = new Error("Authentication required");
    error.statusCode = 401;
    throw error;
  }

  const entries = await loadAccessEntries();
  const entry = entries.find((item) => item.email === identity.email);

  if (!entry || entry.status !== "active") {
    const error = new Error("Access is not enabled for this email");
    error.statusCode = 403;
    throw error;
  }

  if (adminOnly && entry.role !== "admin") {
    const error = new Error("Admin role required");
    error.statusCode = 403;
    throw error;
  }

  return { identity, entry, entries };
}

async function storeAttachment(reportId, attachment) {
  const originalName = typeof attachment.name === "string" && attachment.name.trim() ? attachment.name.trim() : "file";
  const mimeType = typeof attachment.type === "string" && attachment.type.trim() ? attachment.type.trim() : "application/octet-stream";
  const base64 = typeof attachment.base64 === "string" ? attachment.base64 : "";

  if (!base64) {
    throw Object.assign(new Error("Attachment base64 is required"), { statusCode: 400 });
  }

  const bytes = base64ToBytes(base64);

  if (bytes.length > 20 * 1024 * 1024) {
    throw Object.assign(new Error("Attachment is too large"), { statusCode: 413 });
  }

  const fileId = randomUUID();
  const safeName = safeSlug(path.parse(originalName).name);
  const suffix = path.extname(originalName).toLowerCase() || ".bin";
  const storageName = `${reportId}-${fileId}-${safeName}${suffix}`;
  const storagePath = path.join(uploadDir, storageName);

  await fs.writeFile(storagePath, bytes);

  return {
    id: fileId,
    originalName,
    mimeType,
    size: bytes.length,
    storageName,
    downloadName: originalName,
  };
}

async function handleRequest(req, res) {
  const url = new URL(req.url ?? "/", "http://localhost");
  const pathname = url.pathname;

  try {
    if (req.method === "GET" && pathname === "/api/health") {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && pathname === "/api/roles") {
      sendJson(res, 200, { roles: allowedRoles });
      return;
    }

    if (req.method === "GET" && pathname === "/api/me") {
      const { identity, entry } = await authorize(req);
      sendJson(res, 200, {
        identity,
        role: entry.role,
        status: entry.status,
        isAdmin: entry.role === "admin",
      });
      return;
    }

    if (req.method === "GET" && pathname === "/api/admin/access-entries") {
      await authorize(req, { adminOnly: true });
      const entries = await loadAccessEntries();
      sendJson(res, 200, {
        entries: entries.sort((left, right) => left.email.localeCompare(right.email)),
      });
      return;
    }

    if (req.method === "POST" && pathname === "/api/admin/access-entries") {
      const { identity } = await authorize(req, { adminOnly: true });
      const payload = validateAccessEntry(await readJsonBody(req));
      const entries = await loadAccessEntries();
      const now = new Date().toISOString();
      const existing = entries.findIndex((item) => item.email === payload.email);
      const currentAdmins = countActiveAdmins(entries);
      const nextWouldBeAdmin = payload.role === "admin" && payload.status === "active";
      const existingWasAdmin = existing >= 0 && entries[existing].role === "admin" && entries[existing].status === "active";

      if (existingWasAdmin && !nextWouldBeAdmin && currentAdmins <= 1) {
        sendJson(res, 400, { error: "Cannot remove the last active admin" });
        return;
      }

      if (!existingWasAdmin && currentAdmins === 0 && !nextWouldBeAdmin) {
        sendJson(res, 400, { error: "At least one active admin is required" });
        return;
      }

      const nextEntry = {
        email: payload.email,
        name: payload.name,
        role: payload.role,
        status: payload.status,
        updatedAt: now,
        updatedBy: identity.email,
        createdAt: existing >= 0 ? entries[existing].createdAt : now,
      };

      if (existing >= 0) {
        entries[existing] = nextEntry;
      } else {
        entries.push(nextEntry);
      }

      await saveAccessEntries(entries);
      sendJson(res, 200, { entry: nextEntry });
      return;
    }

    if (req.method === "DELETE" && pathname.startsWith("/api/admin/access-entries/")) {
      const { identity } = await authorize(req, { adminOnly: true });
      const email = normalizeEmail(decodeURIComponent(pathname.split("/").pop() ?? ""));
      const entries = await loadAccessEntries();
      const target = entries.find((item) => item.email === email);

      if (target && target.role === "admin" && target.status === "active" && countActiveAdmins(entries) <= 1) {
        sendJson(res, 400, { error: "Cannot remove the last active admin" });
        return;
      }

      const nextEntries = entries.filter((item) => item.email !== email);
      await saveAccessEntries(nextEntries);
      sendJson(res, 200, { ok: true, removedBy: identity.email });
      return;
    }

    if (req.method === "GET" && pathname === "/api/reports") {
      const { identity } = await authorize(req);
      const reports = await loadReports();
      const filters = parseHistoryFilters(url.searchParams);
      const visibleReports = filterHistoryEntries(reports, {
        ...filters,
        kind: "report",
      });

      sendJson(res, 200, {
        reports: visibleReports
          .slice()
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
          .map((report) => pickPublicHistoryEntry(report, identity.email)),
      });
      return;
    }

    if (req.method === "GET" && pathname === "/api/meetings") {
      const { identity } = await authorize(req);
      const reports = await loadReports();
      const filters = parseHistoryFilters(url.searchParams);
      const visibleMeetings = filterHistoryEntries(reports, {
        ...filters,
        kind: "meeting",
      });

      sendJson(res, 200, {
        meetings: visibleMeetings
          .slice()
          .sort((left, right) => right.eventDate.localeCompare(left.eventDate) || right.createdAt.localeCompare(left.createdAt))
          .map((report) => pickPublicHistoryEntry(report, identity.email)),
      });
      return;
    }

    if (req.method === "POST" && pathname === "/api/reports") {
      const { identity, entry } = await authorize(req);
      const payload = validateReportPayload(await readJsonBody(req, 30 * 1024 * 1024));
      const reports = await loadReports();
      const now = new Date().toISOString();
      const reportId = randomUUID();
      const attachments = [];

      for (const attachment of payload.attachments) {
        attachments.push(await storeAttachment(reportId, attachment));
      }

      const report = {
        id: reportId,
        kind: "report",
        title: payload.title,
        description: payload.description,
        category: payload.category,
        eventDate: payload.eventDate,
        createdAt: now,
        submittedBy: {
          email: identity.email,
          name: identity.name ?? entry.name ?? "",
          role: entry.role,
        },
        attachments,
      };

      reports.push(report);
      await saveReports(reports);
      sendJson(res, 201, { report: pickPublicHistoryEntry(normalizeHistoryEntry(report), identity.email) });
      return;
    }

    if (req.method === "POST" && pathname === "/api/meetings") {
      const { identity, entry } = await authorize(req, { adminOnly: true });
      const payload = validateMeetingPayload(await readJsonBody(req, 30 * 1024 * 1024));
      const reports = await loadReports();
      const now = new Date().toISOString();
      const reportId = randomUUID();
      const attachments = [];

      for (const attachment of payload.attachments) {
        attachments.push(await storeAttachment(reportId, attachment));
      }

      const meeting = {
        id: reportId,
        kind: "meeting",
        title: payload.title,
        description: payload.description,
        category: payload.category,
        eventDate: payload.eventDate,
        createdAt: now,
        meetingFormat: payload.meetingFormat,
        googleDocUrl: payload.googleDocUrl,
        submittedBy: {
          email: identity.email,
          name: identity.name ?? entry.name ?? "",
          role: entry.role,
        },
        attachments,
      };

      reports.push(meeting);
      await saveReports(reports);
      sendJson(res, 201, { meeting: pickPublicHistoryEntry(normalizeHistoryEntry(meeting), identity.email) });
      return;
    }

    if (req.method === "GET" && pathname.startsWith("/api/files/")) {
      const { identity, entry } = await authorize(req);
      const fileId = pathname.split("/").pop();
      const reports = await loadReports();
      const report = reports.find((item) => item.attachments.some((attachment) => attachment.id === fileId));

      if (!report) {
        sendJson(res, 404, { error: "File not found" });
        return;
      }

      const file = report.attachments.find((attachment) => attachment.id === fileId);

      if (!file) {
        sendJson(res, 404, { error: "File not found" });
        return;
      }

      const storagePath = path.join(uploadDir, file.storageName);
      const fileBuffer = await fs.readFile(storagePath);
      res.writeHead(200, {
        "Content-Type": file.mimeType,
        "Content-Length": fileBuffer.length,
        "Content-Disposition": `attachment; filename="${file.downloadName.replaceAll('"', '\\"')}"`,
      });
      res.end(fileBuffer);
      return;
    }

    if (req.method === "GET" && pathname.startsWith("/api/reports/")) {
      const { identity } = await authorize(req);
      const reportId = pathname.split("/").pop();
      const reports = await loadReports();
      const report = reports.find((item) => item.id === reportId && (item.kind ?? "report") === "report");

      if (!report) {
        sendJson(res, 404, { error: "Report not found" });
        return;
      }

      sendJson(res, 200, { report: pickPublicHistoryEntry(report, identity.email) });
      return;
    }

    if (req.method === "GET" && pathname.startsWith("/api/meetings/")) {
      const { identity } = await authorize(req);
      const meetingId = pathname.split("/").pop();
      const reports = await loadReports();
      const meeting = reports.find((item) => item.id === meetingId && (item.kind ?? "report") === "meeting");

      if (!meeting) {
        sendJson(res, 404, { error: "Meeting not found" });
        return;
      }

      sendJson(res, 200, { meeting: pickPublicHistoryEntry(meeting, identity.email) });
      return;
    }

    const served = await serveStaticAsset(pathname, res);
    if (!served) {
      sendJson(res, 404, { error: "Not found" });
    }
  } catch (error) {
    const statusCode = typeof error.statusCode === "number" ? error.statusCode : 500;
    sendJson(res, statusCode, {
      error: error instanceof Error ? error.message : "Unexpected error",
    });
  }
}

await initializeData();

const port = Number(process.env.PORT ?? 8787);

http.createServer(handleRequest).listen(port, () => {
  console.log(`API server listening on http://127.0.0.1:${port}`);
});
