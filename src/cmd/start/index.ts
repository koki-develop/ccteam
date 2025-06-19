import fs from "node:fs";
import path from "node:path";
import boxen from "boxen";
import chalk from "chalk";
import ora from "ora";
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
import { generateSessionName, quote, sleep } from "../../lib/util";

interface StartOptions {
  config?: string;
  managerModel?: string;
  managerSkipPermissions?: boolean;
  managerAllowedTools?: string;
  managerDisallowedTools?: string;
  leaderModel?: string;
  leaderSkipPermissions?: boolean;
  leaderAllowedTools?: string;
  leaderDisallowedTools?: string;
  workerModel?: string;
  workerSkipPermissions?: boolean;
  workerAllowedTools?: string;
  workerDisallowedTools?: string;
}

export function buildClaudeCommand(roleConfig: RoleConfig): string[] {
  const command = ["claude"];

  if (roleConfig.model) {
    command.push("--model", quote(roleConfig.model));
  }

  if (roleConfig.skipPermissions) {
    command.push("--skip-permissions");
  }

  if (roleConfig.allowedTools && roleConfig.allowedTools.length > 0) {
    command.push("--allowedTools", quote(roleConfig.allowedTools.join(",")));
  }

  if (roleConfig.disallowedTools && roleConfig.disallowedTools.length > 0) {
    command.push(
      "--disallowedTools",
      quote(roleConfig.disallowedTools.join(",")),
    );
  }

  return command;
}

export async function startCommand(options: StartOptions) {
  console.log(`${chalk.blue("[INFO]")} Starting ccteam initialization...`);

  if (options.config) {
    console.log(`${chalk.blue("[INFO]")} Using config file: ${options.config}`);
  }
  const config = _loadConfig(options);

  const spinner = ora("Generating session name...").start();
  const session = generateSessionName();
  spinner.succeed(`Generated session: ${chalk.cyan(session)}`);

  const tmuxSpinner = ora("Creating tmux session...").start();
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
  tmuxSpinner.succeed("Tmux session created with 3 panes");

  await setupInstructions(session);
  await setupManager(session, config);
  await setupLeader(session, config);
  await setupWorker(session, config);

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
  const spinner = ora("Initializing Manager role...").start();
  const command = buildClaudeCommand(config.roles.manager);
  await send({ session, role: "manager", message: command.join(" ") });
  await sleep(3000);

  const prompt = `
You are the Manager role.
Session name: ${session}
Please read @.ccteam/${session}/instructions/manager.md and understand your role.
`.trim();
  await send({ session, role: "manager", message: prompt });
  spinner.succeed("Manager role initialized");
}

async function setupLeader(session: string, config: Config) {
  const spinner = ora("Initializing Leader role...").start();
  const command = buildClaudeCommand(config.roles.leader);
  await send({ session, role: "leader", message: command.join(" ") });
  await sleep(3000);

  const prompt = `
You are the Leader role.
Session name: ${session}
Please read @.ccteam/${session}/instructions/leader.md and understand your role.
`.trim();
  await send({ session, role: "leader", message: prompt });
  spinner.succeed("Leader role initialized");
}

async function setupWorker(session: string, config: Config) {
  const spinner = ora("Initializing Worker role...").start();
  const command = buildClaudeCommand(config.roles.worker);
  await send({ session, role: "worker", message: command.join(" ") });
  await sleep(3000);

  const prompt = `
You are the Worker role.
Session name: ${session}
Please read @.ccteam/${session}/instructions/worker.md and understand your role.
`.trim();
  await send({ session, role: "worker", message: prompt });
  spinner.succeed("Worker role initialized");
}

function showAttachInstructions(session: string) {
  const message = [
    chalk.white("Your team is set up with 3 roles:"),
    `${chalk.cyan("  • Manager")} - Task decomposition & delegation`,
    `${chalk.yellow("  • Leader")} - Review & implementation specs`,
    `${chalk.magenta("  • Worker")} - Code implementation`,
    "",
    chalk.white("To start collaborating:"),
    chalk.gray("  $ ") + chalk.bold(`tmux attach-session -t ${session}`),
  ].join("\n");

  console.log(
    boxen(message, {
      title: "🎉 Claude Code Team Ready!",
      titleAlignment: "center",
      padding: 1,
      margin: 1,
      borderStyle: "round",
      borderColor: "green",
      backgroundColor: "black",
    }),
  );
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
          ...(cliOptions.managerAllowedTools != null && {
            allowedTools: cliOptions.managerAllowedTools
              .split(",")
              .map((tool) => tool.trim()),
          }),
          ...(cliOptions.managerDisallowedTools != null && {
            disallowedTools: cliOptions.managerDisallowedTools
              .split(",")
              .map((tool) => tool.trim()),
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
          ...(cliOptions.leaderAllowedTools != null && {
            allowedTools: cliOptions.leaderAllowedTools
              .split(",")
              .map((tool) => tool.trim()),
          }),
          ...(cliOptions.leaderDisallowedTools != null && {
            disallowedTools: cliOptions.leaderDisallowedTools
              .split(",")
              .map((tool) => tool.trim()),
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
          ...(cliOptions.workerAllowedTools != null && {
            allowedTools: cliOptions.workerAllowedTools
              .split(",")
              .map((tool) => tool.trim()),
          }),
          ...(cliOptions.workerDisallowedTools != null && {
            disallowedTools: cliOptions.workerDisallowedTools
              .split(",")
              .map((tool) => tool.trim()),
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
        ...(cliOptions.managerAllowedTools != null && {
          allowedTools: cliOptions.managerAllowedTools
            .split(",")
            .map((tool) => tool.trim()),
        }),
        ...(cliOptions.managerDisallowedTools != null && {
          disallowedTools: cliOptions.managerDisallowedTools
            .split(",")
            .map((tool) => tool.trim()),
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
        ...(cliOptions.leaderAllowedTools != null && {
          allowedTools: cliOptions.leaderAllowedTools
            .split(",")
            .map((tool) => tool.trim()),
        }),
        ...(cliOptions.leaderDisallowedTools != null && {
          disallowedTools: cliOptions.leaderDisallowedTools
            .split(",")
            .map((tool) => tool.trim()),
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
        ...(cliOptions.workerAllowedTools != null && {
          allowedTools: cliOptions.workerAllowedTools
            .split(",")
            .map((tool) => tool.trim()),
        }),
        ...(cliOptions.workerDisallowedTools != null && {
          disallowedTools: cliOptions.workerDisallowedTools
            .split(",")
            .map((tool) => tool.trim()),
        }),
      },
    },
  };
}
