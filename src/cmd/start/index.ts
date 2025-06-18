import fs from "node:fs";
import path from "node:path";
import leaderInstruction from "../../instructions/leader.md" with {
  type: "text",
};
import managerInstruction from "../../instructions/manager.md" with {
  type: "text",
};
import workerInstruction from "../../instructions/worker.md" with {
  type: "text",
};
import { type Config, type RoleConfig, loadConfig } from "../../lib/config";
import { send, tmux } from "../../lib/tmux";
import { generateSessionName, sleep } from "../../lib/util";

interface StartOptions {
  config?: string;
  managerModel?: string;
  managerSkipPermissions?: boolean;
  leaderModel?: string;
  leaderSkipPermissions?: boolean;
  workerModel?: string;
  workerSkipPermissions?: boolean;
}

function buildClaudeCommand(roleConfig: RoleConfig): string[] {
  const command = ["claude"];

  if (roleConfig.model) {
    command.push("--model", roleConfig.model);
  }

  if (roleConfig.skipPermissions) {
    command.push("--skip-permissions");
  }

  return command;
}

export async function startCommand(options: StartOptions) {
  console.log("[INFO] Starting ccteam initialization...");

  if (options.config) {
    console.log(`[INFO] Using config file: ${options.config}`);
  }
  const config = _loadConfig(options);

  const session = generateSessionName();
  await tmux(
    // Create a new session
    "new-session",
    "-s",
    session,
    "-c",
    process.cwd(),
    "-d",
    ";",
    // Split the window horizontally
    "split-window",
    "-t",
    `${session}:0.0`,
    "-h",
    "-p",
    "50",
    ";",
    // Move to the right pane
    "select-pane",
    "-t",
    `${session}:0.1`,
    ";",
    // Split the right pane vertically
    "split-window",
    "-t",
    `${session}:0.1`,
    "-v",
    "-p",
    "50",
    ";",
    // Move to the left pane
    "select-pane",
    "-t",
    `${session}:0.0`,
  );
  console.log(`[INFO] Created tmux session: ${session}`);

  console.log("[INFO] Setting up roles...");
  await setupInstructions(session);
  await setupManager(session, config);
  await setupLeader(session, config);
  await setupWorker(session, config);
  console.log("[INFO] All roles initialized");

  showAttachInstructions(session);
}

async function setupInstructions(session: string) {
  const instructionsDir = path.join(
    process.cwd(),
    ".ccteam",
    session,
    "instructions",
  );
  if (!fs.existsSync(instructionsDir)) {
    fs.mkdirSync(instructionsDir, { recursive: true });
  }

  const managerInstructionPath = path.join(instructionsDir, "manager.md");
  const leaderInstructionPath = path.join(instructionsDir, "leader.md");
  const workerInstructionPath = path.join(instructionsDir, "worker.md");

  fs.writeFileSync(managerInstructionPath, managerInstruction);
  fs.writeFileSync(leaderInstructionPath, leaderInstruction);
  fs.writeFileSync(workerInstructionPath, workerInstruction);
}

async function setupManager(session: string, config: Config) {
  const command = buildClaudeCommand(config.roles.manager);
  await send({ session, role: "manager", message: command.join(" ") });
  await sleep(3000);

  const prompt = `
You are the Manager role.
Session name: ${session}
Please read @.ccteam/${session}/instructions/manager.md and understand your role.
`.trim();
  await send({ session, role: "manager", message: prompt });
}

async function setupLeader(session: string, config: Config) {
  const command = buildClaudeCommand(config.roles.leader);
  await send({ session, role: "leader", message: command.join(" ") });
  await sleep(3000);

  const prompt = `
You are the Leader role.
Session name: ${session}
Please read @.ccteam/${session}/instructions/leader.md and understand your role.
`.trim();
  await send({ session, role: "leader", message: prompt });
}

async function setupWorker(session: string, config: Config) {
  const command = buildClaudeCommand(config.roles.worker);
  await send({ session, role: "worker", message: command.join(" ") });
  await sleep(3000);

  const prompt = `
You are the Worker role.
Session name: ${session}
Please read @.ccteam/${session}/instructions/worker.md and understand your role.
`.trim();
  await send({ session, role: "worker", message: prompt });
}

function showAttachInstructions(session: string) {
  console.log("=".repeat(60));
  console.log("  🎉 Claude Code Team initialization completed!");
  console.log("  To attach to the session, run the following command:");
  console.log(`    $ tmux attach-session -t ${session}`);
  console.log("=".repeat(60));
}

function _loadConfig(options: StartOptions): Config {
  const { config: configPath, ...cliOptions } = options;

  const resolvedConfigPath = path.resolve(
    process.cwd(),
    configPath ?? "ccteam.yml",
  );

  if (fs.existsSync(resolvedConfigPath)) {
    const fileConfig = loadConfig(resolvedConfigPath);
    return {
      roles: {
        manager: {
          ...fileConfig.roles.manager,
          ...(cliOptions.managerModel != null && {
            model: cliOptions.managerModel,
          }),
          ...(cliOptions.managerSkipPermissions != null && {
            skipPermissions: cliOptions.managerSkipPermissions,
          }),
        },
        leader: {
          ...fileConfig.roles.leader,
          ...(cliOptions.leaderModel != null && {
            model: cliOptions.leaderModel,
          }),
          ...(cliOptions.leaderSkipPermissions != null && {
            skipPermissions: cliOptions.leaderSkipPermissions,
          }),
        },
        worker: {
          ...fileConfig.roles.worker,
          ...(cliOptions.workerModel != null && {
            model: cliOptions.workerModel,
          }),
          ...(cliOptions.workerSkipPermissions != null && {
            skipPermissions: cliOptions.workerSkipPermissions,
          }),
        },
      },
    };
  }

  if (configPath) {
    throw new Error(`Configuration file not found: ${configPath}`);
  }

  const defaultConfig: Config = {
    roles: {
      manager: { skipPermissions: false },
      leader: { skipPermissions: false },
      worker: { skipPermissions: false },
    },
  };

  return {
    roles: {
      manager: {
        ...defaultConfig.roles.manager,
        ...(cliOptions.managerModel != null && {
          model: cliOptions.managerModel,
        }),
        ...(cliOptions.managerSkipPermissions != null && {
          skipPermissions: cliOptions.managerSkipPermissions,
        }),
      },
      leader: {
        ...defaultConfig.roles.leader,
        ...(cliOptions.leaderModel != null && {
          model: cliOptions.leaderModel,
        }),
        ...(cliOptions.leaderSkipPermissions != null && {
          skipPermissions: cliOptions.leaderSkipPermissions,
        }),
      },
      worker: {
        ...defaultConfig.roles.worker,
        ...(cliOptions.workerModel != null && {
          model: cliOptions.workerModel,
        }),
        ...(cliOptions.workerSkipPermissions != null && {
          skipPermissions: cliOptions.workerSkipPermissions,
        }),
      },
    },
  };
}
