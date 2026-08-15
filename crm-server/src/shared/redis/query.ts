import redisService from './caching';

export async function cacheQuery<T>(key: string, ttl: number, callback: () => Promise<T>
): Promise<T> {
    const cached =
        await redisService.get<T>(key);
    if (cached) {
        console.log(`CACHE HIT: ${key}`);
        return cached;
    }
    console.log(`CACHE MISS: ${key}`);
    const data = await callback();
    await redisService.set(key, data, ttl);
    return data;
}