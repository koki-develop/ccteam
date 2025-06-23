import fs from "node:fs";
import path from "node:path";
import leaderInstruction from "../instructions/leader.md" with { type: "text" };
import managerInstruction from "../instructions/manager.md" with {
  type: "text",
};
import workerInstruction from "../instructions/worker.md" with { type: "text" };
import { buildClaudeCommand } from "./claude";
import type { RoleConfig } from "./config";
import { CCTeamError } from "./error";
import { Tmux } from "./tmux";
import type { Role } from "./types";
import { isInstalled, sleep } from "./util";

export type SendParams = {
  from?: Role;
  to: Role;
  message: string;
};

export class CCTeam {
  private readonly _session: string;
  private readonly _tmux: Tmux;

  constructor(session: string) {
    this._session = session;
    this._tmux = new Tmux();
  }

  async checkRequirements() {
    if (!isInstalled("tmux")) {
      throw new CCTeamError(
        "tmux is not installed",
        "Please install tmux first. See: https://github.com/tmux/tmux/wiki/Installing",
      );
    }
    if (!isInstalled("claude")) {
      throw new CCTeamError(
        "claude is not installed",
        "Please install Claude CLI first. See: https://docs.anthropic.com/en/docs/claude-code/overview",
      );
    }
  }

  async prepareSession() {
    await this._tmux.command(
      // Create a new session
      "new-session",
      "-s",
      this._session,
      "-c",
      process.cwd(),
      "-d",
      ";",
      // Split the window horizontally
      "split-window",
      "-t",
      `${this._session}:0.0`,
      "-h",
      "-p",
      "50",
      ";",
      // Move to the right pane
      "select-pane",
      "-t",
      `${this._session}:0.1`,
      ";",
      // Split the right pane vertically
      "split-window",
      "-t",
      `${this._session}:0.1`,
      "-v",
      "-p",
      "50",
      ";",
      // Move to the left pane
      "select-pane",
      "-t",
      this._pane("manager"),
    );
  }

  prepareInstructions() {
    const instructionsDir = this._instructionsDir();
    if (!fs.existsSync(instructionsDir)) {
      fs.mkdirSync(instructionsDir, { recursive: true });
    }
    fs.writeFileSync(this._instructionPath("manager"), managerInstruction);
    fs.writeFileSync(this._instructionPath("leader"), leaderInstruction);
    fs.writeFileSync(this._instructionPath("worker"), workerInstruction);
  }

  async setupManager(config: RoleConfig) {
    await this._startClaude("manager", config);
    const prompt = `
  You are the Manager role.
  Read @.ccteam/${this._session}/instructions/manager.md and understand your role.

  Session name: ${this._session}
  Wait for requests from the User.
  `.trim();
    await this.sendMessage({ to: "manager", message: prompt });
  }

  async setupLeader(config: RoleConfig) {
    await this._startClaude("leader", config);
    const prompt = `
You are the Leader role.
Read @.ccteam/${this._session}/instructions/leader.md and understand your role.

Session name: ${this._session}
Wait for requests from the Manager.
`.trim();
    await this.sendMessage({ to: "leader", message: prompt });
  }

  async setupWorker(config: RoleConfig) {
    await this._startClaude("worker", config);
    const prompt = `
You are the Worker role.
Read @.ccteam/${this._session}/instructions/worker.md and understand your role.

Session name: ${this._session}
Wait for requests from the Leader.
    `.trim();
    await this.sendMessage({ to: "worker", message: prompt });
  }

  async sendMessage({ from, to, message }: SendParams) {
    const prefix = from ? `[${from.toUpperCase()}] ` : "";
    const pane = this._pane(to);

    await this._tmux.sendKeys(pane, `${prefix}${message}`);
    await sleep(1000);
    await this._tmux.sendKeys(pane, "C-m");
  }

  private async _startClaude(role: Role, config: RoleConfig) {
    const command = buildClaudeCommand({
      model: config.model,
      skipPermissions: config.skipPermissions,
      allowedTools: config.allowedTools,
      disallowedTools: config.disallowedTools,
    });
    await this._tmux.sendKeys(this._pane(role), command.join(" "));
    await sleep(1000);
    await this._tmux.sendKeys(this._pane(role), "C-m"); // Enter
    await sleep(1000);
    await this._tmux.sendKeys(this._pane(role), "C-m"); // Enter
    await sleep(3000);
  }

  private _pane(role: Role): string {
    const roleMap: Record<Role, number> = {
      manager: 0,
      leader: 1,
      worker: 2,
    };
    return `${this._session}:0.${roleMap[role]}`;
  }

  private _instructionsDir() {
    return path.join(process.cwd(), ".ccteam", this._session, "instructions");
  }

  private _instructionPath(role: Role) {
    return path.join(this._instructionsDir(), `${role}.md`);
  }
}
