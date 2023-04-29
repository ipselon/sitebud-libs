import {
    Document_Bean,
    DocumentContent_Bean,
    SiteMap_Bean,
    Document_Common,
    DocumentContent_Common
} from '@sitebud/domain-lib';
import type {DocumentData} from '../core';
import {createDocumentData} from '../core/documentDataFactory';
import {readDataFromFile} from './readDataFromFile';

export async function fetchDocumentDataById(siteMap: SiteMap_Bean, documentId: string, locale?: string): Promise<DocumentData> {
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
    let documentCommon: Document_Common | undefined = undefined;
    try {
        documentCommon = await readDataFromFile<Document_Bean>(`data/commons/${document.documentClass}.json`);
    } catch (e) {
        // do nothing if there is no common class data
    }
    if (!documentCommon) {
        documentContent.commonAreas = [];
    } else if (documentCommon && documentCommon.contents) {
        const documentCommonContent: DocumentContent_Common | undefined = documentCommon.contents[validLocale];
        // todo: should we return default locale if we didn't find the document common content with requested locale?
        // const documentCommonContent: DocumentContent_Common | undefined = documentCommon.contents[validLocale] || documentCommon.contents[siteMap.defaultLocale];
        if (documentCommonContent) {
            documentContent.commonAreas = documentCommonContent.commonAreas || [];
        } else {
            documentContent.commonAreas = [];
        }
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
