import { createClient } from "redis"
import { ApiError } from "../utils/ApiError"

const redisUrl = process.env.REDIS_URL
if (!redisUrl) {
    throw ApiError.badRequest("REDIS_URL is not defined")
}

const redis = createClient({
    url: redisUrl,
    socket: {
        reconnectStrategy: (retries) => {
            console.log(`Reconnecting to Redis... (attempt ${retries + 1})`);
            if (retries > 10) {
                throw ApiError.badRequest("Unable to connect to Redis")
            }
            return Math.min(retries * 1000, 3000);
        }
    },
})
redis.on("connect", () => {
    console.log("✅ Redis connected successfully")
})
redis.on("ready", () => {
    console.error("Redis is ready to use:");
})
redis.on("error", (err) => {
    console.error("Redis error:", err);
});

export async function connectRedis() {
    try{
        await redis.connect()
        console.log("✅ Redis connected successfully")
    }
    catch(err){
        console.error("❌ Redis connection failed:", err)
        process.exit(1) 
    }
}
connectRedis()

export default redis;