# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ccteam (Claude Code Team) is a CLI tool that orchestrates multiple Claude Code instances in tmux sessions to enable collaborative task execution. It implements a three-role system where different Claude Code instances work together on complex tasks.

## Development Commands

### Build and Run
```bash
# Run the CLI directly with Bun
bun run ./src/main.ts

# Format code
bun run fmt

# Lint code
bun run lint
```

### Key Commands
- `ccteam start` - Initialize tmux session with 3 Claude Code instances
- `ccteam send <role> <message>` - Send message to specific role (manager/reviewer/worker)
- `ccteam messages delete <message>` - Delete processed message files

## Architecture

### Three-Role System
1. **Manager** - Receives user requests, decomposes tasks, delegates to Reviewer
2. **Reviewer** - Reviews Manager's tasks, creates implementation specs for Worker, reviews Worker's output
3. **Worker** - Implements code based on Reviewer's specifications

### Communication Protocol
- Messages between roles use file-based communication via `.ccteam/messages/` directory
- Each role has a prefix: `[MANAGER]`, `[REVIEWER]`, `[WORKER]`
- Messages are sent using the CLI's `send` command, NOT direct tmux commands

### Key Technical Details
- **Runtime**: Bun v1.2.16
- **Language**: TypeScript with ESNext target and strict mode
- **Module Resolution**: Bundler mode
- **Code Quality**: Biome for formatting/linting with pre-commit hooks
- **Message Files**: Markdown files in `.ccteam/messages/` with role-specific naming conventions

### Important Constraints
- Never use `tmux send-keys` directly - always use `bun run ./src/main.ts send`
- Never use `rm` to delete message files - always use `bun run ./src/main.ts messages delete`
- Message files must follow naming pattern: `{sender}-to-{receiver}-{id}.md`

## File Structure
- `src/main.ts` - CLI entry point
- `src/cmd/` - Command implementations
- `src/instructions/` - Role-specific instruction documents
- `src/lib/` - Utilities (tmux wrapper, general utils)
- `src/types/` - TypeScript type definitions