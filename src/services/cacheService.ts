import NodeCache from 'node-cache';

/**
 * Cache instance with a standard Time To Live (TTL) of 10 minutes.
 * @type {NodeCache}
 */
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes TTL

/**
 * Retrieves data from the cache for a given key.
 * 
 * @param {string} key - The key to retrieve data for.
 * @returns {any|undefined} The cached data if found, otherwise undefined.
 */
export const getCachedData = (key: string) => {
    return cache.get(key);
};

/**
 * Sets data in the cache for a given key.
 * 
 * @param {string} key - The key to set data for.
 * @param {any} data - The data to cache.
 */
export const setCachedData = (key: string, data: any) => {
    cache.set(key, data);
};

/**
 * Initializes the cache with data fetched from a provided function.
 * 
 * @param {string} key - The key to set the fetched data under.
 * @param {Function} fetchData - An async function that returns the data to be cached.
 * @returns {Promise<any>} A promise that resolves with the fetched and cached data.
 */
export const initializeCache = async (key: string, fetchData: () => Promise<any>) => {
    const data = await fetchData();
    setCachedData(key, data);
    return data;
};