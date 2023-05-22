import {SiteMap_Bean} from '@sitebud/domain-lib';
import type {DocumentPathData, DocumentData, Data, FetchOptions, RequestOptions} from '../core/types';
import {createDocumentPathDataList} from '../core/documentPathDataFactory';
import {fetchSiteMapData} from './fetchSiteMapData';
import {fetchDocumentData} from './fetchDocumentData';
import {fetchLinkedData} from './fetchDocumentLinkedData';

async function fetchData(
    siteMap: SiteMap_Bean,
    fetchOptions: FetchOptions,
    locale?: string,
    slug?: string
): Promise<DocumentData> {
    // 0 nested level is always... here
    const documentData: DocumentData = await fetchDocumentData(
        siteMap, fetchOptions, locale, slug
    );
    // fetch all related documents with filtering options
    return await fetchLinkedData(documentData, siteMap, fetchOptions, locale);
}

export async function fetchRawData(requestOptions: RequestOptions, locale?: string, slug?: string): Promise<Data> {
    const siteMap: SiteMap_Bean = await fetchSiteMapData();
    if (!siteMap) {
        console.error('[SiteBud CMS] Can not read "data/siteMap.json" file.');
        throw Error('Not Found');
    }
    const fetchOptions: FetchOptions = {...requestOptions};
    const pageData: DocumentData = await fetchData(siteMap, fetchOptions, locale, slug);
    const siteData: DocumentData = await fetchData(siteMap, fetchOptions, locale, '@site');
    return {
        pageData,
        siteData
    }
}

export async function createPaths(): Promise<Array<DocumentPathData>> {
    const siteMap: SiteMap_Bean = await fetchSiteMapData();
    return createDocumentPathDataList(siteMap);
}
