import fs from "node:fs";
import chalk from "chalk";
import ora from "ora";
import { CCTeam } from "../../lib/ccteam";
import { CCTeamError } from "../../lib/error";
import { log } from "../../lib/log";
import { Tmux } from "../../lib/tmux";
import { sleep, toast } from "../../lib/util";

type StopOptions = Record<string, never>;

export async function stopCommand(
  sessionId: string,
  _options: StopOptions,
): Promise<void> {
  log("info", `Stopping ccteam session: ${chalk.cyan(sessionId)}`);

  const tmux = new Tmux();
  const session = await tmux.getSession();
  const ccteam = new CCTeam(session);
  ccteam.checkRequirements();

  // Validate session ID format
  if (!sessionId || !sessionId.startsWith("ccteam-")) {
    throw new CCTeamError(
      "Invalid session ID format. Expected format: ccteam-XXXXX",
    );
  }

  // Check session existence
  const sessions = await tmux.listSessions();
  if (!sessions.includes(sessionId)) {
    throw new CCTeamError(`Session not found: ${sessionId}`);
  }

  // Send Ctrl+C to each pane
  const stopSpinner = ora("Stopping Claude Code instances...").start();
  await tmux.sendKeys(ccteam.pane("manager"), "C-c");
  sleep(300);
  await tmux.sendKeys(ccteam.pane("manager"), "C-c");
  sleep(300);
  await tmux.sendKeys(ccteam.pane("leader"), "C-c");
  sleep(300);
  await tmux.sendKeys(ccteam.pane("leader"), "C-c");
  sleep(300);
  await tmux.sendKeys(ccteam.pane("worker"), "C-c");
  sleep(300);
  await tmux.sendKeys(ccteam.pane("worker"), "C-c");
  stopSpinner.succeed("Claude Code instances stopped");

  // Terminate tmux session
  const killSpinner = ora("Terminating tmux session...").start();
  await tmux.killSession(sessionId);
  killSpinner.succeed("Tmux session terminated");

  // Clean up session directory (.ccteam/{session}/)
  const sessionDir = ccteam.sessionDir();
  if (fs.existsSync(sessionDir)) {
    fs.rmSync(sessionDir, { recursive: true, force: true });
  }

  // Completion message
  toast({
    title: "🛑 Claude Code Team Session Stopped",
    message: `Session ${chalk.cyan(sessionId)} has been successfully stopped.`,
    color: "red",
  });
}
