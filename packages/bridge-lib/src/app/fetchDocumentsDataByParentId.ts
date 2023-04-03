import {
    SiteMap_Bean,
    DocumentRecord_Bean,
    findDocument
} from '@sitebud/domain-lib';
import {DocumentDataFetchingStatus} from './types';
import {fetchDocumentDataById} from './fetchDocumentDataById';

export async function fetchDocumentsDataByParentId(siteMap: SiteMap_Bean, parentDocumentId: string, locale?: string): Promise<Array<DocumentDataFetchingStatus>> {
    const resultList: Array<DocumentDataFetchingStatus> = [];
    const foundParentDocumentRecord: DocumentRecord_Bean | undefined = findDocument(siteMap.root, parentDocumentId);
    if (foundParentDocumentRecord && foundParentDocumentRecord.children && foundParentDocumentRecord.children.length > 0) {
        for (const documentItem of foundParentDocumentRecord.children) {
            resultList.push(await fetchDocumentDataById(siteMap, documentItem.id, locale));
        }
    }
    return resultList;
}
