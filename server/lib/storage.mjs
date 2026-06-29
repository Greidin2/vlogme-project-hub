import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

export const dataDir = path.join(rootDir, "data");
export const uploadDir = path.join(dataDir, "uploads");
export const accessFile = path.join(dataDir, "access.json");
export const reportsFile = path.join(dataDir, "reports.json");

export async function ensureStorage() {
  await fs.mkdir(uploadDir, { recursive: true });
}

export async function readJsonFile(filePath, fallback) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return fallback;
    }

    throw error;
  }
}

export async function writeJsonFile(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

export function safeSlug(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";
}

export function bytesToBase64(bytes) {
  return Buffer.from(bytes).toString("base64");
}

export function base64ToBytes(base64) {
  return Buffer.from(base64, "base64");
}
