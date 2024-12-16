import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redisClient from "../db/redisClient.js";

export const rateLimiter = rateLimit({
  window: 1 * 60 * 1000,    // 1 min
  max: 10,                  // 10 request per 1 min
  keyGenerator: (req) => req.user?.id || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: async (command, ...args) => {
      return redisClient.sendCommand([command, ...args]);
    },
  }),
  message: "Too many requests, please try again later.",
});
