import { createClient } from "redis";

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || "redis",
    port: process.env.REDIS_PORT || 6379,
  },
});

redisClient.on("error", (err) => console.error("Redist Client Error: ", err));

(async () => {
  await redisClient.connect();
})();

export default redisClient;
