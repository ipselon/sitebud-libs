export const dummy = {};
// import {
//     SiteMap_Bean,
//     DocumentRecord_Bean,
//     getAllDocuments,
//     DocumentContent_Base
// } from '@sitebud/domain-lib';
// import {DocumentData, FetchOptions, FoundByTagReference} from '../core';
// // import {fetchDocumentDataById} from './fetchDocumentDataById';
//
// export async function fetchDocumentsDataByTag(
//     siteMap: SiteMap_Bean,
//     tag: string,
//     fetchOptions: FetchOptions,
//     nestedLevel: number,
//     locale?: string
// ): Promise<{tagReference?: FoundByTagReference; array: Array<DocumentData>;}> {
//     const resultList: Array<DocumentData> = [];
//     let tagReference: FoundByTagReference | undefined = undefined;
//     if (locale) {
//         const foundDocumentRecords: Array<DocumentRecord_Bean> = getAllDocuments(siteMap.root, (documentRecord: DocumentRecord_Bean) => {
//             const foundDocumentContent: DocumentContent_Base | undefined = documentRecord.contents[locale];
//             return !!foundDocumentContent && foundDocumentContent.tags[tag] >= 1;
//         });
//         tagReference = {name: tag};
//         if (foundDocumentRecords && foundDocumentRecords.length > 0) {
//             for (const documentItem of foundDocumentRecords) {
//                 try {
//                     resultList.push(await fetchDocumentDataById(siteMap, documentItem.id, fetchOptions, nestedLevel, locale));
//                 } catch (e: any) {
//                     console.error(`[SiteBub CMS] ${e.message}`);
//                 }
//             }
//         }
//     }
//     return {tagReference, array: resultList};
// }
