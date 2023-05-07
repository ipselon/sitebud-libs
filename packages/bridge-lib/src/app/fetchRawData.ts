import {SiteMap_Bean} from '@sitebud/domain-lib';
import type {DocumentPathData, DocumentData, Data} from '../core/types';
import {createDocumentPathDataList} from '../core/documentPathDataFactory';
import {enhanceDocumentData} from '../core/documentDataFactory';
import {fetchSiteMapData} from './fetchSiteMapData';
import {fetchDocumentData} from './fetchDocumentData';
import {fetchDocumentDataById} from './fetchDocumentDataById';
import {putIntoSearch} from './putIntoSearch';
import {fetchLinkedData} from './fetchDocumentLinkedData';

async function fetchExtraData(documentData: DocumentData, siteMap: SiteMap_Bean, accessLevel: number, locale?: string): Promise<DocumentData> {
    documentData.authorProfiles = {};
    if (siteMap.authorsDocumentIds) {
        const validLocale: string = locale || siteMap.defaultLocale;
        const localeAuthorDocumentIds: Record<string, string> | undefined = siteMap.authorsDocumentIds[validLocale];
        if (localeAuthorDocumentIds) {
            for (const authorDocumentId of Object.entries(localeAuthorDocumentIds)) {
                try {
                    const authorDocumentData: DocumentData = await fetchDocumentDataById(siteMap, authorDocumentId[1], accessLevel, locale);
                    documentData.authorProfiles[authorDocumentId[0]] = enhanceDocumentData(authorDocumentData, siteMap, locale);
                } catch (e: any) {
                    console.error(`[SiteBub CMS] ${e.message}`);
                }
            }
        }
    }
    return documentData;
}

async function fetchData(siteMap: SiteMap_Bean, accessLevel: number, locale?: string, slug?: string): Promise<DocumentData> {
    const documentData: DocumentData = await fetchDocumentData(
        siteMap, accessLevel, locale, slug
    );
    return await fetchLinkedData(documentData, siteMap, accessLevel, locale);
}

export async function fetchRawData(accessLevel: number, locale?: string, slug?: string): Promise<Data> {
    const siteMap: SiteMap_Bean = await fetchSiteMapData();
    if (!siteMap) {
        console.error('[SiteBud CMS] Can not read "data/siteMap.json" file.');
        throw Error('Not Found');
    }
    const pageData: DocumentData = await fetchData(siteMap, accessLevel, locale, slug);
    let siteData: DocumentData = await fetchData(siteMap, accessLevel, locale, '@site');
    siteData = await fetchExtraData(siteData, siteMap, accessLevel, locale);
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
