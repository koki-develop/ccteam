import path from "node:path";
import { tmux } from "./tmux";

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateSessionName(): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const suffix: string[] = [];
  for (let i = 0; i < 5; i++) {
    suffix.push(chars.charAt(Math.floor(Math.random() * chars.length)));
  }
  return `ccteam-${suffix.join("")}`;
}

export async function loadSessionName(): Promise<string> {
  const stdout = await tmux("display-message", "-p", "#S");
  return stdout.trim();
}

async function getSessionBasePath(): Promise<string> {
  const sessionName = await loadSessionName();
  return path.join(process.cwd(), ".ccteam", sessionName);
}

export async function getMessagesPath(): Promise<string> {
  const basePath = await getSessionBasePath();
  return path.join(basePath, "messages");
}
