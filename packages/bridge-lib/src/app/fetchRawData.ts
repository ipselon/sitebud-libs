import {SiteMap_Bean, Document_Bean} from '@sitebud/domain-lib';
import type {
    DocumentPathData,
    Data,
    FetchOptions,
    RequestOptions,
    SiteMapIndex
} from '../core/types';
import {createDocumentPathDataList} from '../core/documentPathDataFactory';
import {fetchSiteMapData} from './fetchSiteMapData';
import {makeSiteIndex} from '../core/documentDataFactory';
import {readDataFromFile} from './readDataFromFile';
import {fetchData} from '../core/dataFactory';

export async function fetchDocumentDataById(fetchOptions: FetchOptions, documentId: string, locale: string): Promise<Document_Bean> {
    let document: Document_Bean = await readDataFromFile<Document_Bean>(`data/documents/${documentId}.json`);
    if (!document) {
        throw Error(`Document "${documentId}.json" file is not found.`);
    }
    return document;
}


export async function fetchRawData(requestOptions: RequestOptions, locale?: string, slug?: string): Promise<Data> {
    const siteMap: SiteMap_Bean = await fetchSiteMapData();
    if (!siteMap) {
        console.error('[SiteBud CMS] Can not read the "data/siteMap.json" file.');
        throw Error('Not Found');
    }
    const validLocale: string = locale || siteMap.defaultLocale;
    const fetchOptions: FetchOptions = {...requestOptions};
    const siteIndex: SiteMapIndex = makeSiteIndex(siteMap.root, {}, siteMap.defaultLocale, locale);
    return fetchData(siteMap, siteIndex, fetchOptions, validLocale, fetchDocumentDataById, slug);
}

export async function createPaths(): Promise<Array<DocumentPathData>> {
    const siteMap: SiteMap_Bean = await fetchSiteMapData();
    return createDocumentPathDataList(siteMap);
}
