import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";

const repoUrl = process.env.DEPLOY_REPO ?? "git@github.com:Greidin2/vlogme-project-hub.git";
const branch = process.env.DEPLOY_BRANCH ?? "main";
const workDir = process.env.DEPLOY_WORKDIR ?? "/home/ubuntu/.cache/vlogme-project-hub-deploy";
const targetDir = process.env.DEPLOY_TARGET_DIR ?? "/var/www/vlogme-project-hub/dist";
const sshKey = process.env.DEPLOY_SSH_KEY ?? "/home/ubuntu/.ssh/id_ed25519_deploy";

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? process.cwd(),
      env: options.env ?? process.env,
      stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    });

    let stdout = "";
    let stderr = "";

    if (options.capture && child.stdout && child.stderr) {
      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString("utf8");
      });
      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString("utf8");
      });
    }

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      const error = new Error(`${command} ${args.join(" ")} failed with exit code ${code}`);
      error.stdout = stdout;
      error.stderr = stderr;
      reject(error);
    });
  });
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function fileHash(filePath) {
  const content = await fs.readFile(filePath);
  return createHash("sha256").update(content).digest("hex");
}

async function ensureCheckout() {
  const gitDir = path.join(workDir, ".git");
  const sshCommand = `ssh -i ${sshKey} -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new`;
  const env = {
    ...process.env,
    CI: "true",
    GIT_SSH_COMMAND: sshCommand,
  };

  await fs.mkdir(path.dirname(workDir), { recursive: true });

  if (!(await exists(gitDir))) {
    console.log(`[deploy] cloning ${repoUrl} -> ${workDir}`);
    await run("git", ["clone", "--branch", branch, "--single-branch", repoUrl, workDir], { env });
    return;
  }

  console.log("[deploy] fetching latest changes");
  await run("git", ["-C", workDir, "fetch", "origin", branch], { env });
  await run("git", ["-C", workDir, "reset", "--hard", `origin/${branch}`], { env });
}

async function ensureDependencies() {
  const lockfile = path.join(workDir, "package-lock.json");
  const stampFile = path.join(workDir, ".deploy-lock-hash");
  const currentHash = await fileHash(lockfile);
  const previousHash = (await exists(stampFile)) ? (await fs.readFile(stampFile, "utf8")).trim() : "";

  if (currentHash === previousHash && (await exists(path.join(workDir, "node_modules")))) {
    console.log("[deploy] dependencies are up to date");
    return;
  }

  console.log("[deploy] installing dependencies");
  await run("npm", ["ci"], {
    cwd: workDir,
    env: {
      ...process.env,
      CI: "true",
    },
  });

  await fs.writeFile(stampFile, `${currentHash}\n`, "utf8");
}

async function syncDist() {
  const sourceDir = path.join(workDir, "dist");

  if (!(await exists(sourceDir))) {
    throw new Error(`Build output was not found: ${sourceDir}`);
  }

  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.mkdir(path.dirname(targetDir), { recursive: true });
  await fs.cp(sourceDir, targetDir, { recursive: true, force: true });
}

async function main() {
  console.log("[deploy] starting production sync");
  await ensureCheckout();
  await ensureDependencies();
  console.log("[deploy] building application");
  await run("npm", ["run", "build"], {
    cwd: workDir,
    env: {
      ...process.env,
      CI: "true",
    },
  });
  console.log(`[deploy] syncing dist to ${targetDir}`);
  await syncDist();

  const commit = await run("git", ["-C", workDir, "rev-parse", "--short", "HEAD"], { capture: true });
  console.log(`[deploy] complete at ${commit.stdout.trim()}`);
}

main().catch((error) => {
  console.error("[deploy] failed");
  console.error(error instanceof Error ? error.message : error);
  if (error?.stderr) {
    console.error(error.stderr);
  }
  process.exit(1);
});
