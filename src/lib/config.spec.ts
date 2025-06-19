import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { loadConfig } from "./config";

const TEST_CONFIG_DIR = path.join(process.cwd(), "tmp/");

describe("config", () => {
  beforeEach(() => {
    if (!fs.existsSync(TEST_CONFIG_DIR)) {
      fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(TEST_CONFIG_DIR)) {
      fs.rmSync(TEST_CONFIG_DIR, { recursive: true, force: true });
    }
  });

  describe("loadConfig", () => {
    it("should load valid YAML config file correctly", () => {
      const configPath = path.join(TEST_CONFIG_DIR, "valid-config.yml");
      const configContent = `
roles:
  manager:
    model: haiku
    skipPermissions: true
  leader:
    model: sonnet
    skipPermissions: false
  worker:
    model: opus
    skipPermissions: true
`;
      fs.writeFileSync(configPath, configContent);

      const config = loadConfig(configPath);
      expect(config).toEqual({
        roles: {
          manager: { model: "haiku", skipPermissions: true },
          leader: { model: "sonnet", skipPermissions: false },
          worker: { model: "opus", skipPermissions: true },
        },
      });
    });

    it("should apply default values for partial config file", () => {
      const configPath = path.join(TEST_CONFIG_DIR, "partial-config.yml");
      const configContent = `
roles:
  manager:
    model: haiku
  worker:
    skipPermissions: true
`;
      fs.writeFileSync(configPath, configContent);

      const config = loadConfig(configPath);
      expect(config).toEqual({
        roles: {
          manager: { model: "haiku", skipPermissions: false },
          leader: { skipPermissions: false },
          worker: { skipPermissions: true },
        },
      });
    });

    it("should throw error when specified config file does not exist", () => {
      const configPath = path.join(TEST_CONFIG_DIR, "non-existent.yml");
      expect(() => loadConfig(configPath)).toThrow(
        "Configuration file not found",
      );
    });

    it("should throw error for invalid YAML syntax", () => {
      const configPath = path.join(TEST_CONFIG_DIR, "invalid-syntax.yml");
      const configContent = `
roles:
  manager:
    model: haiku
    skipPermissions: true
  leader:
    model: sonnet
    skipPermissions: false
  worker:
    model: opus
    skipPermissions: true
    invalid: [unclosed array
`;
      fs.writeFileSync(configPath, configContent);

      expect(() => loadConfig(configPath)).toThrow();
    });

    it("should throw error for invalid schema", () => {
      const configPath = path.join(TEST_CONFIG_DIR, "invalid-schema.yml");
      const configContent = `
roles:
  manager:
    model: 123
    skipPermissions: "not-boolean"
  leader:
    invalidField: "value"
  worker: {}
`;
      fs.writeFileSync(configPath, configContent);

      expect(() => loadConfig(configPath)).toThrow();
    });

    it("should support both absolute and relative paths", () => {
      const relativeConfigPath = path.join("tmp", "relative-config.yml");
      const absoluteConfigPath = path.join(
        TEST_CONFIG_DIR,
        "absolute-config.yml",
      );
      const configContent = `
roles:
  manager:
    model: haiku
    skipPermissions: true
  leader:
    model: sonnet
    skipPermissions: false
  worker:
    model: opus
    skipPermissions: true
`;
      fs.writeFileSync(
        path.join(process.cwd(), relativeConfigPath),
        configContent,
      );
      fs.writeFileSync(absoluteConfigPath, configContent);

      const relativeConfig = loadConfig(relativeConfigPath);
      const absoluteConfig = loadConfig(absoluteConfigPath);

      expect(relativeConfig).toEqual(absoluteConfig);
      expect(relativeConfig.roles.manager.model).toBe("haiku");
    });

    it("should load config with tool restrictions correctly", () => {
      const configPath = path.join(TEST_CONFIG_DIR, "tools-config.yml");
      const configContent = `
roles:
  manager:
    model: haiku
    skipPermissions: true
    allowedTools:
      - "Bash"
      - "Read"
      - "Edit"
    disallowedTools:
      - "WebFetch"
      - "WebSearch"
  leader:
    model: sonnet
    allowedTools:
      - "Read"
      - "Glob"
      - "Grep"
  worker:
    model: opus
    disallowedTools:
      - "WebFetch"
`;
      fs.writeFileSync(configPath, configContent);

      const config = loadConfig(configPath);
      expect(config).toEqual({
        roles: {
          manager: {
            model: "haiku",
            skipPermissions: true,
            allowedTools: ["Bash", "Read", "Edit"],
            disallowedTools: ["WebFetch", "WebSearch"],
          },
          leader: {
            model: "sonnet",
            skipPermissions: false,
            allowedTools: ["Read", "Glob", "Grep"],
          },
          worker: {
            model: "opus",
            skipPermissions: false,
            disallowedTools: ["WebFetch"],
          },
        },
      });
    });

    it("should handle empty tool arrays correctly", () => {
      const configPath = path.join(TEST_CONFIG_DIR, "empty-tools-config.yml");
      const configContent = `
roles:
  manager:
    model: haiku
    allowedTools: []
    disallowedTools: []
  leader: {}
  worker: {}
`;
      fs.writeFileSync(configPath, configContent);

      const config = loadConfig(configPath);
      expect(config).toEqual({
        roles: {
          manager: {
            model: "haiku",
            skipPermissions: false,
            allowedTools: [],
            disallowedTools: [],
          },
          leader: { skipPermissions: false },
          worker: { skipPermissions: false },
        },
      });
    });

    it("should throw error for invalid tool array schema", () => {
      const configPath = path.join(TEST_CONFIG_DIR, "invalid-tools-schema.yml");
      const configContent = `
roles:
  manager:
    allowedTools: "not-an-array"
  leader:
    disallowedTools:
      - 123
      - "valid-tool"
  worker: {}
`;
      fs.writeFileSync(configPath, configContent);

      expect(() => loadConfig(configPath)).toThrow();
    });

    it("should handle special characters in tool names correctly", () => {
      const configPath = path.join(TEST_CONFIG_DIR, "special-chars-config.yml");
      const configContent = `
roles:
  manager:
    allowedTools:
      - "Bash(git:*)"
      - "Edit"
    disallowedTools:
      - "Bash(npm:*)"
  leader: {}
  worker: {}
`;
      fs.writeFileSync(configPath, configContent);

      const config = loadConfig(configPath);
      expect(config).toEqual({
        roles: {
          manager: {
            skipPermissions: false,
            allowedTools: ["Bash(git:*)", "Edit"],
            disallowedTools: ["Bash(npm:*)"],
          },
          leader: { skipPermissions: false },
          worker: { skipPermissions: false },
        },
      });
    });
  });
});
