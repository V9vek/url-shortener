import { Router } from "express";
import { isUserAuthenticated } from "../middleware/auth.middleware.js";
import {
  getAnalyticsByAlias,
  getAnalyticsByTopic,
  getOverallAnalytics,
} from "../controllers/analytics/analytics.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 */

/**
 * @swagger
 * /api/analytics/overall:
 *   get:
 *     summary: Get overall analytics for a user
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched overall analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUrls:
 *                   type: integer
 *                   description: The total number of URLs for the user
 *                 totalClicks:
 *                   type: integer
 *                   description: The total number of clicks across all URLs
 *                 uniqueClicks:
 *                   type: integer
 *                   description: The total number of unique clicks across all URLs
 *                 clicksByDate:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         description: The date of the clicks
 *                       clicks:
 *                         type: integer
 *                         description: The number of clicks on that date
 *                 osType:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       osName:
 *                         type: string
 *                         description: The OS type (e.g., Windows, MacOS)
 *                       uniqueUsers:
 *                         type: integer
 *                         description: The number of unique users for that OS
 *                       uniqueClicks:
 *                         type: integer
 *                         description: The total clicks from that OS
 *                 deviceType:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       deviceName:
 *                         type: string
 *                         description: The device type (e.g., mobile, desktop)
 *                       uniqueUsers:
 *                         type: integer
 *                         description: The number of unique users for that device
 *                       uniqueClicks:
 *                         type: integer
 *                         description: The total clicks from that device
 *       401:
 *         description: Unauthorized access, user must be authenticated
 *       500:
 *         description: Internal server error
 */
router.get("/overall", isUserAuthenticated, getOverallAnalytics);

/**
 * @swagger
 * /api/analytics/{alias}:
 *   get:
 *     summary: Get analytics data for a specific URL alias
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: alias
 *         in: path
 *         required: true
 *         description: The custom alias of the URL
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched analytics for the alias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalClicks:
 *                   type: integer
 *                   description: The total number of clicks for the alias
 *                 uniqueClicks:
 *                   type: integer
 *                   description: The total number of unique clicks for the alias
 *                 clicksByDate:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         description: The date of the clicks
 *                       clicks:
 *                         type: integer
 *                         description: The number of clicks on that date
 *                 osType:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       osName:
 *                         type: string
 *                         description: The OS type for the alias
 *                       uniqueUsers:
 *                         type: integer
 *                         description: The number of unique users for that OS
 *                       uniqueClicks:
 *                         type: integer
 *                         description: The total clicks from that OS
 *                 deviceType:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       deviceName:
 *                         type: string
 *                         description: The device type for the alias
 *                       uniqueUsers:
 *                         type: integer
 *                         description: The number of unique users for that device
 *                       uniqueClicks:
 *                         type: integer
 *                         description: The total clicks from that device
 *       404:
 *         description: No URL found for the alias
 *       401:
 *         description: Unauthorized access, user must be authenticated
 *       500:
 *         description: Internal server error
 */

router.get("/:alias", isUserAuthenticated, getAnalyticsByAlias);

/**
 * @swagger
 * /api/analytics/topic/{topic}:
 *   get:
 *     summary: Get analytics data for all URLs in a specific topic
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: topic
 *         in: path
 *         required: true
 *         description: The topic to filter the URLs by
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched analytics for the topic
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalClicks:
 *                   type: integer
 *                   description: The total number of clicks across all URLs in the topic
 *                 uniqueClicks:
 *                   type: integer
 *                   description: The total number of unique clicks across all URLs in the topic
 *                 clicksByDate:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         description: The date of the clicks
 *                       clicks:
 *                         type: integer
 *                         description: The number of clicks on that date
 *                 urls:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       shortUrl:
 *                         type: string
 *                         description: The shortened URL
 *                       totalClicks:
 *                         type: integer
 *                         description: The total number of clicks for the URL
 *                       uniqueClicks:
 *                         type: integer
 *                         description: The total number of unique clicks for the URL
 *       404:
 *         description: No URLs found for the topic
 *       401:
 *         description: Unauthorized access, user must be authenticated
 *       500:
 *         description: Internal server error
 */
router.get("/topic/:topic", isUserAuthenticated, getAnalyticsByTopic);

export default router;
