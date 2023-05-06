import {SiteMap_Bean} from '@sitebud/domain-lib';
import {enhanceDocumentData} from '../core/documentDataFactory';
import {DocumentData} from '../core/types';
import {fetchDocumentsDataByParentId} from './fetchDocumentsDataByParentId';
import {fetchDocumentDataById} from './fetchDocumentDataById';
import {fetchDocumentsDataByTag} from './fetchDocumentsDataByTag';

export async function fetchLinkedData(
    documentData: DocumentData,
    siteMap: SiteMap_Bean,
    accessLevel: number,
    locale: string | undefined,
    level: number = 0
): Promise<DocumentData> {
    console.log('[fetchLinkedData] level: ', level);
    const {documentDataListByParentId, documentDataById, documentDataListByTag} = documentData;
    if (documentDataListByParentId) {
        const newPageDataListByParentIdMap: Record<string, Array<DocumentData>> = {};
        for (const parentId of Object.keys(documentDataListByParentId)) {
            const childrenDocumentData: Array<DocumentData> = await fetchDocumentsDataByParentId(siteMap, parentId, accessLevel, locale);
            if (childrenDocumentData.length > 0) {
                newPageDataListByParentIdMap[parentId] = [];
                for (const childDocumentData of childrenDocumentData) {
                    if (level < 1) {
                        // go to recursion
                        const withLinkedData: DocumentData = await fetchLinkedData(childDocumentData, siteMap, accessLevel, locale, level + 1);
                        newPageDataListByParentIdMap[parentId].push(withLinkedData);
                    } else {
                        newPageDataListByParentIdMap[parentId].push(childDocumentData);
                    }
                }
            }
        }
        documentData.documentDataListByParentId = newPageDataListByParentIdMap;
    }
    if (documentDataById) {
        const newPageDataByIdMap: Record<string, DocumentData> = {};
        for (const documentId of Object.keys(documentDataById)) {
            try {
                const fetchedDocumentData: DocumentData = await fetchDocumentDataById(siteMap, documentId, accessLevel, locale);
                if (level < 1) {
                    // go to recursion
                    newPageDataByIdMap[documentId] = await fetchLinkedData(fetchedDocumentData, siteMap, accessLevel, locale, level + 1);
                } else {
                    newPageDataByIdMap[documentId] = fetchedDocumentData;
                }
            } catch (e: any) {
                console.error(`[SiteBub CMS] ${e.message}`);
            }
        }
        documentData.documentDataById = newPageDataByIdMap;
    }
    if (documentDataListByTag) {
        const newPageDataListByTagMap: Record<string, Array<DocumentData>> = {};
        for (const tag of Object.keys(documentDataListByTag)) {
            const taggedDocumentsData: Array<DocumentData> = await fetchDocumentsDataByTag(siteMap, tag, accessLevel, locale);
            if (taggedDocumentsData.length > 0) {
                newPageDataListByTagMap[tag] = [];
                for (const taggedDocumentData of taggedDocumentsData) {
                    if (level < 1) {
                        // go to recursion
                        const withLinkedData: DocumentData = await fetchLinkedData(taggedDocumentData, siteMap, accessLevel, locale, level + 1);
                        newPageDataListByTagMap[tag].push(withLinkedData);
                    } else {
                        newPageDataListByTagMap[tag].push(taggedDocumentData);
                    }
                }
            }
        }
        documentData.documentDataListByTag = newPageDataListByTagMap;
    }
    return enhanceDocumentData(documentData, siteMap, locale);
}
