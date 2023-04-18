import type {DocumentPathData, DocumentData, Data} from '../core/types';
import {createDocumentPathDataList} from '../core/documentPathDataFactory';
import {createDocumentData, enhanceDocumentData} from '../core/documentDataFactory';
import type {SiteMapDataFetchStatus, DocumentDataFetchingStatus} from './types';
import {fetchSiteMapData} from './fetchSiteMapData';
import {fetchDocumentData} from './fetchDocumentData';
import {fetchDocumentsDataByParentId} from './fetchDocumentsDataByParentId';
import {fetchDocumentDataById} from './fetchDocumentDataById';
import {fetchDocumentsDataByTag} from './fetchDocumentsDataByTag';
import {SiteMap_Bean} from '@sitebud/domain-lib';

export async function createPaths(): Promise<Array<DocumentPathData>> {
    let paths: Array<DocumentPathData> = [];
    const siteMapDataStatus: SiteMapDataFetchStatus = await fetchSiteMapData();
    if (siteMapDataStatus.contextProxy) {
        paths = createDocumentPathDataList(siteMapDataStatus.contextProxy);
    }
    return paths;
}

async function fetchData(siteMap: SiteMap_Bean, locale?: string, slug?: string): Promise<DocumentData> {
    const dataFetchStatus: DocumentDataFetchingStatus = await fetchDocumentData(
        siteMap, locale, slug
    );
    if (dataFetchStatus.isNotFound || !dataFetchStatus.contextProxy) {
        throw Error('Not Found');
    }
    const documentData: DocumentData = await createDocumentData(dataFetchStatus.contextProxy);
    const {documentDataListByParentId, documentDataById, documentDataListByTag} = documentData;
    if (documentDataListByParentId) {
        const newPageDataListByParentIdMap: Record<string, Array<DocumentData>> = {};
        for (const parentId of Object.keys(documentDataListByParentId)) {
            const childrenDocumentDataFetchingStatuses: Array<DocumentDataFetchingStatus> =
                await fetchDocumentsDataByParentId(siteMap, parentId, locale);
            if (childrenDocumentDataFetchingStatuses.length > 0) {
                newPageDataListByParentIdMap[parentId] = [];
                for (const childDocumentDataFetchingStatus of childrenDocumentDataFetchingStatuses) {
                    if (childDocumentDataFetchingStatus.contextProxy && !childDocumentDataFetchingStatus.isError) {
                        const childPageData: DocumentData = await createDocumentData(childDocumentDataFetchingStatus.contextProxy);
                        newPageDataListByParentIdMap[parentId].push(childPageData);
                    }
                }
            }
        }
        documentData.documentDataListByParentId = newPageDataListByParentIdMap;
    }
    if (documentDataById) {
        const newPageDataByIdMap: Record<string, DocumentData> = {};
        for (const documentId of Object.keys(documentDataById)) {
            const documentDataFetchingStatus: DocumentDataFetchingStatus =
                await fetchDocumentDataById(siteMap, documentId, locale);
            if (documentDataFetchingStatus.contextProxy && !documentDataFetchingStatus.isError) {
                newPageDataByIdMap[documentId] = await createDocumentData(documentDataFetchingStatus.contextProxy);
            }
        }
        documentData.documentDataById = newPageDataByIdMap;
    }
    if (documentDataListByTag) {
        const newPageDataListByTagMap: Record<string, Array<DocumentData>> = {};
        for (const tag of Object.keys(documentDataListByTag)) {
            const taggedDocumentDataFetchingStatuses: Array<DocumentDataFetchingStatus> =
                await fetchDocumentsDataByTag(siteMap, tag, locale);
            if (taggedDocumentDataFetchingStatuses.length > 0) {
                newPageDataListByTagMap[tag] = [];
                for (const taggedDocumentDataFetchingStatus of taggedDocumentDataFetchingStatuses) {
                    if (taggedDocumentDataFetchingStatus.contextProxy && !taggedDocumentDataFetchingStatus.isError) {
                        const taggedPageData: DocumentData = await createDocumentData(taggedDocumentDataFetchingStatus.contextProxy);
                        newPageDataListByTagMap[tag].push(taggedPageData);
                    }
                }
            }
        }
        documentData.documentDataListByTag = newPageDataListByTagMap;
    }
    return enhanceDocumentData(documentData, siteMap, locale);
}

export async function fetchRawData(locale?: string, slug?: string): Promise<Data> {
    const siteMapDataStatus: SiteMapDataFetchStatus = await fetchSiteMapData();
    if (!siteMapDataStatus.contextProxy || siteMapDataStatus.isError) {
        console.error(`Can not read "siteMap.json" file. ${siteMapDataStatus.error}`);
        throw Error('Not Found');
    }
    const pageData: DocumentData = await fetchData(siteMapDataStatus.contextProxy.siteMap, locale, slug);
    const siteData: DocumentData = await fetchData(siteMapDataStatus.contextProxy.siteMap, locale, '@site');
    return {
        pageData,
        siteData
    }
}