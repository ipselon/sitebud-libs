import {
    Document_Bean,
    DocumentContent_Bean,
    SiteMap_Bean,
    Document_Common,
    DocumentContent_Common
} from '@sitebud/domain-lib';
import {readDataFromFile} from './readDataFromFile';
import {DocumentDataFetchingStatus} from './types';

export async function fetchDocumentDataById(siteMap: SiteMap_Bean, documentId: string, locale?: string): Promise<DocumentDataFetchingStatus> {
    let result: DocumentDataFetchingStatus = {};
    try {
        const validLocale: string = locale || siteMap.defaultLocale;
        let document: Document_Bean = await readDataFromFile<Document_Bean>(`data/documents/${documentId}.json`);
        if (!document) {
            throw Error(`Document "${documentId}.json" file is not found.`);
        }
        const documentContent: DocumentContent_Bean | undefined = document.contents[validLocale] || document.contents[siteMap.defaultLocale];
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
        } else if (documentCommon && documentCommon.contents){
            const documentCommonContent: DocumentContent_Common | undefined = documentCommon.contents[validLocale] || documentCommon.contents[siteMap.defaultLocale];
            if (documentCommonContent) {
                documentContent.commonAreas = documentCommonContent.commonAreas || [];
            } else {
                documentContent.commonAreas = [];
            }
        }
        result.isSuccess = true;
        result.contextProxy = {
            locale: validLocale,
            siteMap,
            documentClass: document.documentClass,
            documentId: document.id,
            documentContent
        };
    } catch (e: any) {
        result = {
            error: e.message,
            isError: true,
            isNotFound: true
        }
    }
    return result;
}
