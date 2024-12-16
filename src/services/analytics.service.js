import geoip from "geoip-lite";
import { Analytics } from "../models/analytics.model.js";
import { Url } from "../models/url.model.js";
import {
  calculateUniqueClicks,
  getDeviceType,
  getOSType,
  groupByDate,
  groupByDevice,
  groupByOS,
} from "../utils/analytics/analytics.utils.js";

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

export const getAnalyticsByAlias = async (alias) => {
  const url = await Url.findOne({ customAlias: alias });

  if (!url) throw new Error(`No URL found for the alias ${alias}`);

  const analytics = await Analytics.find({ urlId: url._id });

  return {
    totalClicks: analytics.length,
    uniqueClicks: calculateUniqueClicks(analytics),
    clicksByDate: groupByDate(analytics, 7),
    osType: groupByOS(analytics),
    deviceType: groupByDevice(analytics),
  };
};

export const getAnalyticsByTopic = async (topic) => {
  const urls = await Url.find({ topic: topic });
  if (!urls) throw new Error(`No URLs found for the topic ${topic}`);

  const urlIds = urls.map((url) => url._id);

  const analytics = await Analytics.find({
    urlId: {
      $in: { urlIds },
    },
  });

  const clicksByUrl = urls.map((url) => {
    const urlAnalytics = analytics.filter(
      (entry) => entry.urlId.toString() === url._id.toString()
    );
    return {
      shortUrl: url.shortUrl,
      totalClicks: urlAnalytics.length,
      uniqueClicks: calculateUniqueClicks(urlAnalytics),
    };
  });

  return {
    totalClicks: analytics.length,
    uniqueClicks: calculateUniqueClicks(analytics),
    clicksByDate: groupByDate(analytics, 7),
    urls: clicksByUrl,
  };
};

export const getOverallAnalytics = async (userId) => {
  const urls = await Url.find({ userId });
  if (!urls.length) return { totalUrls: 0, totalClicks: 0, uniqueClicks: 0 };

  const urlIds = urls.map((url) => url._id);
  const analytics = await Analytics.find({
    urlId: {
      $in: urlIds,
    },
  });

  return {
    totalUrls: urls.length,
    totalClicks: analytics.length,
    uniqueClicks: calculateUniqueClicks(analytics),
    clicksByDate: groupByDate(analytics, 7),
    osType: groupByOS(analytics),
    deviceType: groupByDevice(analytics),
  };
};
