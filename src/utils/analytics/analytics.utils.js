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
const groupByDate = (analytics, recentDays) => {
  const dates = getDatesInLastNDays(recentDays);
  const clicksByDate = dates.map((date) => ({
    date,
    clicks: analytics.filter((entry) =>
      entry.timestamp.toISOString().startsWith(date)
    ).length,
  }));
  return clicksByDate;
};

// Analytics by OS
const groupByOS = (analytics) => {
  const osData = {};
  analytics.forEach(({ osType, ip }) => {
    if (!osData[osType])
      osData[osType] = { uniqueUsers: new Set(), uniqueClicks: 0 };
    osData[osType].uniqueUsers.add(ip);
    osData[osType].uniqueClicks += 1;
  });

  return Object.entries(osData).map(([osName, data]) => ({
    osName,
    uniqueClicks: data.uniqueClicks,
    uniqueUsers: data.uniqueUsers.size,
  }));
};

// Analytics by Device Type
const groupByDevice = (analytics) => {
  const deviceData = {};
  analytics.forEach(({ deviceType, ip }) => {
    if (!deviceData[deviceType])
      deviceData[deviceType] = { uniqueUsers: new Set(), uniqueClicks: 0 };
    deviceData[deviceType].uniqueUsers.add(ip);
    deviceData[deviceType].uniqueClicks += 1;
  });

  return Object.entries(deviceData).map(([deviceName, data]) => ({
    deviceName,
    uniqueClicks: data.uniqueClicks,
    uniqueUsers: data.uniqueUsers.size,
  }));
};

export {
  getOSType,
  getDeviceType,
  calculateUniqueClicks,
  groupByDate,
  groupByDevice,
  groupByOS,
};
