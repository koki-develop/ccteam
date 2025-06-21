import { spawn } from "node:child_process";
import { sync as commandExists } from "command-exists";
import { CCTeamError } from "./error";
import { getCurrentRole, sleep } from "./util";

export function tmux(...args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn("tmux", args);
    let stdout = "";
    let stderr = "";

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`tmux ${args.join(" ")} failed: ${stderr}`));
      } else {
        resolve(stdout);
      }
    });

    child.stdout?.on("data", (data) => {
      stdout += data;
    });

    child.stderr?.on("data", (data) => {
      stderr += data;
    });
  });
}

export type SendParams = {
  session: string;
  role: string;
  message: string;
};

export async function send({ session, role, message }: SendParams) {
  const roleMap: Record<string, number> = {
    manager: 0,
    leader: 1,
    worker: 2,
  };
  if (!Object.keys(roleMap).includes(role)) {
    throw new CCTeamError(
      `Invalid role: ${role}`,
      "Valid roles are: manager, leader, worker",
    );
  }

  const toRole = roleMap[role];
  const fromRole = await getCurrentRole();

  const target = `${session}:0.${toRole}`;
  await tmux(
    "send-keys",
    "-t",
    target,
    `[${fromRole.toUpperCase()}] ${message}`,
  );
  await sleep(1000);
  await tmux("send-keys", "-t", target, "C-m");
}

export function isInstalled(command: string): boolean {
  return commandExists(command);
}
