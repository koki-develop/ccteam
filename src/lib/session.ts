import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import { Tmux } from "./tmux";

// Session information schema definition
export const SessionInfoSchema = z.object({
  sessionName: z.string(),
  startedAt: z.string(), // ISO 8601 format
  workingDirectory: z.string(),
});

export type SessionInfo = z.infer<typeof SessionInfoSchema>;

export class SessionManager {
  private readonly _tmux: Tmux;
  private readonly _sessionsDir: string;

  constructor() {
    this._tmux = new Tmux();
    this._sessionsDir = path.join(os.homedir(), ".ccteam", "sessions");
  }

  // Save session (for start command)
  async saveSession(
    sessionName: string,
    workingDirectory: string,
  ): Promise<void> {
    this._prepareSessionsDir();

    const sessionInfo: SessionInfo = {
      sessionName,
      startedAt: new Date().toISOString(),
      workingDirectory,
    };

    const filePath = this._getSessionPath(sessionName);
    const jsonData = JSON.stringify(sessionInfo, null, 2);

    fs.writeFileSync(filePath, jsonData, "utf8");
  }

  // Delete session (for stop command)
  async deleteSession(sessionName: string): Promise<void> {
    const filePath = this._getSessionPath(sessionName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  // Get active session list (for list command)
  async listSessions(): Promise<SessionInfo[]> {
    const tmuxSessions = await this._tmux.listSessions();
    const ccteamSessions = tmuxSessions.filter((session) =>
      session.startsWith("ccteam-"),
    );

    await this._cleanupStaleSessions(ccteamSessions);

    const activeSessions: SessionInfo[] = [];
    for (const sessionName of ccteamSessions) {
      const sessionInfo = await this._loadSessionInfo(sessionName);
      if (sessionInfo) {
        activeSessions.push(sessionInfo);
      }
    }

    return activeSessions;
  }

  // Private methods
  private _getSessionPath(sessionName: string): string {
    return path.join(this._sessionsDir, `${sessionName}.json`);
  }

  private _prepareSessionsDir(): void {
    if (!fs.existsSync(this._sessionsDir)) {
      fs.mkdirSync(this._sessionsDir, { recursive: true });
    }
  }

  private async _cleanupStaleSessions(tmuxSessions: string[]): Promise<void> {
    // Check if directory exists first
    if (!fs.existsSync(this._sessionsDir)) {
      return;
    }

    const sessionFiles = fs
      .readdirSync(this._sessionsDir)
      .filter((file) => file.endsWith(".json"));

    const staleSessions = sessionFiles.filter((file) => {
      const sessionName = path.basename(file, ".json");
      return !tmuxSessions.includes(sessionName);
    });

    await Promise.all(
      staleSessions.map((file) =>
        fs.promises.unlink(path.join(this._sessionsDir, file)).catch(() => {}),
      ),
    );
  }

  // Load session information (internal use)
  private async _loadSessionInfo(
    sessionName: string,
  ): Promise<SessionInfo | null> {
    const filePath = this._getSessionPath(sessionName);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(fileContent);

    const result = SessionInfoSchema.safeParse(jsonData);
    if (!result.success) {
      // Remove invalid JSON file
      fs.unlinkSync(filePath);
      return null;
    }

    return result.data;
  }
}
