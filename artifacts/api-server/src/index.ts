import app from "./app";
import { runScheduledNotificationsJob } from "./routes/scheduled";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  startScheduler();
});

function startScheduler() {
  const INTERVAL_MS = 60_000;
  console.log("[Scheduler] Starting — checks every 60s");
  runScheduledNotificationsJob().catch((err: unknown) => {
    console.error("[Scheduler] Initial run failed:", err instanceof Error ? err.message : String(err));
  });
  setInterval(() => {
    runScheduledNotificationsJob().catch((err: unknown) => {
      console.error("[Scheduler] Interval run failed:", err instanceof Error ? err.message : String(err));
    });
  }, INTERVAL_MS);
}
