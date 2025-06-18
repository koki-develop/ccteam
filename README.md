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

### 1. **Start a new team session:**

Run the following command to start Claude Code Team:

```console
$ npx ccteam@latest start
```

### 2. **Connect to your AI team:**

When Claude Code Team starts up, it will output the tmux session name, so you can attach to the session using the `tmux attach` command.

```console
$ tmux attach -t ccteam-XXXXX
```

### 3. **Give tasks to your Manager:**

Once connected, you'll see three panes with different AI roles. Start by talking to the Manager (usually the left pane) and describe what you want to build or fix.

### 4. **Watch the collaboration:**

The Manager will delegate tasks to the Leader, who will create specifications for the Worker. You can observe the entire process and provide feedback at any stage.

That's it! Your AI team will handle the rest, from planning to implementation.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Koki Sato
