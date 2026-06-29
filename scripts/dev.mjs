import { spawn } from "node:child_process";

const processes = [];

function startProcess(command, args, name) {
  const child = spawn(command, args, {
    stdio: "inherit",
    env: process.env,
  });

  child.on("exit", (code, signal) => {
    if (signal || code !== 0) {
      shutdown(child);
      if (signal) {
        process.exit(0);
      }

      process.exit(code ?? 1);
    }
  });

  processes.push(child);
  console.log(`[dev] started ${name}`);
  return child;
}

function shutdown(exitedChild) {
  for (const child of processes) {
    if (child !== exitedChild && !child.killed) {
      child.kill("SIGTERM");
    }
  }
}

process.on("SIGINT", () => {
  shutdown();
  process.exit(130);
});

process.on("SIGTERM", () => {
  shutdown();
  process.exit(143);
});

startProcess("node", ["server/index.mjs"], "api");
startProcess("vite", [], "vite");
