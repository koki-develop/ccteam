import path from "node:path";
import { tmux } from "./tmux";
import type { Role } from "./types";

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

export async function getCurrentRole(): Promise<Role> {
  const stdout = await tmux("display-message", "-p", "#P");
  const paneMap: Record<string, Role> = {
    "0": "manager",
    "1": "leader",
    "2": "worker",
  };
  const role = paneMap[stdout.trim()];
  if (!role) {
    throw new Error("Failed to get current role");
  }
  return role;
}

async function getSessionBasePath(): Promise<string> {
  const sessionName = await loadSessionName();
  return path.join(process.cwd(), ".ccteam", sessionName);
}

export async function getMessagesPath(): Promise<string> {
  const basePath = await getSessionBasePath();
  return path.join(basePath, "messages");
}

/**
 * Safely quotes a command line argument using JSON.stringify for robust escaping.
 * This handles all special characters, quotes, backslashes, and Unicode characters
 * in a way that's safe for shell command execution.
 *
 * @param value - The string value to quote for command line usage
 * @returns The safely quoted string ready for shell execution
 */
export function quote(value: string): string {
  return JSON.stringify(value);
}
