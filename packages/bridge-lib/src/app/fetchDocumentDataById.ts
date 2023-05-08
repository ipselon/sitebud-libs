import {
    Document_Bean,
    DocumentContent_Bean,
    SiteMap_Bean
} from '@sitebud/domain-lib';
import type {DocumentData, FetchOptions} from '../core';
import {createDocumentData} from '../core/documentDataFactory';
import {readDataFromFile} from './readDataFromFile';
import {removeRestrictedBlocks, filterAreas} from '../core/documentDataUtility';

export async function fetchDocumentDataById(
    siteMap: SiteMap_Bean,
    documentId: string,
    fetchOptions: FetchOptions,
    nestedLevel: number,
    locale?: string
): Promise<DocumentData> {
    const validLocale: string = locale || siteMap.defaultLocale;
    let document: Document_Bean = await readDataFromFile<Document_Bean>(`data/documents/${documentId}.json`);
    if (!document) {
        throw Error(`Document "${documentId}.json" file is not found.`);
    }
    const documentContent: DocumentContent_Bean | undefined = document.contents[validLocale];
    // todo: should we return default locale if we didn't find the document content with requested locale?
    // const documentContent: DocumentContent_Bean | undefined = document.contents[validLocale] || document.contents[siteMap.defaultLocale];
    if (!documentContent) {
        throw Error(`Document "${documentId}" content for "${locale}" locale is not found.`);
    }
    const {accessLevel, requiredDocumentAreas} = fetchOptions;
    if (documentContent.documentAreas && documentContent.documentAreas.length > 0) {
        if (nestedLevel > 0) {
            documentContent.documentAreas = filterAreas(documentContent.documentAreas, requiredDocumentAreas);
        }
        documentContent.documentAreas = removeRestrictedBlocks(documentContent.documentAreas, accessLevel);
    }
    return await createDocumentData({
        locale: validLocale,
        siteMap,
        documentClass: document.documentClass,
        documentId: document.id,
        documentType: document.type,
        documentContent
    });
}
