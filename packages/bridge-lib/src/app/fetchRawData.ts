import {SiteMap_Bean} from '@sitebud/domain-lib';
import type {DocumentPathData, DocumentData, Data, FetchOptions, RequestOptions} from '../core/types';
import {createDocumentPathDataList} from '../core/documentPathDataFactory';
// import {enhanceDocumentData} from '../core/documentDataFactory';
import {fetchSiteMapData} from './fetchSiteMapData';
import {fetchDocumentData} from './fetchDocumentData';
// import {fetchDocumentDataById} from './fetchDocumentDataById';
import {putIntoSearch} from './putIntoSearch';
import {fetchLinkedData} from './fetchDocumentLinkedData';

// async function fetchExtraData(
//     documentData: DocumentData,
//     siteMap: SiteMap_Bean,
//     fetchOptions: FetchOptions,
//     locale?: string
// ): Promise<DocumentData> {
//     documentData.authorProfiles = {};
//     if (siteMap.authorsDocumentIds) {
//         const validLocale: string = locale || siteMap.defaultLocale;
//         const localeAuthorDocumentIds: Record<string, string> | undefined = siteMap.authorsDocumentIds[validLocale];
//         if (localeAuthorDocumentIds) {
//             for (const authorDocumentId of Object.entries(localeAuthorDocumentIds)) {
//                 try {
//                     const authorDocumentData: DocumentData = await fetchDocumentDataById(
//                         siteMap,
//                         authorDocumentId[1],
//                         {...fetchOptions, requiredDocumentAreas: ['*']},
//                         1,
//                         locale
//                     );
//                     documentData.authorProfiles[authorDocumentId[0]] = enhanceDocumentData(authorDocumentData, siteMap, locale);
//                 } catch (e: any) {
//                     console.error(`[SiteBub CMS] ${e.message}`);
//                 }
//             }
//         }
//     }
//     return documentData;
// }

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
    let siteData: DocumentData = await fetchData(siteMap, fetchOptions, locale, '@site');
    // siteData = await fetchExtraData(siteData, siteMap, fetchOptions, locale);
    await putIntoSearch(pageData, locale || siteMap.defaultLocale);
    return {
        pageData,
        siteData
    }
}

export async function createPaths(): Promise<Array<DocumentPathData>> {
    const siteMap: SiteMap_Bean = await fetchSiteMapData();
    return createDocumentPathDataList(siteMap);
}
