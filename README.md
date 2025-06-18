# Claude Code Team

[![NPM Version](https://img.shields.io/npm/v/ccteam)](https://www.npmjs.com/package/ccteam)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/koki-develop/claude-code-team/release-please.yml)](https://github.com/koki-develop/claude-code-team/actions/workflows/release-please.yml)
[![GitHub License](https://img.shields.io/github/license/koki-develop/claude-code-team)](./LICENSE)

A collaborative AI coding tool that brings multiple Claude Code instances together to work on complex coding tasks.

## What is Claude Code Team?

Claude Code Team creates a team of three AI assistants that work together to complete your coding projects:

- **Manager** - Receives your requests and breaks them down into manageable tasks
- **Leader** - Reviews the tasks and creates detailed implementation plans
- **Worker** - Writes the actual code based on the Leader's specifications

Think of it as having a complete development team where each member has their own expertise, collaborating to deliver high-quality results.

## Requirements

Claude Code Team uses **`tmux`** to manage multiple AI sessions.  
For installation instructions, please refer to the following link:

- [tmux installation guide](https://github.com/tmux/tmux/wiki/Installing)

## Getting Started

### 1. **Initialize configuration (optional):**

Create a configuration file to customize your team's behavior:

```console
$ npx ccteam@latest init
```

This creates a `ccteam.yml` file where you can specify Claude models and settings for each role.

```yaml
# ccteam.yml

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

  # Leader role configuration
  # The Leader reviews Manager's tasks, creates implementation specs, and reviews Worker's output
  leader:
    # Claude model to use for this role (optional)
    # e.g. "opus", "sonnet", "claude-sonnet-4-20250514"
    model: ""

    # Skip permission prompts when using Claude Code (default: false)
    # Set to true to automatically accept all tool usage permissions
    skipPermissions: false

  # Worker role configuration
  # The Worker implements code based on Leader's specifications
  worker:
    # Claude model to use for this role (optional)
    # e.g. "opus", "sonnet", "claude-sonnet-4-20250514"
    model: ""

    # Skip permission prompts when using Claude Code (default: false)
    # Set to true to automatically accept all tool usage permissions
    skipPermissions: false
```

### 2. **Start a new team session:**

Run the following command to start Claude Code Team:

```console
$ npx ccteam@latest start
```

### 3. **Connect to your AI team:**

When Claude Code Team starts up, it will output the tmux session name, so you can attach to the session using the `tmux attach` command.

```console
$ tmux attach -t ccteam-XXXXX
```

### 4. **Give tasks to your Manager:**

Once connected, you'll see three panes with different AI roles. Start by talking to the Manager (usually the left pane) and describe what you want to build or fix.

### 5. **Watch the collaboration:**

The Manager will delegate tasks to the Leader, who will create specifications for the Worker. You can observe the entire process and provide feedback at any stage.

That's it! Your AI team will handle the rest, from planning to implementation.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Koki Sato
