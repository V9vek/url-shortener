import { Router } from "express";
import { isUserAuthenticated } from "../middleware/auth.middleware.js";
import { rateLimiter } from "../middleware/rateLimit.middleware.js";
import {
  redirectToOriginalUrl,
  shortenUrl,
} from "../controllers/url/url.controller.js";
import { trackAnalytics } from "../middleware/analytics.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/shorten:
 *   post:
 *     summary: "Create a short URL"
 *     description: "This endpoint allows authenticated users to shorten a long URL. The request must include the long URL, an optional custom alias, and an optional topic."
 *     security:
 *       - sessionCookie: []  # Requires session-based authentication
 *     tags:
 *       - Shorten Url
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               longUrl:
 *                 type: string
 *                 description: "The long URL to be shortened."
 *               customAlias:
 *                 type: string
 *                 description: "The custom alias for the shortened URL (optional)."
 *               topic:
 *                 type: string
 *                 description: "The topic or category of the URL (optional)."
 *             required:
 *               - longUrl
 *     responses:
 *       201:
 *         description: "Short URL created successfully."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shortUrl:
 *                   type: string
 *                   description: "The newly created short URL."
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: "Timestamp when the short URL was created."
 *       400:
 *         description: "Bad Request. The body did not meet the validation requirements."
 *       401:
 *         description: "Unauthorized. The user must be authenticated."
 *       500:
 *         description: "Internal Server Error. Failed to create short URL."
 */
router.post("/shorten", isUserAuthenticated, rateLimiter, shortenUrl);

/**
 * @swagger
 * /api/shorten/{alias}:
 *   get:
 *     summary: "Redirect to the original URL"
 *     description: "This endpoint retrieves the original URL for a given alias. If the alias is found, the client will be redirected to the corresponding long URL with a 301 status code.
 *       If the alias is not found, it will return a 404 error indicating that the alias does not exist."
 *     parameters:
 *       - name: alias
 *         in: path
 *         required: true
 *         description: "The alias of the short URL."
 *         schema:
 *           type: string
 *     security: []
 *     tags:
 *       - Shorten Url
 *     responses:
 *       301:
 *         description: "Redirected to the original long URL."
 *       404:
 *         description: "Not Found. The alias does not exist."
 *       500:
 *         description: "Internal Server Error. Failed to fetch the original URL."
 */
router.get("/shorten/:alias", trackAnalytics, redirectToOriginalUrl);

export default router;
