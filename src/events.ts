import axios from "axios";
import { Redis } from "ioredis";
import { z } from "zod";
import { env } from "./env";

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

type EventList = z.infer<typeof eventListSchema>;

export async function getEventsList() {
	const results: EventList["events"] = [];
	let token: string | undefined;

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

	// Results are paginated - Continuously grab more results until we've got a list of all future events across all pages
	// TODO: This would be miles better with a sprinkle of ✨recursion✨. Make it tidier, future Dan.
	if (
		eventsData.pagination?.has_more_items &&
		eventsData.pagination?.continuation
	) {
		token = eventsData.pagination.continuation;
	}

	for (const event of eventsData.events) {
		results.push(event);
	}

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

		if (
			nextEventsData.pagination?.has_more_items &&
			nextEventsData.pagination?.continuation
		) {
			token = nextEventsData.pagination.continuation;
		} else {
			token = undefined;
		}

		for (const event of nextEventsData.events) {
			results.push(event);
		}
	}

	// Get the list of existing events from Redis
	const existingEvents = await redis.smembers("seen_events");

	// Filter the list of events to those that don't already exist in the Redis set
	const uniqueEvents = results.filter(
		(event) =>
			!existingEvents.find((existingEvent) => existingEvent === event.id),
	);

	// Add the new list of unique events into the Redis set so they aren't returned next time (if we actually have any)
	if (uniqueEvents.length > 0) {
		await redis.sadd(
			"seen_events",
			uniqueEvents.map((event) => event.id),
		);
	}

	return uniqueEvents;
}
