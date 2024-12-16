import { Analytics } from "../../models/analytics.model.js";

const getDatesInLastNDays = (n) => {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < n; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split("T")[0]); // Format: YYYY-MM-DD
  }

  return dates.reverse();
};

const getOSType = (userAgent) => {
  if (userAgent.includes("Windows")) return "Windows";
  if (userAgent.includes("Mac OS")) return "macOS";
  if (userAgent.includes("Linux")) return "Linux";
  if (userAgent.includes("Android")) return "Android";
  if (userAgent.includes("iPhone") || userAgent.includes("iPad")) return "iOS";
  return "Unknown";
};

const getDeviceType = (userAgent) => {
  if (/mobile|android|touch|webos|hpwos/i.test(userAgent)) return "Mobile";
  if (/tablet/i.test(userAgent)) return "Tablet";
  return "Desktop";
};

const calculateUniqueClicks = (analytics) => {
  const uniqueIps = new Set(analytics.map((entry) => entry.ip));
  return uniqueIps.size;
};

// Analytics group by date
const groupByDate = async (urlId) => {
  const date = new Date();
  date.setDate(date.getDate() - 7); // 7 days buffer

  const data = await Analytics.aggregate([
    {
      $match: {
        urlId,
        timestamp: { $gte: date },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
        },
        clicks: {
          $sum: 1,
        },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        date: "$_id",
        clicks: 1,
        _id: 0,
      },
    },
  ]);

  return data;
};

// Analytics group by OS
const groupByOS = async (urlId) => {
  const data = await Analytics.aggregate([
    { $match: { urlId } },
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
  ]);

  return data;
};

// Analytics by Device Type
const groupByDevice = async (urlId) => {
  const data = await Analytics.aggregate([
    { $match: { urlId } },
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
  ]);

  return data;
};

export {
  getOSType,
  getDeviceType,
  calculateUniqueClicks,
  groupByDate,
  groupByDevice,
  groupByOS,
};
