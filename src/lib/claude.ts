import { quote } from "./util";

export type ClaudeParams = {
  model?: string;
  skipPermissions?: boolean;
  allowedTools?: string[];
  disallowedTools?: string[];
};

export function buildClaudeCommand(params: ClaudeParams): string[] {
  const command = ["claude"];

  if (params.model) {
    command.push("--model", quote(params.model));
  }

  if (params.skipPermissions) {
    command.push("--skip-permissions");
  }

  if (params.allowedTools && params.allowedTools.length > 0) {
    command.push("--allowedTools", quote(params.allowedTools.join(",")));
  }

  if (params.disallowedTools && params.disallowedTools.length > 0) {
    command.push("--disallowedTools", quote(params.disallowedTools.join(",")));
  }

  return command;
}
