import fs from "node:fs";
import YAML from "yaml";
import { z } from "zod";
import { CCTeamError } from "./error";

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
  const fileContent = fs.readFileSync(configPath, "utf8");

  let yamlData: Record<string, unknown>;
  try {
    yamlData = YAML.parse(fileContent);
  } catch (yamlError) {
    if (yamlError instanceof Error) {
      throw new CCTeamError(
        "Invalid YAML format in configuration file",
        yamlError.message,
      );
    }
    throw yamlError;
  }

  const result = ConfigSchema.safeParse(yamlData);
  if (!result.success) {
    const errorMessages = result.error.errors
      .map((err) => `- ${err.path.join(".")}: ${err.message}`)
      .join("\n");
    throw new CCTeamError("Invalid configuration format", errorMessages);
  }

  return result.data;
}
