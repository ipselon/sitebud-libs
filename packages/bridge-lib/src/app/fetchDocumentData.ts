import {
    DocumentRecord_Bean,
    SiteMap_Bean,
} from '@sitebud/domain-lib';
import {fetchDocumentDataById} from './fetchDocumentDataById';
import {DocumentDataFetchingStatus} from './types';

function findDocument(root: DocumentRecord_Bean, documentSlug: string, locale: string): DocumentRecord_Bean | undefined {
    const foundContent = root.contents[locale];
    if (foundContent && foundContent.slug === documentSlug) {
        return root;
    } else {
        let foundDocument: DocumentRecord_Bean | undefined;
        if (root.children && root.children.length > 0) {
            let childDocument: DocumentRecord_Bean;
            for (childDocument of root.children) {
                foundDocument = findDocument(childDocument, documentSlug, locale);
                if (foundDocument) {
                    break;
                }
            }
        }
        return foundDocument;
    }
}

export async function fetchDocumentData(siteMap: SiteMap_Bean, locale?: string, documentSlug?: string): Promise<DocumentDataFetchingStatus> {
    let result: DocumentDataFetchingStatus = {};
    try {
        let foundDocument: DocumentRecord_Bean | undefined;
        if (documentSlug) {
            foundDocument = findDocument(siteMap.root, documentSlug, locale || siteMap.defaultLocale);
            if (!foundDocument) {
                foundDocument = findDocument(siteMap.root, documentSlug, siteMap.defaultLocale);
            }
        } else {
            foundDocument = siteMap.root.children.find(i => i.type === 'main_page');
        }
        if (!foundDocument) {
            result.isNotFound = true;
        } else {
            return fetchDocumentDataById(siteMap, foundDocument.id, locale);
        }
    } catch (e: any) {
        result = {
            error: e.message,
            isError: true,
            isNotFound: true
        }
    }
    return result;
}
