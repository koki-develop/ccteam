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

# Lint code with Biome (also checks formatting)
bun run lint

# Type check
bun run typecheck

# Run tests
bun test

# Run specific test file
bun test src/lib/config.spec.ts
```

### Git Hooks
Pre-commit hooks automatically run Biome formatting/linting via Husky and lint-staged. This ensures code quality before commits.

### CLI Usage
```bash
# Initialize tmux session with 3 Claude Code instances (generates unique session name)
npx ccteam@latest start

# Start with custom configuration file
npx ccteam@latest start -c path/to/config.yml

# Start with CLI flags overriding configuration
npx ccteam@latest start --manager-model opus --worker-skip-permissions

# Create default configuration file
npx ccteam@latest init

# Create configuration file at custom path
npx ccteam@latest init -c path/to/config.yml

# Send message to specific role (for agents only)
npx ccteam@latest agent send --from <role> --to <role> <message>  # role: manager|leader|worker

# Delete processed message files (for agents only)
npx ccteam@latest agent messages delete <message-file>
```

### CLI Flags for Start Command
The `start` command supports flags to override configuration file settings:
- `--manager-model <string>`: Manager role model
- `--manager-skip-permissions`: Manager role skip permissions
- `--manager-allowed-tools <string>`: Manager role allowed tools (comma-separated list)
- `--manager-disallowed-tools <string>`: Manager role disallowed tools (comma-separated list)
- `--leader-model <string>`: Leader role model
- `--leader-skip-permissions`: Leader role skip permissions
- `--leader-allowed-tools <string>`: Leader role allowed tools (comma-separated list)
- `--leader-disallowed-tools <string>`: Leader role disallowed tools (comma-separated list)
- `--worker-model <string>`: Worker role model
- `--worker-skip-permissions`: Worker role skip permissions
- `--worker-allowed-tools <string>`: Worker role allowed tools (comma-separated list)
- `--worker-disallowed-tools <string>`: Worker role disallowed tools (comma-separated list)

## Architecture

### Three-Role System
1. **Manager** - Receives user requests, decomposes tasks, delegates to Leader
2. **Leader** - Reviews Manager's tasks, creates implementation specs for Worker, reviews Worker's output  
3. **Worker** - Implements code based on Leader's specifications

### Key Architectural Decisions
- **File-based Communication**: Chosen over direct process communication for reliability and debugging capabilities
- **Session Isolation**: Each ccteam session runs in its own namespace to prevent interference
- **Embedded Instructions**: Role instructions are compiled into the binary rather than loaded from disk at runtime
- **Stateless CLI**: Each CLI invocation is independent, session state is managed through tmux and filesystem

### Communication Protocol
- Messages between roles use file-based communication via `.ccteam/<session_name>/messages/` directory
- Each role has a prefix: `[MANAGER]`, `[LEADER]`, `[WORKER]`
- Messages are sent using the CLI's `agent send` command, NOT direct tmux commands
- Message files must follow naming pattern: `{sender}-to-{receiver}-{id}.md`
- Each session maintains its own isolated message directory to prevent interference

### Code Patterns

**Command Structure**:
- Commands are implemented in `src/cmd/{command-name}/index.ts`
- All commands are async functions with typed parameters
- Commands can import and reuse other commands (e.g. `start` uses `send`)

**Error Handling**:
- Early validation with clear error messages
- File existence checks before operations
- Automatic directory creation with `{ recursive: true }`
- Throws errors for upper-level handling (no process.exit in library code)
- Custom `CCTeamError` class in `src/lib/error.ts` for consistent error handling
- Error display uses chalk.red and includes helpful suggestions when possible

**Logging Convention**:
- Use `[INFO]` prefix for all console logs with chalk.blue
- Progress messages use ora spinners
- Decorative completion messages with boxen for important output

**Configuration System**:
- Configuration files use YAML format with Zod validation
- `loadConfig()` function handles file reading and parsing with error checking
- CLI flags override configuration file settings when provided
- Explicitly specified config files (via --config) must exist or an error is thrown
- Default configuration logic is handled in the `start` command for better separation of concerns
- File overwrite protection prevents accidental configuration loss

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
- **Runtime**: Bun (direct TypeScript execution)
- **Language**: TypeScript with ESNext target and strict mode
- **Module Resolution**: Bundler mode with `.ts` import extensions allowed
- **Code Quality**: Biome for formatting/linting with pre-commit hooks
- **CLI Framework**: Commander.js
- **Build Process**: Bun.build API with external packages and node target
- **Release Management**: Release Please for automated releases
- **Testing Framework**: Bun's built-in test runner with `.spec.ts` files
- **CI/CD**: GitHub Actions with lint and build jobs
- **Styling**: chalk (colors), ora (spinners), boxen (boxes)

### Important Constraints
- Never use `tmux send-keys` directly - always use `bun run ./src/main.ts agent send --from <role> --to <role>` or `npx ccteam@latest agent send --from <role> --to <role>`
- Never use `rm` to delete message files - always use `bun run ./src/main.ts agent messages delete` or `npx ccteam@latest agent messages delete`
- Tmux operations must use the `tmux()` wrapper in `lib/tmux.ts`
- All role instructions are embedded in the binary from `src/instructions/*.md`
- The `start` function requires a StartOptions object (not optional)
- Tmux installation is checked before starting sessions using `command-exists` package

## Project Structure
```
src/
├── main.ts              # CLI entry point
├── cmd/                 # Command implementations
│   ├── agent/           # Agent commands (send, messages)
│   ├── init/            # Configuration file creation command
│   └── start/           # Session initialization command
├── instructions/        # Role-specific instruction documents
├── lib/                 # Shared utilities
│   ├── config.ts        # Configuration loading and validation
│   ├── tmux.ts          # tmux command wrapper and installation check
│   └── util.ts          # General utilities (sleep, session management, etc.)
└── types/               # TypeScript type definitions
```

## Development Notes
- Pre-commit hooks run Biome formatting/linting via Husky and lint-staged
- TypeScript is not transpiled during development - Bun executes `.ts` files directly
- Session-specific directories (`.ccteam/<session_name>/`) are created at runtime in the working directory
- Build process creates a single bundled file at `dist/main.js` with external dependencies
- Test files should use `*.spec.ts` naming convention and be placed alongside implementation files
- Bun dependencies are installed with exact versions (configured in `bunfig.toml`)
- When publishing to npm, the build runs automatically via `prepublishOnly` hook
- Biome configuration enforces double quotes for JavaScript/TypeScript strings
- Tool configuration (allowed/disallowed tools) can be specified per role for enhanced security

## Testing Strategy
- Unit tests focus on individual utilities and configuration parsing
- Integration tests verify tmux operations and file-based communication
- Mock tmux commands using `bun:test` mock functionality for testing without tmux
- Test data uses temporary directories cleaned up after each test run

## Common Development Tasks

### Running and Testing During Development
```bash
# Run the CLI in development mode
bun run ./src/main.ts start

# Run with custom config during development
bun run ./src/main.ts start -c ./test-config.yml

# Run a single test file
bun test src/lib/config.spec.ts

# Run tests in watch mode
bun test --watch

# Test the built distribution
bun run build && node dist/main.js start
```

### Debugging Tips
- Check message files in `.ccteam/<session_name>/messages/` to debug communication issues
- Use `tmux list-sessions` to see active ccteam sessions
- Session logs can be viewed by attaching to tmux: `tmux attach -t ccteam-XXXXX`
- Message file naming must match pattern: `{sender}-to-{receiver}-{id}.md`

### Release Process
- Releases are automated via Release Please GitHub Action
- Commit messages should follow Conventional Commits format
- Version bumps and CHANGELOG updates are handled automatically
- NPM publishing occurs automatically on release creation