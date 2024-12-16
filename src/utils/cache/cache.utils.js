import redisClient from "../../db/redisClient.js";

const setInCache = async (cacheKey, cacheValue) => {
  await redisClient.set(cacheKey, cacheValue, { EX: 1 * 60 * 60 }); // 1hr expiry
};

const getFromCache = async (cacheKey) => {
  return await redisClient.get(cacheKey);
};

const invalidateCache = async (cacheKey) => {
  await redisClient.del(cacheKey);
};

export { setInCache, getFromCache, invalidateCache };
