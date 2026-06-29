import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { normalizeEmail, readJsonFile } from "./storage.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const resourcesPath = path.join(rootDir, "src", "config", "resources.json");

let cachedResources;
let cachedRemoteKeySet;

async function loadResources() {
  if (!cachedResources) {
    cachedResources = await readJsonFile(resourcesPath, []);
  }

  return cachedResources;
}

async function getAdminSeedEmails() {
  const resources = await loadResources();
  const entries = resources.filter((resource) => resource.id === "email-greidin");

  return entries
    .map((resource) => {
      if (typeof resource.url !== "string") {
        return null;
      }

      if (!resource.url.startsWith("mailto:")) {
        return null;
      }

      return normalizeEmail(resource.url.slice("mailto:".length));
    })
    .filter(Boolean);
}

function getAccessConfig() {
  const teamDomain = process.env.CF_ACCESS_TEAM_DOMAIN?.trim();
  const audience = process.env.CF_ACCESS_AUDIENCE?.trim();

  return {
    teamDomain,
    audience,
    devEmail: process.env.DEV_ACCESS_EMAIL?.trim(),
  };
}

function getRemoteKeySet(teamDomain) {
  if (!cachedRemoteKeySet) {
    cachedRemoteKeySet = createRemoteJWKSet(new URL(`${teamDomain}/cdn-cgi/access/certs`));
  }

  return cachedRemoteKeySet;
}

function getCookieValue(cookieHeader, name) {
  const parts = cookieHeader.split(";").map((part) => part.trim());
  const match = parts.find((part) => part.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : "";
}

export async function getAuthenticatedIdentity(request) {
  const config = getAccessConfig();

  if (!config.teamDomain || !config.audience) {
    if (config.devEmail) {
      return {
        email: normalizeEmail(config.devEmail),
        name: "Local admin",
      };
    }

    return null;
  }

  const assertion =
    request.headers.get("cf-access-jwt-assertion") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    getCookieValue(request.headers.get("cookie") ?? "", "CF_Authorization");

  if (!assertion) {
    return null;
  }

  const { payload } = await jwtVerify(assertion, getRemoteKeySet(config.teamDomain), {
    issuer: config.teamDomain,
    audience: config.audience,
  });

  const email = typeof payload.email === "string" ? normalizeEmail(payload.email) : null;

  if (!email) {
    return null;
  }

  return {
    email,
    name: typeof payload.name === "string" ? payload.name : undefined,
  };
}

export async function getSeededAdminEmails() {
  const seedEmails = await getAdminSeedEmails();
  const config = getAccessConfig();

  if (config.devEmail) {
    seedEmails.push(normalizeEmail(config.devEmail));
  }

  return [...new Set(seedEmails)];
}
