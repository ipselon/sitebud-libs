import {PagePathData, createPagePathDataList, PageData, createPageData} from '../core';
import {SiteMapDataFetchStatus, ReadDataFromFileFunc, DocumentDataFetchingStatus} from './types';
import {fetchSiteMapData} from './fetchSiteMapData';
import {fetchDocumentData} from './fetchDocumentData';
import {fetchDocumentsDataByParentId} from './fetchDocumentsDataByParentId';
import {fetchDocumentDataById} from './fetchDocumentDataById';

export async function createPaths(readDataFunc: ReadDataFromFileFunc): Promise<Array<PagePathData>> {
    let paths: Array<PagePathData> = [];
    const siteMapDataStatus: SiteMapDataFetchStatus = await fetchSiteMapData(readDataFunc);
    if (siteMapDataStatus.contextProxy) {
        paths = createPagePathDataList(siteMapDataStatus.contextProxy);
    }
    return paths;
}

export async function fetchPageData(readDataFunc: ReadDataFromFileFunc, locale?: string, slug?: string): Promise<PageData> {
    // take the last section in the path and use it as a slug to find the page data
    const siteMapDataStatus: SiteMapDataFetchStatus = await fetchSiteMapData(readDataFunc);
    if (!siteMapDataStatus.contextProxy || siteMapDataStatus.isError) {
        console.error(`Can not read "siteMap.json" file. ${siteMapDataStatus.error}`);
        throw Error('Not Found');
    }
    const dataFetchStatus: DocumentDataFetchingStatus = await fetchDocumentData(
        readDataFunc, siteMapDataStatus.contextProxy.siteMap, locale, slug
    );
    if (dataFetchStatus.isNotFound || !dataFetchStatus.contextProxy) {
        throw Error('Not Found');
    }
    const pageData: PageData = await createPageData(dataFetchStatus.contextProxy);
    const {pageDataListByParentId, pageDataById} = pageData;
    if (pageDataListByParentId) {
        const newPageDataListByParentIdMap: Record<string, Array<PageData>> = {};
        for (const parentId of Object.keys(pageDataListByParentId)) {
            const childrenDocumentDataFetchingStatuses: Array<DocumentDataFetchingStatus> =
                await fetchDocumentsDataByParentId(readDataFunc, siteMapDataStatus.contextProxy.siteMap, parentId, locale);
            if (childrenDocumentDataFetchingStatuses.length > 0) {
                newPageDataListByParentIdMap[parentId] = [];
                for (const childDocumentDataFetchingStatus of childrenDocumentDataFetchingStatuses) {
                    if (childDocumentDataFetchingStatus.contextProxy && !childDocumentDataFetchingStatus.isError) {
                        const childPageData: PageData = await createPageData(childDocumentDataFetchingStatus.contextProxy);
                        newPageDataListByParentIdMap[parentId].push(childPageData);
                    }
                }
            }
        }
        pageData.pageDataListByParentId = newPageDataListByParentIdMap;
    }
    if (pageDataById) {
        const newPageDataByIdMap: Record<string, PageData> = {};
        for (const documentId of Object.keys(pageDataById)) {
            const documentDataFetchingStatus: DocumentDataFetchingStatus =
                await fetchDocumentDataById(readDataFunc, siteMapDataStatus.contextProxy.siteMap, documentId, locale);
            if (documentDataFetchingStatus.contextProxy && !documentDataFetchingStatus.isError) {
                newPageDataByIdMap[documentId] = await createPageData(documentDataFetchingStatus.contextProxy);
            }
        }
        pageData.pageDataById = newPageDataByIdMap;
    }
    return pageData;
}
