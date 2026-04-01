const isProduction = process.env.NODE_ENV === "production";

type LogLevel = "info" | "warn" | "error" | "debug";

function log(level: LogLevel, obj: unknown, msg?: string) {
  const entry = typeof obj === "string" ? { msg: obj } : { ...(obj as object), msg };

  if (isProduction) {
    // Use explicit method calls to avoid dynamic property access flagged by SAST
    const line = JSON.stringify(entry);
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
  } else {
    const prefix = `[${level.toUpperCase()}]`;
    if (level === "error") {
      msg ? console.error(prefix, msg, obj) : console.error(prefix, obj);
    } else if (level === "warn") {
      msg ? console.warn(prefix, msg, obj) : console.warn(prefix, obj);
    } else {
      msg ? console.log(prefix, msg, obj) : console.log(prefix, obj);
    }
  }
}

export const logger = {
  info:  (obj: unknown, msg?: string) => log("info",  obj, msg),
  warn:  (obj: unknown, msg?: string) => log("warn",  obj, msg),
  error: (obj: unknown, msg?: string) => log("error", obj, msg),
  debug: (obj: unknown, msg?: string) => log("debug", obj, msg),
};
