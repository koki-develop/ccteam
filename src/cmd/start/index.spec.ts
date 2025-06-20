import { describe, expect, it } from "bun:test";
import type { RoleConfig } from "../../lib/config";
import { buildClaudeCommand } from "./index";

describe("start command", () => {
  describe("buildClaudeCommand", () => {
    it("should build basic command without tool restrictions", () => {
      const roleConfig: RoleConfig = {
        model: "opus",
        skipPermissions: true,
      };

      const command = buildClaudeCommand(roleConfig);
      expect(command).toEqual([
        "claude",
        "--model",
        '"opus"',
        "--skip-permissions",
      ]);
    });

    it("should build command with allowed tools using double quotes", () => {
      const roleConfig: RoleConfig = {
        allowedTools: ["Bash", "Read", "Edit"],
        skipPermissions: false,
      };

      const command = buildClaudeCommand(roleConfig);
      expect(command).toEqual(["claude", "--allowedTools", '"Bash,Read,Edit"']);
    });

    it("should build command with disallowed tools using double quotes", () => {
      const roleConfig: RoleConfig = {
        disallowedTools: ["WebFetch", "WebSearch"],
        skipPermissions: false,
      };

      const command = buildClaudeCommand(roleConfig);
      expect(command).toEqual([
        "claude",
        "--disallowedTools",
        '"WebFetch,WebSearch"',
      ]);
    });

    it("should handle special characters in tool names with proper quoting", () => {
      const roleConfig: RoleConfig = {
        allowedTools: ["Bash(git:*)", "Edit"],
        disallowedTools: ["Bash(npm:*)", "WebFetch"],
        skipPermissions: false,
      };

      const command = buildClaudeCommand(roleConfig);
      expect(command).toEqual([
        "claude",
        "--allowedTools",
        '"Bash(git:*),Edit"',
        "--disallowedTools",
        '"Bash(npm:*),WebFetch"',
      ]);
    });

    it("should build full command with all options", () => {
      const roleConfig: RoleConfig = {
        model: "sonnet",
        skipPermissions: true,
        allowedTools: ["Bash(git:*)", "Edit"],
        disallowedTools: ["WebFetch"],
      };

      const command = buildClaudeCommand(roleConfig);
      expect(command).toEqual([
        "claude",
        "--model",
        '"sonnet"',
        "--skip-permissions",
        "--allowedTools",
        '"Bash(git:*),Edit"',
        "--disallowedTools",
        '"WebFetch"',
      ]);
    });

    it("should not add tool flags for empty arrays", () => {
      const roleConfig: RoleConfig = {
        allowedTools: [],
        disallowedTools: [],
        skipPermissions: false,
      };

      const command = buildClaudeCommand(roleConfig);
      expect(command).toEqual(["claude"]);
    });

    it("should handle single tool with special characters", () => {
      const roleConfig: RoleConfig = {
        allowedTools: ["Bash(git:commit,push,pull)"],
        skipPermissions: false,
      };

      const command = buildClaudeCommand(roleConfig);
      expect(command).toEqual([
        "claude",
        "--allowedTools",
        '"Bash(git:commit,push,pull)"',
      ]);
    });

    it("should handle tools with embedded quotes using safe escaping", () => {
      const roleConfig: RoleConfig = {
        allowedTools: ['Bash(git:commit --message="fix")'],
        disallowedTools: ["Tool\\with\\backslashes"],
        skipPermissions: false,
      };

      const command = buildClaudeCommand(roleConfig);
      expect(command).toEqual([
        "claude",
        "--allowedTools",
        '"Bash(git:commit --message=\\"fix\\")"',
        "--disallowedTools",
        '"Tool\\\\with\\\\backslashes"',
      ]);
    });

    it("should handle Unicode characters in tool names", () => {
      const roleConfig: RoleConfig = {
        allowedTools: ["Bash(git:commit)", "Tool🎉"],
        skipPermissions: false,
      };

      const command = buildClaudeCommand(roleConfig);
      expect(command).toEqual([
        "claude",
        "--allowedTools",
        '"Bash(git:commit),Tool🎉"',
      ]);
    });

    it("should quote model names with hyphens", () => {
      const roleConfig: RoleConfig = {
        model: "claude-sonnet-4-20250514",
        skipPermissions: false,
      };

      const command = buildClaudeCommand(roleConfig);
      expect(command).toEqual([
        "claude",
        "--model",
        '"claude-sonnet-4-20250514"',
      ]);
    });

    it("should quote model names with spaces", () => {
      const roleConfig: RoleConfig = {
        model: "model with spaces",
        skipPermissions: false,
      };

      const command = buildClaudeCommand(roleConfig);
      expect(command).toEqual(["claude", "--model", '"model with spaces"']);
    });

    it("should quote model names with embedded quotes", () => {
      const roleConfig: RoleConfig = {
        model: 'model"with"quotes',
        skipPermissions: false,
      };

      const command = buildClaudeCommand(roleConfig);
      expect(command).toEqual(["claude", "--model", '"model\\"with\\"quotes"']);
    });

    it("should quote model names with special characters", () => {
      const roleConfig: RoleConfig = {
        model: "model(special)chars",
        skipPermissions: false,
      };

      const command = buildClaudeCommand(roleConfig);
      expect(command).toEqual(["claude", "--model", '"model(special)chars"']);
    });

    it("should quote complex model names with mixed special characters", () => {
      const roleConfig: RoleConfig = {
        model: 'complex-model "v2.0" (beta)',
        skipPermissions: false,
      };

      const command = buildClaudeCommand(roleConfig);
      expect(command).toEqual([
        "claude",
        "--model",
        '"complex-model \\"v2.0\\" (beta)"',
      ]);
    });
  });
});
