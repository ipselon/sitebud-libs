import {
    SiteMap_Bean,
    DocumentRecord_Bean,
    findDocument
} from '@sitebud/domain-lib';
import {DocumentData} from '../core';
import {fetchDocumentDataById} from './fetchDocumentDataById';

export async function fetchDocumentsDataByParentId(siteMap: SiteMap_Bean, parentDocumentId: string, accessLevel: number, locale?: string): Promise<Array<DocumentData>> {
    const resultList: Array<DocumentData> = [];
    const foundParentDocumentRecord: DocumentRecord_Bean | undefined = findDocument(siteMap.root, parentDocumentId);
    if (foundParentDocumentRecord && foundParentDocumentRecord.children && foundParentDocumentRecord.children.length > 0) {
        for (const documentItem of foundParentDocumentRecord.children) {
            try {
                resultList.push(await fetchDocumentDataById(siteMap, documentItem.id, accessLevel, locale));
            } catch (e: any) {
                console.error(`[SiteBub CMS] ${e.message}`);
            }
        }
    }
    return resultList;
}
