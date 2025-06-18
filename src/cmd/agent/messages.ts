import fs from "node:fs";
import path from "node:path";
import { getMessagesPath } from "../../lib/util";

export async function deleteMessageCommand(message: string) {
  const messageDir = await getMessagesPath();
  if (!fs.existsSync(messageDir)) {
    fs.mkdirSync(messageDir, { recursive: true });
  }

  const messagePath = path.join(messageDir, message);
  if (fs.existsSync(messagePath)) {
    fs.rmSync(messagePath);
    console.log(`[INFO] "${message}" deleted successfully`);
  } else {
    console.log(`[INFO] "${message}" not found (already deleted)`);
  }
}
