import fs from "node:fs";
import chalk from "chalk";
import ora from "ora";
import { CCTeam } from "../../lib/ccteam";
import { CCTeamError } from "../../lib/error";
import { log } from "../../lib/log";
import { SessionManager } from "../../lib/session";
import { Tmux } from "../../lib/tmux";
import { sleep, toast } from "../../lib/util";

export async function stopCommand(session: string): Promise<void> {
  log("info", `Stopping ccteam session: ${chalk.cyan(session)}`);

  const tmux = new Tmux();
  const ccteam = new CCTeam(session);
  await ccteam.checkRequirements();

  // Validate session ID format
  if (!session || !session.startsWith("ccteam-")) {
    throw new CCTeamError(
      "Invalid session ID format. Expected format: ccteam-XXXXX",
    );
  }

  // Check session existence
  const sessions = await tmux.listSessions();
  if (!sessions.includes(session)) {
    throw new CCTeamError(`Session not found: ${session}`);
  }

  // Send Ctrl+C to each pane
  const stopSpinner = ora("Stopping Claude Code instances...").start();
  await tmux.sendKeys(ccteam.pane("manager"), "C-c");
  await sleep(300);
  await tmux.sendKeys(ccteam.pane("manager"), "C-c");
  await sleep(300);
  await tmux.sendKeys(ccteam.pane("leader"), "C-c");
  await sleep(300);
  await tmux.sendKeys(ccteam.pane("leader"), "C-c");
  await sleep(300);
  await tmux.sendKeys(ccteam.pane("worker"), "C-c");
  await sleep(300);
  await tmux.sendKeys(ccteam.pane("worker"), "C-c");
  stopSpinner.succeed("Claude Code instances stopped");

  // Terminate tmux session
  const killSpinner = ora("Terminating tmux session...").start();
  await tmux.killSession(session);
  killSpinner.succeed("Tmux session terminated");

  // Clean up session directory (.ccteam/{session}/)
  const sessionDir = ccteam.sessionDir();
  if (fs.existsSync(sessionDir)) {
    fs.rmSync(sessionDir, { recursive: true, force: true });
  }

  // Remove session info
  const sessionManager = new SessionManager();
  await sessionManager.deleteSession(session).catch(() => {});

  // Completion message
  toast({
    title: "🛑 Claude Code Team Session Stopped",
    message: `Session ${chalk.cyan(session)} has been successfully stopped.`,
    color: "red",
  });
}
