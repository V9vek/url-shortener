import { Router } from "express";
import { isUserAuthenticated } from "../middleware/auth.middleware.js";
import {
  getAnalyticsByAlias,
  getAnalyticsByTopic,
  getOverallAnalytics,
} from "../controllers/analytics/analytics.controller.js";

const router = Router();

router.get("/overall", isUserAuthenticated, getOverallAnalytics);
router.get("/:alias", isUserAuthenticated, getAnalyticsByAlias);
router.get("/topic/:topic", isUserAuthenticated, getAnalyticsByTopic);

export default router;
