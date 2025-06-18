# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ccteam (Claude Code Team) is a CLI tool that orchestrates multiple Claude Code instances in tmux sessions to enable collaborative task execution. It implements a three-role system where different Claude Code instances work together on complex tasks.

## Development Commands

### Build and Run
```bash
# Run the CLI directly with Bun
bun run ./src/main.ts

# Build the project (creates dist/main.js)
bun run build

# Format code with Biome
bun run fmt

# Lint code with Biome
bun run lint

# Type check
bun run typecheck
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
- Messages between roles use file-based communication via `.ccteam/<session_name>/messages/` directory
- Each role has a prefix: `[MANAGER]`, `[LEADER]`, `[WORKER]`
- Messages are sent using the CLI's `send` command, NOT direct tmux commands
- Message files must follow naming pattern: `{sender}-to-{receiver}-{id}.md`
- Each session maintains its own isolated message directory to prevent interference

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
- Always use session-aware path helpers: `getMessagesPath()` and `getInstructionsPath()` from `lib/util.ts`
- Check existence before file operations
- Use Bun's text import syntax for markdown files: `import ... with { type: "text" }`

**Session Management**:
- Session names are dynamically generated as `ccteam-{5randomChars}`
- Session name is retrieved from tmux using `loadSessionName()` from `lib/util.ts`
- Each session creates isolated directories: `.ccteam/<session_name>/messages/` and `.ccteam/<session_name>/instructions/`
- Multiple sessions can run simultaneously without interference

### Technical Stack
- **Runtime**: Bun v1.2.16 (direct TypeScript execution)
- **Language**: TypeScript with ESNext target and strict mode
- **Module Resolution**: Bundler mode with `.ts` import extensions allowed
- **Code Quality**: Biome for formatting/linting with pre-commit hooks
- **CLI Framework**: Commander.js
- **Build Process**: Bun.build API with external packages and node target
- **Release Management**: Release Please for automated releases
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
- Pre-commit hooks run Biome formatting/linting via Husky and lint-staged
- TypeScript is not transpiled during development - Bun executes `.ts` files directly
- Session-specific directories (`.ccteam/<session_name>/`) are created at runtime in the working directory
- Build process creates a single bundled file at `dist/main.js` with external dependencies
- Test files should use `*.spec.ts` naming convention and be placed alongside implementation files