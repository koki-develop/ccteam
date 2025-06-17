import fs from "node:fs";
import path from "node:path";

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

export function saveSessionName(sessionName: string): void {
  const ccteamDir = path.join(process.cwd(), ".ccteam");
  const sessionFile = path.join(ccteamDir, "session");

  if (!fs.existsSync(ccteamDir)) {
    fs.mkdirSync(ccteamDir, { recursive: true });
  }

  fs.writeFileSync(sessionFile, sessionName);
}

export function loadSessionName(): string {
  const sessionFile = path.join(process.cwd(), ".ccteam", "session");

  if (!fs.existsSync(sessionFile)) {
    throw new Error("Session file not found.");
  }

  return fs.readFileSync(sessionFile, "utf-8").trim();
}
