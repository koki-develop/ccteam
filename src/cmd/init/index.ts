import fs from "node:fs";
import path from "node:path";

export async function initCommand(configPath: string): Promise<void> {
  const targetPath = path.resolve(process.cwd(), configPath);

  if (fs.existsSync(targetPath)) {
    throw new Error(`Configuration file already exists: ${targetPath}`);
  }

  const yamlContent = `# Claud Code Team (https://www.npmjs.com/package/ccteam) configuration file

roles:
  # Manager role configuration
  # The Manager receives user requests, decomposes tasks, and coordinates with the Leader
  manager:
    # Claude model to use for this role (optional)
    # e.g. "opus", "sonnet", "claude-sonnet-4-20250514"
    model: ""

    # Skip permission prompts when using Claude Code (default: false)
    # Set to true to automatically accept all tool usage permissions
    skipPermissions: false

    # List of allowed tools for this role (optional)
    # Tool restrictions can use format like "Bash(git:*)" to limit tool usage
    # allowedTools:
    #   - "Bash(git:*)"
    #   - "Edit"

    # List of disallowed tools for this role (optional)
    # Use this to restrict certain tools from being used by this role
    # disallowedTools:
    #   - "Bash(git:*)"
    #   - "WebFetch"

  # Leader role configuration
  # The Leader reviews Manager's tasks, creates implementation specs, and reviews Worker's output
  leader:
    # Claude model to use for this role (optional)
    # e.g. "opus", "sonnet", "claude-sonnet-4-20250514"
    model: ""

    # Skip permission prompts when using Claude Code (default: false)
    # Set to true to automatically accept all tool usage permissions
    skipPermissions: false

    # List of allowed tools for this role (optional)
    # Tool restrictions can use format like "Bash(git:*)" to limit tool usage
    # allowedTools:
    #   - "Bash(git:*)"
    #   - "Edit"

    # List of disallowed tools for this role (optional)
    # Use this to restrict certain tools from being used by this role
    # disallowedTools:
    #   - "Bash(git:*)"
    #   - "WebFetch"

  # Worker role configuration
  # The Worker implements code based on Leader's specifications
  worker:
    # Claude model to use for this role (optional)
    # e.g. "opus", "sonnet", "claude-sonnet-4-20250514"
    model: ""

    # Skip permission prompts when using Claude Code (default: false)
    # Set to true to automatically accept all tool usage permissions
    skipPermissions: false

    # List of allowed tools for this role (optional)
    # Tool restrictions can use format like "Bash(git:*)" to limit tool usage
    # allowedTools:
    #   - "Bash(git:*)"
    #   - "Edit"

    # List of disallowed tools for this role (optional)
    # Use this to restrict certain tools from being used by this role
    # disallowedTools:
    #   - "Bash(git:*)"
    #   - "WebFetch"
`;

  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(targetPath, yamlContent);
  console.log(`[INFO] Configuration file created successfully: ${configPath}`);
}
