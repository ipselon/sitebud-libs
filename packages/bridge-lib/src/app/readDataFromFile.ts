import {fsExtra, path} from '../core/externalModules';

export async function readDataFromFile<T>(filePath: string): Promise<T> {
    if (!fsExtra) {
        throw Error('Missing fsExtra external module');
    }
    if (!path) {
        throw Error('Missing path external module');
    }
    const cacheFilePath = path.join(process.cwd(), filePath);
    if (fsExtra.existsSync(cacheFilePath)) {
        return await fsExtra.readJson(cacheFilePath) as Promise<T>;
    }
    throw Error(`${filePath} does not exist`);
}
