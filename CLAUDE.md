# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Package Manager**: PNPM 10.11.0

**Development Commands**:
- `pnpm start` - Run the application using ts-node from TypeScript source
- `pnpm dev` - Run in development mode (logs notifications instead of sending)
- `pnpm build` - Build using esbuild (outputs to dist/index.js)
- `pnpm lint` - Lint code using Biome
- `pnpm format` - Format code using Biome
- `pnpm check` - Run Biome check with write mode (combines linting and formatting)

**Note**: No test framework is currently set up (`pnpm test` returns error).

## Architecture

**DanBot** is a TypeScript Discord bot that monitors Waterstones events via Eventbrite API and sends Discord notifications. It runs as a cron job every 15 minutes between 7am-10pm and includes slash commands for user interaction.

**Core Components**:
- **Main entry**: `src/index.ts` - Discord client setup, cron scheduling, and command system integration
- **Event service**: `src/services/events.ts` - Eventbrite API integration and event processing
- **Environment**: `src/env.ts` - Zod-validated environment variables
- **Discord service**: `src/services/discord.ts` - Discord client creation, channel management, and slash command registration
- **Scanner service**: `src/services/scanner.ts` - Event scanning orchestration for both instant and daily notifications
- **Role management**: `src/services/role-manager.ts` - User role assignment and preference handling
- **Messaging utilities**: `src/utils/messaging.ts` - Message chunking and notification sending
- **Command system**: Extensible command architecture with registry pattern
  - `src/types/commands.ts` - Command interface and type definitions
  - `src/commands/registry.ts` - Command registration and lookup functions
  - `src/commands/router.ts` - Interaction routing and error handling
  - `src/commands/get-instant-alerts.ts` - Instant notification command implementation
  - `src/commands/get-daily-alerts.ts` - Daily notification command implementation

**Key Architecture Patterns**:
- **Dual notification system**: Supports both instant (15-minute intervals) and daily notifications (7pm daily)
- Event-driven cron job scheduler with Discord.js v14
- **Extensible command system**: Registry pattern with functional approach
  - Commands are objects with `data`, `execute`, `canHandle`, and `handleInteraction` methods
  - Self-contained command files that register themselves via `registerCommand()`
  - Type-safe routing with early returns and proper error handling
  - Manual command registration (no auto-discovery) for predictable control
- Role-based user preference management (notifications vs access-only) for both notification types
- Redis caching to prevent duplicate notifications
- Paginated API fetching with automatic handling
- Type-safe environment validation using Zod
- Message chunking for Discord's character limits (1500 chars)
- Development mode logging instead of Discord posting

## Technology Stack

- **Runtime**: Node.js 22, TypeScript 4.9.5 (ES2016, CommonJS)
- **Discord**: discord.js v14.11.0 with Guild intents
- **Scheduling**: cron v2.3.1
- **HTTP**: axios v1.3.4 for Eventbrite API
- **Caching**: ioredis v5.3.2 for Redis
- **Validation**: zod v3.20.6 for runtime type checking
- **Build**: esbuild v0.20.0 for fast bundling
- **Code Quality**: Biome v1.5.3 (replaces ESLint/Prettier)

## Required Environment Variables

```
NODE_ENV                           # development | production (default: production)
EVENTBRITE_API_TOKEN              # Eventbrite API access
DISCORD_APPLICATION_ID            # Discord application ID
DISCORD_PUBLIC_KEY                # Discord public key
DISCORD_TOKEN                     # Discord bot token
DISCORD_CHANNEL                   # Legacy target Discord channel ID
DISCORD_TAG_ID                    # Legacy Discord user ID to tag
INSTANT_NOTIFICATIONS_ROLE_ID     # Role ID for users wanting instant notifications
INSTANT_ACCESS_ROLE_ID            # Role ID for users wanting instant access only
INSTANT_NOTIFICATIONS_CHANNEL_ID  # Channel ID for instant event notifications
DAILY_NOTIFICATIONS_ROLE_ID       # Role ID for users wanting daily notifications
DAILY_ACCESS_ROLE_ID              # Role ID for users wanting daily access only
DAILY_NOTIFICATIONS_CHANNEL_ID    # Channel ID for daily event notifications
GENERAL_CHANNEL_ID                # General channel ID
REDIS_URL                         # Redis connection string
```

## Development Setup

- Use `docker-compose up` to start Redis locally (port 6379)
- Environment variables loaded via dotenv
- Use `pnpm dev` for development mode (logs instead of Discord posting)
- Use `pnpm start` for production-like behavior with ts-node
- Code style: tabs, double quotes, organized imports
- TypeScript: Prefer type inference over explicit return types on functions

## Build & Deployment

- **Local build**: `pnpm build` creates minified bundle in dist/
- **Docker**: Multi-stage Dockerfile with Node.js 22 Alpine
- **CI/CD**: GitHub Actions builds and pushes to ghcr.io on main branch
- **Production**: Containerized with Redis included

## Application Behavior

**Event Monitoring**:
- Polls Eventbrite API for Waterstones organizer events
- Filters for live/future events only
- Handles API pagination automatically
- Uses Redis to track seen events and prevent duplicates
- Splits long Discord messages into chunks
- **Instant notifications**: Run every 15 minutes during active hours (7am-10pm)
- **Daily notifications**: Run once daily at 7pm
- Tags users with notification role in event announcements

**User Management**:
- `/get-instant-alerts` slash command allows users to join and set instant notification preferences
- `/get-daily-alerts` slash command allows users to join and set daily notification preferences
- Two role types for each notification system: notifications (get tagged) vs access-only (no tags)
- Interactive buttons for preference selection
- Automatic role switching when preferences change
- Role validation prevents duplicate assignments

## Command System Extension

**Adding New Commands**:
1. Create new file in `src/commands/` (e.g., `my-command.ts`)
2. Export a `Command` object with required methods:
   - `data`: SlashCommandBuilder with command definition
   - `execute`: Main command logic function
   - `canHandle`: (optional) Function to check if command handles a component interaction
   - `handleInteraction`: (optional) Function to handle button/component interactions
3. Call `registerCommand(command)` at file end
4. Import the file in `src/index.ts` to trigger registration (e.g., `import "@/commands/my-command"`)

**Command Structure**:
- Commands are self-contained objects, not classes
- Use functional programming patterns with type inference
- Component interactions (buttons) are handled within the same command that creates them
- Router automatically finds and calls the appropriate command handlers