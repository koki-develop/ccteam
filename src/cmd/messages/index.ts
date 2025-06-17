import fs from "node:fs";
import path from "node:path";

export async function deleteMessage(message: string) {
  const messageDir = path.join(process.cwd(), ".ccteam", "messages");
  if (!fs.existsSync(messageDir)) {
    fs.mkdirSync(messageDir, { recursive: true });
  }

  const messagePath = path.join(messageDir, message);
  if (fs.existsSync(messagePath)) {
    fs.rmSync(messagePath);
  }
}
