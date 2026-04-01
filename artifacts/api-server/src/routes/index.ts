import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import landmarksRouter from "./landmarks.js";
import supportRouter from "./support.js";
import pushRouter from "./push.js";
import scheduledRouter from "./scheduled.js";
import stripeRouter from "./stripe.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(landmarksRouter);
router.use(supportRouter);
router.use(pushRouter);
router.use(scheduledRouter);
router.use(stripeRouter);

export default router;
