const prefix = "[DanBot]";
const isDev = process.env.NODE_ENV === "development";

const log = (method: typeof console.log, ...args: unknown[]) => {
	method(prefix, ...args);
};

export const logger = {
	debug: (...args: unknown[]) => isDev && log(console.log, ...args),
	info: (...args: unknown[]) => log(console.log, ...args),
	warn: (...args: unknown[]) => log(console.warn, ...args),
	error: (...args: unknown[]) => log(console.error, ...args),
};
