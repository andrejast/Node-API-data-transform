import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 }); // 10 minuta TTL

export const getCachedData = (key: string) => {
    return cache.get(key);
};

export const setCachedData = (key: string, data: any) => {
    cache.set(key, data);
};