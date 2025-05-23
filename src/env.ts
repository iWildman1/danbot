import { z } from "zod";
import "dotenv/config";

const schema = z.object({
	EVENTBRITE_API_TOKEN: z.string(),
	DISCORD_APPLICATION_ID: z.string(),
	DISCORD_PUBLIC_KEY: z.string(),
	DISCORD_TOKEN: z.string(),
	DISCORD_CHANNEL: z.string(),
	DISCORD_TAG_ID: z.string(),
	REDIS_URL: z.string(),
});

// Type-safe environment variables
const getEnv = () => schema.parse(process.env);

export const env = getEnv();
