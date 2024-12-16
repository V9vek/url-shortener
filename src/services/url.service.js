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
    customAlias = generateShortUrl()
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
