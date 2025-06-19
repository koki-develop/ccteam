import fs from "node:fs";
import YAML from "yaml";
import { z } from "zod";

const RoleConfigSchema = z
  .object({
    model: z.string().optional(),
    skipPermissions: z.boolean().default(false),
    allowedTools: z.array(z.string()).optional(),
    disallowedTools: z.array(z.string()).optional(),
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

export function loadConfig(configPath: string): Config {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found: ${configPath}`);
  }

  const fileContent = fs.readFileSync(configPath, "utf8");
  const yamlData = YAML.parse(fileContent);

  return ConfigSchema.parse(yamlData);
}
