import path from "node:path";
import boxen from "boxen";
import { sync as commandExists } from "command-exists";

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

export function quote(value: string): string {
  return JSON.stringify(value);
}

export function isInstalled(command: string): boolean {
  return commandExists(command);
}

export type ToastParams = {
  title: string;
  message: string;
  color: string;
};

export function toast({ title, message, color }: ToastParams) {
  console.log(
    boxen(message, {
      title,
      titleAlignment: "center",
      padding: 1,
      margin: 1,
      borderStyle: "round",
      borderColor: color,
      backgroundColor: "black",
    }),
  );
}

/** @deprecated */
async function getSessionBasePath(): Promise<string> {
  const sessionName = await loadSessionName();
  return path.join(process.cwd(), ".ccteam", sessionName);
}

/** @deprecated */
export async function getMessagesPath(): Promise<string> {
  const basePath = await getSessionBasePath();
  return path.join(basePath, "messages");
}
