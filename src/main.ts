import { Command } from "commander";
import { deleteMessage } from "./cmd/messages";
import { send } from "./cmd/send";
import { start } from "./cmd/start";

const program = new Command();

program.command("start").action(async () => {
  await start();
});

program
  .command("send")
  .argument("<role>", "The role to send the message to")
  .argument("<message>", "The message to send")
  .action(async (role, message) => {
    await send({ role, message, session: "ccteam" });
  });

program
  .command("messages")
  .command("delete")
  .argument("<message>", "The message to delete")
  .action(async (message) => {
    await deleteMessage(message);
  });

program.parse(process.argv);
