import {getIdb} from './localDbFactory';

export async function getFromCache(key: string) {
  const dbPromise = getIdb();
  return (await dbPromise).get('cache', key);
}
export async function putIntoCache(key: string, val: any) {
  const dbPromise = getIdb();
  return (await dbPromise).put('cache', val, key);
}
export async function delFromCache(key: string) {
  const dbPromise = getIdb();
  return (await dbPromise).delete('cache', key);
}
export async function clearCache() {
  const dbPromise = getIdb();
  return (await dbPromise).clear('cache');
}
export async function getCacheKeys() {
  const dbPromise = getIdb();
  return (await dbPromise).getAllKeys('cache');
}
