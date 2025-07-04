import { Command } from "commander";
import packageJson from "../package.json" with { type: "json" };
import { sendCommand } from "./cmd/agent/send";
import { initCommand } from "./cmd/init";
import { listCommand } from "./cmd/list";
import { startCommand } from "./cmd/start";
import { stopCommand } from "./cmd/stop";
import { CCTeamError } from "./lib/error";
import { log } from "./lib/log";
import { asRole } from "./lib/types";

const program = new Command();

program
  .name("ccteam")
  .description(
    "CLI tool to orchestrate multiple Claude Code instances in tmux sessions",
  )
  .version(packageJson.version);

program
  .command("start")
  .description(
    "Initialize tmux session with 3 Claude Code instances (Manager/Leader/Worker)",
  )
  .option("-c, --config <path>", "Path to configuration file")
  .option(
    "--manager-model <string>",
    "Claude model for Manager role (e.g. opus, sonnet, haiku)",
  )
  .option(
    "--leader-model <string>",
    "Claude model for Leader role (e.g. opus, sonnet, haiku)",
  )
  .option(
    "--worker-model <string>",
    "Claude model for Worker role (e.g. opus, sonnet, haiku)",
  )
  .option(
    "--manager-skip-permissions",
    "Skip permission prompts for Manager role's Claude Code instance",
  )
  .option(
    "--leader-skip-permissions",
    "Skip permission prompts for Leader role's Claude Code instance",
  )
  .option(
    "--worker-skip-permissions",
    "Skip permission prompts for Worker role's Claude Code instance",
  )
  .option(
    "--manager-allowed-tools <string>",
    "Comma-separated list of allowed tools for Manager (e.g. Bash(git:*),WebFetch)",
  )
  .option(
    "--leader-allowed-tools <string>",
    "Comma-separated list of allowed tools for Leader (e.g. Bash(git:*),WebFetch)",
  )
  .option(
    "--worker-allowed-tools <string>",
    "Comma-separated list of allowed tools for Worker (e.g. Bash(git:*),WebFetch)",
  )
  .option(
    "--manager-disallowed-tools <string>",
    "Comma-separated list of disallowed tools for Manager (e.g. Bash(git:*),WebFetch)",
  )
  .option(
    "--leader-disallowed-tools <string>",
    "Comma-separated list of disallowed tools for Leader (e.g. Bash(git:*),WebFetch)",
  )
  .option(
    "--worker-disallowed-tools <string>",
    "Comma-separated list of disallowed tools for Worker (e.g. Bash(git:*),WebFetch)",
  )
  .action(async (options) => {
    await startCommand(options);
  });

program
  .command("stop")
  .description("Stop Claude Code Team session for specified session ID")
  .argument("<session-id>", "The session ID to stop (e.g., ccteam-ABCDE)")
  .action(async (sessionId) => {
    await stopCommand(sessionId);
  });

program
  .command("list")
  .description("List active ccteam sessions")
  .action(async (options) => {
    await listCommand(options);
  });

program
  .command("init")
  .description("Create ccteam.yml with default configuration and comments")
  .option(
    "-c, --config <path>",
    "Configuration file path to create",
    "ccteam.yml",
  )
  .action(async (options) => {
    await initCommand(options.config);
  });

const agentCommand = program
  .command("agent")
  .description("Agent commands for Claude Code instances");

agentCommand
  .command("send")
  .description(
    "Send message to specific role (for agents) - manager/leader/worker",
  )
  .requiredOption(
    "--from <role>",
    "The role sending the message (manager/leader/worker)",
  )
  .requiredOption(
    "--to <role>",
    "The role to send message to (worker/leader/manager)",
  )
  .argument("<message>", "The message to send")
  .action(async (message, options) => {
    await sendCommand(asRole(options.from), asRole(options.to), message);
  });

// Parse with error handling
(async () => {
  try {
    await program.parseAsync(process.argv);
  } catch (err) {
    if (err instanceof CCTeamError) {
      log("error", err.message);
      if (err.details) {
        log("error", err.details);
      }
      process.exit(1);
    } else {
      // Re-throw other errors
      throw err;
    }
  }
})();
