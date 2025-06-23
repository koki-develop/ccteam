import chalk from "chalk";

export type LogType = "info" | "warn" | "error";

export function log(type: LogType, message: string) {
  console.log(_prefix(type), message);
}

function _prefix(type: LogType) {
  switch (type) {
    case "info":
      return chalk.blue("[INFO]");
    case "warn":
      return chalk.yellow("[WARN]");
    case "error":
      return chalk.red("[ERROR]");
  }
}
