import { Router } from "express";
import { isUserAuthenticated } from "../middleware/auth.middleware.js";
import { rateLimiter } from "../middleware/rateLimit.middleware.js";
import { shortenUrl } from "../controllers/url/url.controller.js";

const router = Router();

router.post("/shorten", isUserAuthenticated, rateLimiter, shortenUrl);

export default router;
