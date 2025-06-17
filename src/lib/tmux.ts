import { spawn } from "child_process";

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
