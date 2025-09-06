import { env } from "@/env";
import axios from "axios";
import { Redis } from "ioredis";
import { z } from "zod";

const redis = new Redis(env.REDIS_URL);

const eventListSchema = z.object({
	pagination: z
		.object({
			continuation: z.string().nullish(),
			has_more_items: z.boolean().nullish(),
		})
		.nullish(),
	events: z.array(
		z.object({
			name: z.object({
				text: z.string(),
			}),
			id: z.string(),
		}),
	),
});

export async function getEventsList(redisKey = "seen_events") {
	// We only want events that are in the future - Otherwise we'll get thousands of irrelevant past events!
	const params = new URLSearchParams({
		status: "live",
	});

	const rawEvents = await axios.get(
		`https://www.eventbriteapi.com/v3/organizers/15241684138/events?${params.toString()}`,
		{
			headers: {
				Authorization: `Bearer ${env.EVENTBRITE_API_TOKEN}`,
			},
		},
	);

	// Parsing isn't *necessary*, but it keeps the data type-safe - If we get something we don't expect,
	// I'd rather it crash during parsing and tell me the reason rather than cryptic undefined error.
	const eventsData = eventListSchema.parse(rawEvents.data);

	// Seed results with first page
	const results = [...eventsData.events];

	// Results are paginated - Continuously grab more results until we've got a list of all future events across all pages
	// TODO: This would be miles better with a sprinkle of ✨recursion✨. Make it tidier, future Dan.
	let token = eventsData.pagination?.continuation;

	while (token) {
		const nextData = await axios.get(
			`https://www.eventbriteapi.com/v3/organizers/15241684138/events?continuation=${token}&${params.toString()}`,
			{
				headers: {
					Authorization: `Bearer ${env.EVENTBRITE_API_TOKEN}`,
				},
			},
		);

		const nextEventsData = eventListSchema.parse(nextData.data);


		token = nextEventsData.pagination?.has_more_items
			? nextEventsData.pagination?.continuation
			: undefined;

		results.push(...nextEventsData.events);
	}

	// Get the list of existing events from Redis
	const existingEvents = await redis.smembers(redisKey);

	// Filter the list of events to those that don't already exist in the Redis set
	const uniqueEvents = results.filter(
		(event) =>
			!existingEvents.find((existingEvent) => existingEvent === event.id),
	);

	// Add the new list of unique events into the Redis set so they aren't returned next time (if we actually have any)
	if (uniqueEvents.length > 0) {
		await redis.sadd(
			redisKey,
			uniqueEvents.map((event) => event.id),
		);
	}

	return uniqueEvents;
}

export async function getDailyEventsList() {
	return getEventsList("daily_seen_events");
}
