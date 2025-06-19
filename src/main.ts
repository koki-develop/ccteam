import { Command } from "commander";
import packageJson from "../package.json" with { type: "json" };
import { deleteMessageCommand } from "./cmd/agent/messages";
import { sendCommand } from "./cmd/agent/send";
import { initCommand } from "./cmd/init";
import { startCommand } from "./cmd/start";

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
  .argument("<role>", "The role to send message to (worker/leader/manager)")
  .argument("<message>", "The message to send")
  .action(async (role, message) => {
    await sendCommand(role, message);
  });

const messagesCmd = agentCommand
  .command("messages")
  .description("Manage message files (for agent communication)");

messagesCmd
  .command("delete")
  .description("Delete processed message files (for agents)")
  .argument("<message>", "The message file to delete")
  .action(async (message) => {
    await deleteMessageCommand(message);
  });

program.parse(process.argv);
