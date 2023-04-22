import {SiteMap_Bean} from '@sitebud/domain-lib';
import {readDataFromFile} from './readDataFromFile';

export async function fetchSiteMapData(): Promise<SiteMap_Bean> {
    return await readDataFromFile<SiteMap_Bean>('data/siteMap.json');
}
