import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { z } from "zod";

const RoleConfigSchema = z
  .object({
    model: z.string().optional(),
    skipPermissions: z.boolean().default(false),
  })
  .default({});

const ConfigSchema = z.object({
  roles: z.object({
    manager: RoleConfigSchema,
    leader: RoleConfigSchema,
    worker: RoleConfigSchema,
  }),
});

export type RoleConfig = z.infer<typeof RoleConfigSchema>;
export type Config = z.infer<typeof ConfigSchema>;

const DEFAULT_CONFIG: Config = {
  roles: {
    manager: { skipPermissions: false },
    leader: { skipPermissions: false },
    worker: { skipPermissions: false },
  },
};

export async function loadConfig(configPath?: string): Promise<Config> {
  const targetPath = path.resolve(process.cwd(), configPath || "ccteam.yml");

  if (!fs.existsSync(targetPath)) {
    if (configPath) {
      throw new Error(`Configuration file not found: ${targetPath}`);
    }
    return DEFAULT_CONFIG;
  }

  const fileContent = fs.readFileSync(targetPath, "utf8");
  const yamlData = YAML.parse(fileContent);

  return ConfigSchema.parse(yamlData);
}
