import { logAnalytics } from "../services/analytics.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const trackAnalytics = asyncHandler(async (req, res, next) => {
  const { alias } = req.params;
  const userAgent = req.get("User-Agent") || "unknown";
  const ip =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress || "unknown";

  try {
    // Log analytics asynchronously
    logAnalytics(alias, userAgent, ip);
  } catch (error) {
    console.error("Failed to log analytics", error);
  }

  // continue even if something fails, because the more priority is to get the longUrl
  next();
});
