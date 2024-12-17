import geoip from "geoip-lite";
import { Analytics } from "../models/analytics.model.js";
import { Url } from "../models/url.model.js";
import {
  getDeviceType,
  getOSType,
  groupByDate,
  groupByDevice,
  groupByOS,
} from "../utils/analytics/analytics.utils.js";
import { getFromCache, setInCache } from "../utils/cache/cache.utils.js";

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
  } catch (error) {
    console.error("Error saving analytics data: ", error);
  }
};

export const getAnalyticsByAlias = async (alias) => {
  const cachedAnalytics = await getFromCache(`analytics:${alias}`);
  if (cachedAnalytics) return JSON.parse(cachedAnalytics);

  const url = await Url.findOne({ customAlias: alias });

  if (!url) throw new Error(`No URL found for the alias ${alias}`);

  const totalClicks = await Analytics.countDocuments({ urlId: url._id });
  const uniqueClicks = await Analytics.distinct("ip", { urlId: url._id }).then(
    (ips) => ips.length
  );
  const clicksByDate = await groupByDate(url._id);
  const osType = await groupByOS(url._id);
  const deviceType = await groupByDevice(url._id);

  const analyticsData = {
    totalClicks: totalClicks,
    uniqueClicks,
    clicksByDate,
    osType,
    deviceType,
  };

  // cache the analytics
  await setInCache(`analytics:${alias}`, JSON.stringify(analyticsData));

  return analyticsData;
};

export const getAnalyticsByTopic = async (topic) => {
  const cachedAnalytics = await getFromCache(`analytics:${topic}`);
  if (cachedAnalytics) return JSON.parse(cachedAnalytics);

  const urls = await Url.find({ topic: topic });
  if (!urls) throw new Error(`No URLs found for the topic ${topic}`);

  const urlIds = urls.map((url) => url._id);

  // combined multiple aggregation pipelines
  const analytics = await Analytics.aggregate([
    {
      $match: {
        urlId: { $in: urlIds },
      },
    },
    {
      $facet: {
        totalClicks: [{ $count: "count" }],
        uniqueClicks: [{ $group: { _id: "$ip" } }, { $count: "count" }],
        clicksByDate: [
          {
            $match: {
              timestamp: {
                $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
              },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
        clicksByUrl: [
          {
            $group: {
              _id: "$urlId",
              totalClicks: { $sum: 1 },
              uniqueClicks: { $addToSet: "$ip" },
            },
          },
          {
            $project: {
              urlId: "$_id",
              totalClicks: 1,
              uniqueClicks: { $size: "$uniqueClicks" },
            },
          },
        ],
      },
    },
  ]);

  const [result] = analytics;

  const clicksByUrl = urls.map((url) => {
    const urlAnalytics = result.clicksByUrl.find((entry) =>
      entry.urlId.equals(url._id)
    );
    return {
      shortUrl: url.shortUrl,
      totalClicks: urlAnalytics?.totalClicks || 0,
      uniqueClicks: urlAnalytics?.uniqueClicks || 0,
    };
  });

  const analyticsData = {
    totalClicks: result.totalClicks[0]?.count || 0,
    uniqueClicks: result.uniqueClicks[0]?.count || 0,
    clicksByDate: result.clicksByDate.map((entry) => ({
      date: entry._id,
      clicks: entry.count,
    })),
    urls: clicksByUrl,
  };

  // cache the analytics
  await setInCache(`analytics:${topic}`, JSON.stringify(analyticsData));

  return analyticsData;
};

export const getOverallAnalytics = async (userId) => {
  const cachedAnalytics = await getFromCache(`analytics:overall`);
  if (cachedAnalytics) return JSON.parse(cachedAnalytics);

  const urls = await Url.find({ userId });
  if (!urls.length) return { totalUrls: 0, totalClicks: 0, uniqueClicks: 0 };

  const urlIds = urls.map((url) => url._id);

  // combined multiple aggregation pipelines
  const analytics = await Analytics.aggregate([
    { $match: { urlId: { $in: urlIds } } },
    {
      $facet: {
        totalClicks: [{ $count: "count" }],
        uniqueClicks: [{ $group: { _id: "$ip" } }, { $count: "count" }],
        clicksByDate: [
          {
            $match: {
              timestamp: {
                $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
              },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
        // OS Type Analytics
        osType: [
          {
            $group: {
              _id: "$osType",
              uniqueIps: { $addToSet: "$ip" },
              totalClicks: { $sum: 1 },
            },
          },
          {
            $project: {
              osName: "$_id",
              uniqueUsers: { $size: "$uniqueIps" },
              uniqueClicks: "$totalClicks",
              _id: 0,
            },
          },
        ],
        // Device Type Analytics
        deviceType: [
          {
            $group: {
              _id: "$deviceType",
              uniqueIps: { $addToSet: "$ip" },
              totalClicks: { $sum: 1 },
            },
          },
          {
            $project: {
              deviceName: "$_id",
              uniqueUsers: { $size: "$uniqueIps" },
              uniqueClicks: "$totalClicks",
              _id: 0,
            },
          },
        ],
      },
    },
  ]);

  const [result] = analytics;

  const analyticsData = {
    totalUrls: urls.length,
    totalClicks: result.totalClicks[0]?.count || 0,
    uniqueClicks: result.uniqueClicks[0]?.count || 0,
    clicksByDate: result.clicksByDate.map((entry) => ({
      date: entry._id,
      clicks: entry.count,
    })),
    osType: result.osType,
    deviceType: result.deviceType,
  };

  // cache the analytics
  await setInCache(`analytics:overall`, JSON.stringify(analyticsData));

  return analyticsData;
};
