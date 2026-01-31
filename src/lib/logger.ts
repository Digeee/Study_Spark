type Level = "debug" | "info" | "warn" | "error";

let buffer: { level: Level; message: string; time: number; meta?: unknown }[] = [];

function write(level: Level, message: string, meta?: unknown) {
  const entry = { level, message, time: Date.now(), meta };
  buffer.push(entry);
  if (buffer.length > 200) buffer = buffer.slice(-200);
  const tag = `[StudySpark:${level}]`;
  if (level === "debug") console.debug(tag, message, meta ?? "");
  else if (level === "info") console.info(tag, message, meta ?? "");
  else if (level === "warn") console.warn(tag, message, meta ?? "");
  else console.error(tag, message, meta ?? "");
}

export const logger = {
  debug: (m: string, meta?: unknown) => write("debug", m, meta),
  info: (m: string, meta?: unknown) => write("info", m, meta),
  warn: (m: string, meta?: unknown) => write("warn", m, meta),
  error: (m: string, meta?: unknown) => write("error", m, meta),
  getLogs: () => buffer.slice(),
  clear: () => {
    buffer = [];
  },
};