import {SiteMap_Bean} from '@sitebud/domain-lib';
import {SiteMapDataFetchStatus} from './types';
import {readDataFromFile} from './readDataFromFile';

export async function fetchSiteMapData(locale?: string, documentSlug?: string): Promise<SiteMapDataFetchStatus> {
    let result: SiteMapDataFetchStatus = {};
    let siteMap: SiteMap_Bean;
    try {
        siteMap = await readDataFromFile<SiteMap_Bean>('data/siteMap.json');
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
