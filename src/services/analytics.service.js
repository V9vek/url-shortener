import geoip from "geoip-lite";
import { Analytics } from "../models/analytics.model.js";
import { Url } from "../models/url.model.js";
import { getDeviceType, getOSType } from "../utils/analytics/getDeviceType.js";

export const logAnalytics = async (alias, userAgent, ip) => {
  try {
    // if alias exist or not
    const shortUrl = await Url.findOne({ customAlias: alias });
    if (!shortUrl) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found",
      });
    }

    // Geolocation data from IP
    const geo = geoip.lookup(ip) || {};
    const geolocation = {
      country: geo.country || "unknown",
      region: geo.region || "unknown",
      city: geo.city || "unknown",
    };

    const osType = getOSType(userAgent);

    const deviceType = getDeviceType(userAgent);

    // Check if an entry already exists for the same user (deduplication logic)
    const existingAnalytics = await Analytics.findOne({
      urlId: shortUrl._id,
      ip,
      osType,
      deviceType,
    });

    if (!existingAnalytics) {
      const analyticsEntry = new Analytics({
        urlId: shortUrl._id,
        timestamp: new Date(),
        ip,
        userAgent,
        osType,
        deviceType,
        geolocation,
      });

      await Analytics.create(analyticsEntry);
    }
  } catch (error) {
    console.error("Error saving analytics data: ", error);
  }
};
