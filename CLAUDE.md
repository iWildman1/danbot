# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Package Manager**: PNPM 10.11.0

**Development Commands**:
- `pnpm start` - Run the application using ts-node from TypeScript source
- `pnpm build` - Build using esbuild (outputs to dist/index.js)
- `pnpm lint` - Lint code using Biome
- `pnpm format` - Format code using Biome
- `pnpm check` - Run Biome check with write mode (combines linting and formatting)

**Note**: No test framework is currently set up (`pnpm test` returns error).

## Architecture

**DanBot** is a TypeScript Discord bot that monitors Waterstones events via Eventbrite API and sends Discord notifications. It runs as a cron job every 15 minutes between 7am-10pm.

**Core Components**:
- **Main entry**: `src/index.ts` - Discord client setup and cron scheduling
- **Event service**: `src/events.ts` - Eventbrite API integration and event processing
- **Environment**: `src/env.ts` - Zod-validated environment variables

**Key Architecture Patterns**:
- Event-driven cron job scheduler with Discord.js v14
- Redis caching to prevent duplicate notifications
- Paginated API fetching with automatic handling
- Type-safe environment validation using Zod
- Message chunking for Discord's character limits (1500 chars)

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
EVENTBRITE_API_TOKEN     # Eventbrite API access
DISCORD_APPLICATION_ID   # Discord application ID
DISCORD_PUBLIC_KEY       # Discord public key
DISCORD_TOKEN           # Discord bot token
DISCORD_CHANNEL         # Target Discord channel ID
DISCORD_TAG_ID          # Discord user ID to tag in notifications
REDIS_URL               # Redis connection string
```

## Development Setup

- Use `docker-compose up` to start Redis locally (port 6379)
- Environment variables loaded via dotenv
- Use `pnpm start` for development with ts-node
- Code style: tabs, double quotes, organized imports

## Build & Deployment

- **Local build**: `pnpm build` creates minified bundle in dist/
- **Docker**: Multi-stage Dockerfile with Node.js 22 Alpine
- **CI/CD**: GitHub Actions builds and pushes to ghcr.io on main branch
- **Production**: Containerized with Redis included

## Application Behavior

- Polls Eventbrite API for Waterstones organizer events
- Filters for live/future events only
- Handles API pagination automatically
- Uses Redis to track seen events and prevent duplicates
- Splits long Discord messages into chunks
- Runs every 15 minutes during active hours (7am-10pm)