import {SiteMap_Bean} from '@sitebud/domain-lib';
import type {DocumentPathData, DocumentData, Data} from '../core/types';
import {createDocumentPathDataList} from '../core/documentPathDataFactory';
import {enhanceDocumentData} from '../core/documentDataFactory';
import {fetchSiteMapData} from './fetchSiteMapData';
import {fetchDocumentData} from './fetchDocumentData';
import {fetchDocumentsDataByParentId} from './fetchDocumentsDataByParentId';
import {fetchDocumentDataById} from './fetchDocumentDataById';
import {fetchDocumentsDataByTag} from './fetchDocumentsDataByTag';

async function fetchExtraData(documentData: DocumentData, siteMap: SiteMap_Bean, locale?: string): Promise<DocumentData> {
    documentData.authorProfiles = {};
    if (siteMap.authorsDocumentIds) {
        const validLocale: string = locale || siteMap.defaultLocale;
        const localeAuthorDocumentIds: Record<string, string> | undefined = siteMap.authorsDocumentIds[validLocale];
        if (localeAuthorDocumentIds) {
            for (const authorDocumentId of Object.entries(localeAuthorDocumentIds)) {
                documentData.authorProfiles[authorDocumentId[0]] = await fetchDocumentDataById(siteMap, authorDocumentId[1], locale);
            }
        }
    }
    return documentData;
}

async function fetchData(siteMap: SiteMap_Bean, locale?: string, slug?: string): Promise<DocumentData> {
    const documentData: DocumentData = await fetchDocumentData(
        siteMap, locale, slug
    );
    const {documentDataListByParentId, documentDataById, documentDataListByTag} = documentData;
    if (documentDataListByParentId) {
        const newPageDataListByParentIdMap: Record<string, Array<DocumentData>> = {};
        for (const parentId of Object.keys(documentDataListByParentId)) {
            const childrenDocumentData: Array<DocumentData> = await fetchDocumentsDataByParentId(siteMap, parentId, locale);
            if (childrenDocumentData.length > 0) {
                newPageDataListByParentIdMap[parentId] = [];
                for (const childDocumentData of childrenDocumentData) {
                        newPageDataListByParentIdMap[parentId].push(childDocumentData);
                }
            }
        }
        documentData.documentDataListByParentId = newPageDataListByParentIdMap;
    }
    if (documentDataById) {
        const newPageDataByIdMap: Record<string, DocumentData> = {};
        for (const documentId of Object.keys(documentDataById)) {
            newPageDataByIdMap[documentId] = await fetchDocumentDataById(siteMap, documentId, locale);
        }
        documentData.documentDataById = newPageDataByIdMap;
    }
    if (documentDataListByTag) {
        const newPageDataListByTagMap: Record<string, Array<DocumentData>> = {};
        for (const tag of Object.keys(documentDataListByTag)) {
            const taggedDocumentsData: Array<DocumentData> = await fetchDocumentsDataByTag(siteMap, tag, locale);
            if (taggedDocumentsData.length > 0) {
                newPageDataListByTagMap[tag] = [];
                for (const taggedDocumentData of taggedDocumentsData) {
                    newPageDataListByTagMap[tag].push(taggedDocumentData);
                }
            }
        }
        documentData.documentDataListByTag = newPageDataListByTagMap;
    }
    return enhanceDocumentData(documentData, siteMap, locale);
}

export async function fetchRawData(locale?: string, slug?: string): Promise<Data> {
    const siteMap: SiteMap_Bean = await fetchSiteMapData();
    if (!siteMap) {
        console.error('Can not read "siteMap.json" file.');
        throw Error('Not Found');
    }
    const pageData: DocumentData = await fetchData(siteMap, locale, slug);
    let siteData: DocumentData = await fetchData(siteMap, locale, '@site');
    siteData = await fetchExtraData(siteData, siteMap, locale);
    return {
        pageData,
        siteData
    }
}

export async function createPaths(): Promise<Array<DocumentPathData>> {
    const siteMap: SiteMap_Bean = await fetchSiteMapData();
    return createDocumentPathDataList(siteMap);
}
