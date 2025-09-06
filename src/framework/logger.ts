type LogFn = (...args: unknown[]) => void;

const prefix = "[DanBot]";
const isDev = process.env.NODE_ENV === "development";

const methodMap: Record<
	"log" | "warn" | "error",
	(...args: unknown[]) => void
> = {
	log: console.log.bind(console),
	warn: console.warn.bind(console),
	error: console.error.bind(console),
};

const base =
	(method: "log" | "warn" | "error"): LogFn =>
	(...args: unknown[]) => {
		methodMap[method](prefix, ...args);
	};

const debug: LogFn = (...args) => {
	if (!isDev) return;
	methodMap.log(prefix, ...args);
};

const info = base("log");
const warn = base("warn");
const error = base("error");

export const logger = {
	debug,
	info,
	warn,
	error,
	child: (_?: Record<string, unknown>) => ({ debug, info, warn, error }),
};
