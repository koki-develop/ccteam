import fs from "node:fs";
import path from "node:path";
import managerInstruction from "../../instructions/manager.md" with {
  type: "text",
};
import reviewerInstruction from "../../instructions/reviewer.md" with {
  type: "text",
};
import workerInstruction from "../../instructions/worker.md" with {
  type: "text",
};
import { tmux } from "../../lib/tmux";
import { sleep } from "../../lib/util";
import { send } from "../send";

export async function start() {
  console.log("[INFO] Starting ccteam initialization...");

  const session = "ccteam";
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
  await setupReviewer(session);
  await setupEditor(session);
  console.log("[INFO] All roles initialized");

  showAttachInstructions();
}

async function setupInstructions() {
  const instructionsDir = path.join(process.cwd(), ".ccteam", "instructions");
  if (!fs.existsSync(instructionsDir)) {
    fs.mkdirSync(instructionsDir, { recursive: true });
  }

  const managerInstructionPath = path.join(instructionsDir, "manager.md");
  const reviewerInstructionPath = path.join(instructionsDir, "reviewer.md");
  const workerInstructionPath = path.join(instructionsDir, "worker.md");

  fs.writeFileSync(managerInstructionPath, managerInstruction);
  fs.writeFileSync(reviewerInstructionPath, reviewerInstruction);
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

async function setupReviewer(session: string) {
  await send({ session, role: "reviewer", message: "claude" });
  await sleep(3000);

  const prompt = `
You are the Reviewer role.
Please read @.ccteam/instructions/reviewer.md and understand your role.
`.trim();
  await send({ session, role: "reviewer", message: prompt });
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

function showAttachInstructions() {
  console.log("=".repeat(60));
  console.log("  🎉 ccteam initialization completed!");
  console.log("  To attach to the session, run the following command:");
  console.log("    $ tmux attach-session -t ccteam");
  console.log("=".repeat(60));
}
