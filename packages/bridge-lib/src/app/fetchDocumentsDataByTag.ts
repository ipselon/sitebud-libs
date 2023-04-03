import {
    SiteMap_Bean,
    DocumentRecord_Bean,
    findDocument,
    getAllDocuments,
    DocumentContent_Base
} from '@sitebud/domain-lib';
import {fetchDocumentDataById} from './fetchDocumentDataById';
import {DocumentDataFetchingStatus} from './types';

export async function fetchDocumentsDataByTag(siteMap: SiteMap_Bean, tag: string, locale?: string): Promise<Array<DocumentDataFetchingStatus>> {
    const resultList: Array<DocumentDataFetchingStatus> = [];
    if (locale) {
        const foundDocumentRecords: Array<DocumentRecord_Bean> = getAllDocuments(siteMap.root, (documentRecord: DocumentRecord_Bean) => {
            const foundDocumentContent: DocumentContent_Base | undefined = documentRecord.contents[locale];
            return !!foundDocumentContent && foundDocumentContent.tags[tag] >= 1;
        });
        if (foundDocumentRecords && foundDocumentRecords.length > 0) {
            for (const documentItem of foundDocumentRecords) {
                resultList.push(await fetchDocumentDataById(siteMap, documentItem.id, locale));
            }
        }
    }
    return resultList;
}
