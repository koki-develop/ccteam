import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { CCTeamError } from "../../lib/error";
import { log } from "../../lib/log";
import ccteamYaml from "./ccteam.yml" with { type: "text" };

export async function initCommand(configPath: string): Promise<void> {
  const targetPath = path.resolve(process.cwd(), configPath);

  if (fs.existsSync(targetPath)) {
    throw new CCTeamError(
      `Configuration file already exists: ${chalk.cyan(targetPath)}`,
    );
  }

  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(targetPath, ccteamYaml);
  log("info", `Configuration file created: ${chalk.cyan(configPath)}`);
}
