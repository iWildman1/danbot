# DanBot Future Ideas

This is a brain-dump of potential future ideas for other features that could be built into DanBot. They're of various usefulness and feasability - Some of these ideas might actually be good, and some are purely there because I want to try something.

Fair to assume that nothing on this list is set in stone, but is just something that's popped into my head at some point that I've put here to make sure I don't forget.

- **Testing/Development Setup** - At the moment, there's no practical way for me to build new features without hitting production endpoints. I'd like a way to be able to run the app in a "development mode" that doesn't mean manually grabbing IDs/changing things everything every time.
  - Maybe an environment variable, e.g. `MODE="development"`?
  - Running in development mode could add limits to the query so only events from the last week are included
  - An optional flag could be included to skip the Redis cache
    - I don't want to destroy the cache on every run because I still want to be able to test that the caching works before deploying
- **Ticket Actions** - DanBot sends the name of the event and nothing else. It would be more useful for the message to contain a "Get Tickets" button that links to the Eventbrite page for the event.
  - This shouldn't be difficult to implement at all because we already have the event ID in the API response
- **Scheduler (My Events)** - As well as a link to get tickets, it could be helpful to have an "Add to My Events" button that puts events into a personal calendar. DanBot can then have commands to list your calendar, with options to remove individual events.
  - This would need a database that it doesn't already have - We're using Redis to track seen events, but it might be better to switch to SQLite/MySQL and use Prisma instead at this point
    - Every time an event is seen, it could be added to an `Events` table with at least a unique external ID column.
    - To determine if an event has been seen before, search by the external ID. If nothing is found, the event is new and can be added/returned.
  - A `ScheduleEvent` table can also exist, which each column representing an event that is in a users schedule. Each column has the ID of the event, and the ID of the users Discord ID (which we get from the incoming message). Basically a pivot table without the user being in our database.
  - Retrieving a schedule can be command against the bot, which detects the ID of the user who sent the command and fetch the events linked to their schedule.
- **Reminders** - This links to the schedule above. We can remind users above events in their schedule at a set time window before the event (e.g. 24h). This needs some thought as to what period of time is actually useful
  - Could be fixed to 48h, and enabled/disabled by command? That could slow the notification spam without the complexity of user-defined reminder windows
- **System Ops Panel** - A frontend app that has the ability to override/control most functionality of the bot. This could include:
  - Viewing all connected servers (guilds) and users
  - Revoking access to individual servers
  - Override user settings (e.g. notifications)
  - View, edit and delete events in the system
  - View sync stats
    - Logs
    - Run length
    - Last time ran
  - Enable/Disable sync
  - Alter sync cron schedule
