import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const resourcesPath = path.join(root, "src", "config", "resources.json");
const resources = JSON.parse(fs.readFileSync(resourcesPath, "utf8"));

const expectedPdfFiles = [
  "content-manager-guide.pdf",
  "platform-lead-guide.pdf",
  "marketing-guide.pdf",
  "bug-tracker-guide.pdf",
];

const errors = [];
const warnings = [];

function isValidUrl(value) {
  if (value.startsWith("mailto:")) {
    return value.length > "mailto:".length;
  }

  if (value.startsWith("./docs/")) {
    return true;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

for (const resource of resources) {
  if (!resource.id || !resource.title || !resource.status) {
    errors.push(`Resource is missing required fields: ${JSON.stringify(resource)}`);
    continue;
  }

  if ((resource.status === "ready" || resource.status === "local") && !resource.url) {
    errors.push(`${resource.id}: active resource must have url`);
  }

  if ((resource.status === "missing" || resource.status === "individual") && resource.url) {
    errors.push(`${resource.id}: ${resource.status} resource must not have url`);
  }

  if (resource.url && !isValidUrl(resource.url)) {
    errors.push(`${resource.id}: invalid url syntax`);
  }

  if (resource.status === "local") {
    const localPath = resource.url?.replace(/^\.\//, "");
    const absolute = localPath ? path.join(root, "public", localPath) : "";

    if (!absolute || !fs.existsSync(absolute)) {
      errors.push(`${resource.id}: local PDF does not exist`);
    }
  }
}

for (const filename of expectedPdfFiles) {
  const exists = fs.existsSync(path.join(root, "public", "docs", filename));

  if (!exists) {
    warnings.push(`Missing expected PDF: ${filename}`);
  }
}

if (errors.length > 0) {
  console.error("Resource validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn("Resource validation warnings:");
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}

console.log("Resource validation passed.");
