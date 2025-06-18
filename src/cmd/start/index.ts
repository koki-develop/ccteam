import fs from "node:fs";
import path from "node:path";
import leaderInstruction from "../../instructions/leader.md" with {
  type: "text",
};
import managerInstruction from "../../instructions/manager.md" with {
  type: "text",
};
import workerInstruction from "../../instructions/worker.md" with {
  type: "text",
};
import { tmux } from "../../lib/tmux";
import { generateSessionName, sleep } from "../../lib/util";
import { send } from "../send";

export async function start() {
  console.log("[INFO] Starting ccteam initialization...");

  const session = generateSessionName();
  await tmux(
    // Create a new session
    "new-session",
    "-s",
    session,
    "-c",
    process.cwd(),
    "-d",
    ";",
    // Split the window horizontally
    "split-window",
    "-t",
    `${session}:0.0`,
    "-h",
    "-p",
    "50",
    ";",
    // Move to the right pane
    "select-pane",
    "-t",
    `${session}:0.1`,
    ";",
    // Split the right pane vertically
    "split-window",
    "-t",
    `${session}:0.1`,
    "-v",
    "-p",
    "50",
    ";",
    // Move to the left pane
    "select-pane",
    "-t",
    `${session}:0.0`,
  );
  console.log(`[INFO] Created tmux session: ${session}`);

  console.log("[INFO] Setting up roles...");
  await setupInstructions();
  await setupManager(session);
  await setupLeader(session);
  await setupEditor(session);
  console.log("[INFO] All roles initialized");

  showAttachInstructions(session);
}

async function setupInstructions() {
  const instructionsDir = path.join(process.cwd(), ".ccteam", "instructions");
  if (!fs.existsSync(instructionsDir)) {
    fs.mkdirSync(instructionsDir, { recursive: true });
  }

  const managerInstructionPath = path.join(instructionsDir, "manager.md");
  const leaderInstructionPath = path.join(instructionsDir, "leader.md");
  const workerInstructionPath = path.join(instructionsDir, "worker.md");

  fs.writeFileSync(managerInstructionPath, managerInstruction);
  fs.writeFileSync(leaderInstructionPath, leaderInstruction);
  fs.writeFileSync(workerInstructionPath, workerInstruction);
}

async function setupManager(session: string) {
  await send({ session, role: "manager", message: "claude" });
  await sleep(3000);

  const prompt = `
You are the Manager role.
Please read @.ccteam/instructions/manager.md and understand your role.
`.trim();
  await send({ session, role: "manager", message: prompt });
}

async function setupLeader(session: string) {
  await send({ session, role: "leader", message: "claude" });
  await sleep(3000);

  const prompt = `
You are the Leader role.
Please read @.ccteam/instructions/leader.md and understand your role.
`.trim();
  await send({ session, role: "leader", message: prompt });
}

async function setupEditor(session: string) {
  await send({ session, role: "worker", message: "claude" });
  await sleep(3000);

  const prompt = `
You are the Worker role.
Please read @.ccteam/instructions/worker.md and understand your role.
`.trim();
  await send({ session, role: "worker", message: prompt });
}

function showAttachInstructions(session: string) {
  console.log("=".repeat(60));
  console.log("  🎉 ccteam initialization completed!");
  console.log("  To attach to the session, run the following command:");
  console.log(`    $ tmux attach-session -t ${session}`);
  console.log("=".repeat(60));
}
