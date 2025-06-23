import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import ora from "ora";
import { CCTeam } from "../../lib/ccteam";
import { type Config, loadConfig } from "../../lib/config";
import { CCTeamError } from "../../lib/error";
import { log } from "../../lib/log";
import { generateSessionName, toast } from "../../lib/util";

interface StartOptions {
  config?: string;

  managerModel?: string;
  leaderModel?: string;
  workerModel?: string;

  managerSkipPermissions?: boolean;
  leaderSkipPermissions?: boolean;
  workerSkipPermissions?: boolean;

  managerAllowedTools?: string;
  leaderAllowedTools?: string;
  workerAllowedTools?: string;

  managerDisallowedTools?: string;
  leaderDisallowedTools?: string;
  workerDisallowedTools?: string;
}

export async function startCommand(options: StartOptions) {
  log("info", "Starting ccteam initialization...");

  if (options.config) {
    log("info", `Using config file: ${options.config}`);
  }
  const config = _loadConfig(options);

  const session = generateSessionName();
  const ccteam = new CCTeam(session);

  // Check requirements
  const requirementsSpinner = ora("Checking requirements...").start();
  await ccteam.checkRequirements();
  requirementsSpinner.succeed("Requirements checked");

  // Prepare tmux session
  const prepareSpinner = ora("Preparing tmux session...").start();
  await ccteam.prepareSession();
  prepareSpinner.succeed("Tmux session created");

  // Setup roles
  const managerSpinner = ora("Setting up Manager role...").start();
  await ccteam.setupManager(config.roles.manager);
  managerSpinner.succeed("Manager role set up");
  const leaderSpinner = ora("Setting up Leader role...").start();
  await ccteam.setupLeader(config.roles.leader);
  leaderSpinner.succeed("Leader role set up");
  const workerSpinner = ora("Setting up Worker role...").start();
  await ccteam.setupWorker(config.roles.worker);
  workerSpinner.succeed("Worker role set up");

  toast({
    title: "🎉 Claude Code Team Ready!",
    message: [
      chalk.white("Your team is set up with 3 roles:"),
      `${chalk.cyan("  • Manager")} - Task decomposition & delegation`,
      `${chalk.yellow("  • Leader")} - Review & implementation specs`,
      `${chalk.magenta("  • Worker")} - Code implementation`,
      "",
      chalk.white("To start collaborating:"),
      chalk.gray("  $ ") + chalk.bold(`tmux attach-session -t ${session}`),
    ].join("\n"),
    color: "green",
  });
}

// TODO: refactor
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
    throw new CCTeamError(
      `Configuration file not found: ${chalk.cyan(configPath)}`,
    );
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
