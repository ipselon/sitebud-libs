import {
    SiteMap_Bean,
    DocumentRecord_Bean,
    findDocument, DocumentContent_Base
} from '@sitebud/domain-lib';
import {DocumentData, FetchOptions, FoundByParentReference} from '../core/types';
import {fetchDocumentDataById} from './fetchDocumentDataById';

export async function fetchDocumentsDataByParentId(
    siteMap: SiteMap_Bean,
    parentDocumentId: string,
    fetchOptions: FetchOptions,
    nestedLevel: number,
    locale?: string
): Promise<{parentReference?: FoundByParentReference; array: Array<DocumentData>;}> {
    const resultList: Array<DocumentData> = [];
    let parentReference: FoundByParentReference | undefined = undefined;
    const foundParentDocumentRecord: DocumentRecord_Bean | undefined = findDocument(siteMap.root, parentDocumentId);
    if (foundParentDocumentRecord && foundParentDocumentRecord.children && foundParentDocumentRecord.children.length > 0) {
        const foundDocumentContent: DocumentContent_Base | undefined = foundParentDocumentRecord.contents[locale || siteMap.defaultLocale];
        if (foundDocumentContent) {
            parentReference = {
                id: foundParentDocumentRecord.id,
                title: foundDocumentContent.title,
                slug: foundDocumentContent.slug
            }
        }
        const {requiredDocumentClasses} = fetchOptions;
        const filteredChildren = requiredDocumentClasses && requiredDocumentClasses.length > 0
            ? foundParentDocumentRecord.children.filter(i => requiredDocumentClasses.includes(i.documentClass))
            : foundParentDocumentRecord.children;
        for (const documentItem of filteredChildren) {
            try {
                resultList.push(await fetchDocumentDataById(siteMap, documentItem.id, fetchOptions, nestedLevel, locale));
            } catch (e: any) {
                console.error(`[SiteBub CMS] ${e.message}`);
            }
        }
    }
    return {parentReference, array: resultList};
}
