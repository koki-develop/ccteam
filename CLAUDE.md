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

# Type check (no test command defined yet)
bun tsc --noEmit
```

### CLI Usage
```bash
# Initialize tmux session with 3 Claude Code instances (generates unique session name)
ccteam start

# Send message to specific role (for agents only)
ccteam send <role> <message>  # role: manager|leader|worker

# Delete processed message files (for agents only)
ccteam messages delete <message-file>
```

## Architecture

### Three-Role System
1. **Manager** - Receives user requests, decomposes tasks, delegates to Leader
2. **Leader** - Reviews Manager's tasks, creates implementation specs for Worker, reviews Worker's output  
3. **Worker** - Implements code based on Leader's specifications

### Communication Protocol
- Messages between roles use file-based communication via `.ccteam/messages/` directory
- Each role has a prefix: `[MANAGER]`, `[LEADER]`, `[WORKER]`
- Messages are sent using the CLI's `send` command, NOT direct tmux commands
- Message files must follow naming pattern: `{sender}-to-{receiver}-{id}.md`

### Code Patterns

**Command Structure**:
- Commands are implemented in `src/cmd/{command-name}/index.ts`
- All commands are async functions with typed parameters
- Commands can import and reuse other commands (e.g., `start` uses `send`)

**Error Handling**:
- Early validation with clear error messages
- File existence checks before operations
- Automatic directory creation with `{ recursive: true }`

**Logging Convention**:
- Use `[INFO]` prefix for all console logs
- Progress messages for multi-step operations
- Decorative completion messages with emoji and separators

**File Operations**:
- Always use `path.join(process.cwd(), ".ccteam", ...)` for paths
- Check existence before file operations
- Use Bun's text import syntax for markdown files: `import ... with { type: "text" }`

**Session Management**:
- Session names are dynamically generated as `ccteam-{5randomChars}`
- Session name is persisted in `.ccteam/session` file
- Use `loadSessionName()` from `lib/util.ts` to retrieve current session

### Technical Stack
- **Runtime**: Bun v1.2.16 (direct TypeScript execution)
- **Language**: TypeScript with ESNext target and strict mode
- **Module Resolution**: Bundler mode
- **Code Quality**: Biome for formatting/linting with pre-commit hooks
- **CLI Framework**: Commander.js
- **No testing framework configured yet**

### Important Constraints
- Never use `tmux send-keys` directly - always use `bun run ./src/main.ts send`
- Never use `rm` to delete message files - always use `bun run ./src/main.ts messages delete`
- Tmux operations must use the `tmux()` wrapper in `lib/tmux.ts`
- All role instructions are embedded in the binary from `src/instructions/*.md`

## Project Structure
```
src/
├── main.ts              # CLI entry point
├── cmd/                 # Command implementations
│   ├── messages/        # Message management commands
│   ├── send/            # Message sending command
│   └── start/           # Session initialization command
├── instructions/        # Role-specific instruction documents
├── lib/                 # Shared utilities
│   ├── tmux.ts          # tmux command wrapper
│   └── util.ts          # General utilities (sleep, session management, etc.)
└── types/               # TypeScript type definitions
```

## Development Notes
- Pre-commit hooks run Biome formatting/linting via Husky
- TypeScript is not transpiled - Bun executes `.ts` files directly
- The `.ccteam/` directory is created at runtime in the working directory