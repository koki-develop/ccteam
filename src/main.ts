import { Command } from "commander";
import packageJson from "../package.json" with { type: "json" };
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
  .action(async (options) => {
    await start(options.config);
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
