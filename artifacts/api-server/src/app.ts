import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import router from "./routes/index.js";
import { handleStripeWebhook } from "./routes/stripe.js";

const app: Express = express();

const allowedOrigins = [
  /^https?:\/\/localhost(:\d+)?$/,
  /\.replit\.dev$/,
  /\.repl\.co$/,
  /\.worf\.replit\.dev$/,
  /\.replit\.app$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = allowedOrigins.some((pattern) =>
        typeof pattern === "string" ? pattern === origin : pattern.test(origin)
      );
      if (allowed) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  })
);

app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    (req as any).rawBody = req.body;
    await handleStripeWebhook(req, res);
  }
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
