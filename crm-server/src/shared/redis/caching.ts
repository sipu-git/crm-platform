import redis from "./redis";

class RedisService {
    async get<T>(key: string): Promise<T | null> {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    }

    async set(key: string, value: unknown, ttl = 300): Promise<void> {
        await redis.set(key, JSON.stringify(value), { EX: ttl });
    }


    async delete(key: string): Promise<void> {
        await redis.del(key);
    }

    async deleteByPattern(pattern: string): Promise<void> {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(keys);
            console.log(`CACHE INVALIDATED: ${keys.length} keys matching "${pattern}"`);
        }
    }
}

export default new RedisService();

