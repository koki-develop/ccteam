import { describe, expect, test } from "bun:test";
import { type ClaudeParams, buildClaudeCommand } from "./claude";

describe("buildClaudeCommand", () => {
  test("builds basic command", () => {
    const params: ClaudeParams = {};
    const result = buildClaudeCommand(params);
    expect(result).toEqual(["claude"]);
  });

  test("builds command with model parameter", () => {
    const params: ClaudeParams = {
      model: "opus",
    };
    const result = buildClaudeCommand(params);
    expect(result).toEqual(["claude", "--model", '"opus"']);
  });

  test("builds command with skipPermissions parameter", () => {
    const params: ClaudeParams = {
      skipPermissions: true,
    };
    const result = buildClaudeCommand(params);
    expect(result).toEqual(["claude", "--skip-permissions"]);
  });

  test("builds command with allowedTools parameter", () => {
    const params: ClaudeParams = {
      allowedTools: ["bash", "read"],
    };
    const result = buildClaudeCommand(params);
    expect(result).toEqual(["claude", "--allowedTools", '"bash,read"']);
  });

  test("builds command with disallowedTools parameter", () => {
    const params: ClaudeParams = {
      disallowedTools: ["web", "api"],
    };
    const result = buildClaudeCommand(params);
    expect(result).toEqual(["claude", "--disallowedTools", '"web,api"']);
  });

  test("builds command with all parameters", () => {
    const params: ClaudeParams = {
      model: "sonnet",
      skipPermissions: true,
      allowedTools: ["bash", "read", "edit"],
      disallowedTools: ["web", "api"],
    };
    const result = buildClaudeCommand(params);
    expect(result).toEqual([
      "claude",
      "--model",
      '"sonnet"',
      "--skip-permissions",
      "--allowedTools",
      '"bash,read,edit"',
      "--disallowedTools",
      '"web,api"',
    ]);
  });

  test("ignores empty allowedTools array", () => {
    const params: ClaudeParams = {
      allowedTools: [],
    };
    const result = buildClaudeCommand(params);
    expect(result).toEqual(["claude"]);
  });

  test("ignores empty disallowedTools array", () => {
    const params: ClaudeParams = {
      disallowedTools: [],
    };
    const result = buildClaudeCommand(params);
    expect(result).toEqual(["claude"]);
  });

  test("does not add flag when skipPermissions is false", () => {
    const params: ClaudeParams = {
      skipPermissions: false,
    };
    const result = buildClaudeCommand(params);
    expect(result).toEqual(["claude"]);
  });

  test("properly quotes model name with spaces", () => {
    const params: ClaudeParams = {
      model: "claude 3.5 sonnet",
    };
    const result = buildClaudeCommand(params);
    expect(result).toEqual(["claude", "--model", '"claude 3.5 sonnet"']);
  });

  test("properly quotes tool names with special characters", () => {
    const params: ClaudeParams = {
      allowedTools: ["bash-tool", "read:file"],
    };
    const result = buildClaudeCommand(params);
    expect(result).toEqual([
      "claude",
      "--allowedTools",
      '"bash-tool,read:file"',
    ]);
  });
});
