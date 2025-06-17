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

  await setupInstructions();

  await setupManager(session);
  await setupReviewer(session);
  await setupEditor(session);
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
あなたはマネージャーロールです。
@.ccteam/instructions/manager.md を読んで、自身の役割を理解してください。
`.trim();
  await send({ session, role: "manager", message: prompt });
}

async function setupReviewer(session: string) {
  await send({ session, role: "reviewer", message: "claude" });
  await sleep(3000);

  const prompt = `
あなたはレビュアーロールです。
@.ccteam/instructions/reviewer.md を読んで、自身の役割を理解してください。
`.trim();
  await send({ session, role: "reviewer", message: prompt });
}

async function setupEditor(session: string) {
  await send({ session, role: "worker", message: "claude" });
  await sleep(3000);

  const prompt = `
あなたはワーカーロールです。
@.ccteam/instructions/worker.md を読んで、自身の役割を理解してください。
`.trim();
  await send({ session, role: "worker", message: prompt });
}
