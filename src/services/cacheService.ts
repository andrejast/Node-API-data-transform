import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes TTL

export const getCachedData = (key: string) => {
    return cache.get(key);
};

export const setCachedData = (key: string, data: any) => {
    cache.set(key, data);
};

export const initializeCache = async (key: string, fetchData: () => Promise<any>) => {
    const data = await fetchData();
    setCachedData(key, data);
    return data;
};