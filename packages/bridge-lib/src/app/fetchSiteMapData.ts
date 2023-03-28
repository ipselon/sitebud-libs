import {SiteMap_Bean} from '@sitebud/domain-lib';
import {SiteMapDataFetchStatus, ReadDataFromFileFunc} from './types';

export async function fetchSiteMapData(readDataFunc: ReadDataFromFileFunc, locale?: string, documentSlug?: string): Promise<SiteMapDataFetchStatus> {
    let result: SiteMapDataFetchStatus = {};
    let siteMap: SiteMap_Bean;
    try {
        siteMap = await readDataFunc<SiteMap_Bean>('data/siteMap.json');
        if (!siteMap) {
            throw Error('Site map is not found.');
        }
        return {
            contextProxy: {
                siteMap
            }
        }
    } catch (e: any) {
        result = {
            error: e.message,
            isError: true,
        }
    }
    return result;
}
