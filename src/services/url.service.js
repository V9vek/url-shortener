import redisClient from "../db/redisClient.js";
import { Url } from "../models/url.model.js";
import { generateShortUrl } from "../utils/url/shortUrlGenerator.js";

export const createShortUrl = async (longUrl, customAlias, topic, userId) => {
  // if custom alias already exist
  if (customAlias) {
    const existingUrl = await Url.findOne({ customAlias });
    if (existingUrl) {
      throw new Error("Custom alias is already in use.");
    }
  } else {
    customAlias = generateShortUrl();
  }

  const shortUrl = "short_url/" + customAlias;
  console.log("service: ", shortUrl);

  const url = await Url.create({
    longUrl,
    shortUrl,
    customAlias,
    topic,
    userId,
  });

  return url;
};

export const getOriginalUrl = async (alias) => {
  // Check Redis cache first
  const cachedUrl = await redisClient.get(`short_url:${alias}`);
  if (cachedUrl) return cachedUrl;

  // Query the database if not in cache
  const urlDoc = await Url.findOne({ customAlias: alias });

  if (urlDoc) {
    // Cache the result for future use
    await redisClient.set(`short_url:${alias}`, urlDoc.longUrl, { EX: 3600 });  // 1hr expiry
    return urlDoc.longUrl;
  }

  return null
};
