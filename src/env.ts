import { z } from "zod";
import "dotenv/config";

const schema = z.object({
	NODE_ENV: z.enum(["development", "production"]).default("production"),
	EVENTBRITE_API_TOKEN: z.string(),
	DISCORD_APPLICATION_ID: z.string(),
	DISCORD_PUBLIC_KEY: z.string(),
	DISCORD_TOKEN: z.string(),
	DISCORD_CHANNEL: z.string(),
	DISCORD_TAG_ID: z.string(),
	INSTANT_NOTIFICATIONS_ROLE_ID: z.string(),
	INSTANT_ACCESS_ROLE_ID: z.string(),
	INSTANT_NOTIFICATIONS_CHANNEL_ID: z.string(),
	GENERAL_CHANNEL_ID: z.string(),
	REDIS_URL: z.string(),
});

// Type-safe environment variables
const getEnv = () => schema.parse(process.env);

export const env = getEnv();
