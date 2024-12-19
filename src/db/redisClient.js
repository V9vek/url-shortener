import { createClient } from "redis";

const redisClient = createClient({
  // socket: {
  //   host: process.env.REDIS_HOST || "redis",
  //   port: process.env.REDIS_PORT || 6379,
  // },
  url: process.env.REDIS_URL
});

redisClient.on("error", (err) => console.error("Redist Client Error: ", err));

(async () => {
  await redisClient.connect();
})();

export default redisClient;
