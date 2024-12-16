import { Router } from "express";
import { isUserAuthenticated } from "../middleware/auth.middleware.js";
import { rateLimiter } from "../middleware/rateLimit.middleware.js";
import { redirectToOriginalUrl, shortenUrl } from "../controllers/url/url.controller.js";
import { trackAnalytics } from "../middleware/analytics.middleware.js";

const router = Router();

router.post("/shorten", isUserAuthenticated, rateLimiter, shortenUrl);
router.get("/shorten/:alias", trackAnalytics, redirectToOriginalUrl);

export default router;
