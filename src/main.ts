import { Command } from "commander";
import packageJson from "../package.json" with { type: "json" };
import { init } from "./cmd/init";
import { deleteMessage } from "./cmd/messages";
import { send } from "./cmd/send";
import { start } from "./cmd/start";
import { loadSessionName } from "./lib/util";

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
  .option("-c, --config <path>", "Configuration file path")
  .option("--manager-model <string>", "Manager role model")
  .option("--manager-skip-permissions", "Manager role skip permissions")
  .option("--leader-model <string>", "Leader role model")
  .option("--leader-skip-permissions", "Leader role skip permissions")
  .option("--worker-model <string>", "Worker role model")
  .option("--worker-skip-permissions", "Worker role skip permissions")
  .action(async (options) => {
    await start(options);
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
    await init(options.config);
  });

program
  .command("send")
  .description(
    "Send message to specific role (for agents) - manager/leader/worker",
  )
  .argument("<role>", "The role to send message to (worker/leader/manager)")
  .argument("<message>", "The message to send")
  .action(async (role, message) => {
    const session = await loadSessionName();
    await send({ role, message, session });
  });

const messagesCmd = program
  .command("messages")
  .description("Manage message files (for agent communication)");

messagesCmd
  .command("delete")
  .description("Delete processed message files (for agents)")
  .argument("<message>", "The message file to delete")
  .action(async (message) => {
    await deleteMessage(message);
  });

program.parse(process.argv);
