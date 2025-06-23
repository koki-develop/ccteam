import { spawn } from "node:child_process";

export class Tmux {
  sendKeys(target: string, message: string) {
    return this.command("send-keys", "-t", target, message);
  }

  async getSession(): Promise<string> {
    const stdout = await this.command("display-message", "-p", "#S");
    return stdout.trim();
  }

  async listSessions(): Promise<string[]> {
    const stdout = await this.command("list-sessions", "-F", "#{session_name}");
    return stdout.split("\n").filter((line) => line.trim() !== "");
  }

  async killSession(session: string) {
    return this.command("kill-session", "-t", session);
  }

  command(...args: string[]): Promise<string> {
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
}
