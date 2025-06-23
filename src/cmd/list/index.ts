import chalk from "chalk";
import { format } from "date-fns";
import ora from "ora";
import { log } from "../../lib/log";
import { SessionManager } from "../../lib/session";

type ListOptions = Record<string, never>;

export async function listCommand(_options: ListOptions): Promise<void> {
  log("info", "Loading ccteam sessions...");

  const spinner = ora("Checking active sessions...").start();

  const sessionManager = new SessionManager();
  const activeSessions = await sessionManager.listSessions();

  spinner.succeed("Session check completed");

  if (activeSessions.length === 0) {
    console.log(chalk.gray("No active ccteam sessions found."));
    return;
  }

  // Display header
  console.log();
  console.log(
    chalk.bold("SESSION           STARTED AT           WORKING DIRECTORY"),
  );
  // Display separator line adapted to terminal width
  const terminalWidth = process.stdout.columns || 80;
  console.log(chalk.gray("─".repeat(terminalWidth)));

  // Display session information
  for (const sessionInfo of activeSessions) {
    const startedAt = format(
      new Date(sessionInfo.startedAt),
      "yyyy-MM-dd HH:mm",
    );

    const nameCol = chalk.cyan(sessionInfo.sessionName.padEnd(17));
    const timeCol = startedAt.padEnd(20);
    const dirCol = sessionInfo.workingDirectory;

    console.log(`${nameCol} ${timeCol} ${dirCol}`);
  }

  console.log();
  console.log(chalk.gray(`Found ${activeSessions.length} active session(s)`));
}
