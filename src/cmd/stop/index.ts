import fs from "node:fs";
import path from "node:path";
import boxen from "boxen";
import chalk from "chalk";
import ora from "ora";
import { CCTeamError } from "../../lib/error";
import { isInstalled, tmux } from "../../lib/tmux";
import { sleep } from "../../lib/util";

type StopOptions = Record<string, never>;

export async function stopCommand(
  sessionId: string,
  _options: StopOptions,
): Promise<void> {
  console.log(
    `${chalk.blue("[INFO]")} Stopping ccteam session: ${chalk.cyan(sessionId)}`,
  );

  // Check tmux installation
  if (!isInstalled("tmux")) {
    throw new CCTeamError(
      "tmux is not installed",
      "Please install tmux first. See: https://github.com/tmux/tmux/wiki/Installing",
    );
  }

  // Validate session ID format
  if (!sessionId || !sessionId.startsWith("ccteam-")) {
    throw new CCTeamError(
      "Invalid session ID format. Expected format: ccteam-XXXXX",
    );
  }

  // Check session existence
  const result = await tmux("list-sessions", "-F", "#{session_name}");
  if (!result.split("\n").includes(sessionId)) {
    throw new CCTeamError(`Session not found: ${sessionId}`);
  }

  // Send Ctrl+C to each pane
  const stopSpinner = ora("Stopping Claude Code instances...").start();
  for (let i = 0; i < 3; i++) {
    const target = `${sessionId}:0.${i}`;
    // Send Ctrl+C twice
    await tmux("send-keys", "-t", target, "C-c");
    await sleep(300);
    await tmux("send-keys", "-t", target, "C-c");
    await sleep(300);
  }
  stopSpinner.succeed("Claude Code instances stopped");

  // Terminate tmux session
  const killSpinner = ora("Terminating tmux session...").start();
  await tmux("kill-session", "-t", sessionId);
  killSpinner.succeed("Tmux session terminated");

  // Clean up session directory (.ccteam/{session}/)
  const sessionDir = path.join(process.cwd(), ".ccteam", sessionId);
  if (fs.existsSync(sessionDir)) {
    fs.rmSync(sessionDir, { recursive: true, force: true });
  }

  // Completion message
  const message = [
    chalk.white(
      `Session ${chalk.cyan(sessionId)} has been successfully stopped.`,
    ),
  ].join("\n");

  console.log(
    boxen(message, {
      title: "🛑 Claude Code Team Session Stopped",
      titleAlignment: "center",
      padding: 1,
      margin: 1,
      borderStyle: "round",
      borderColor: "red",
      backgroundColor: "black",
    }),
  );
}
