import {
    SiteMap_Bean,
    DocumentRecord_Bean,
    getAllDocuments,
    DocumentContent_Base
} from '@sitebud/domain-lib';
import {DocumentData} from '../core';
import {fetchDocumentDataById} from './fetchDocumentDataById';

export async function fetchDocumentsDataByTag(siteMap: SiteMap_Bean, tag: string, locale?: string): Promise<Array<DocumentData>> {
    const resultList: Array<DocumentData> = [];
    if (locale) {
        const foundDocumentRecords: Array<DocumentRecord_Bean> = getAllDocuments(siteMap.root, (documentRecord: DocumentRecord_Bean) => {
            const foundDocumentContent: DocumentContent_Base | undefined = documentRecord.contents[locale];
            return !!foundDocumentContent && foundDocumentContent.tags[tag] >= 1;
        });
        if (foundDocumentRecords && foundDocumentRecords.length > 0) {
            for (const documentItem of foundDocumentRecords) {
                try {
                    resultList.push(await fetchDocumentDataById(siteMap, documentItem.id, locale));
                } catch (e: any) {
                    console.error(`[SiteBub CMS] ${e.message}`);
                }
            }
        }
    }
    return resultList;
}
