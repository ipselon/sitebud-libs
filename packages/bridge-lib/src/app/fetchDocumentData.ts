import {
    DocumentRecord_Bean,
    SiteMap_Bean,
} from '@sitebud/domain-lib';
import {DocumentData, FetchOptions} from '../core';
import {fetchDocumentDataById} from './fetchDocumentDataById';

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

export async function fetchDocumentData(
    siteMap: SiteMap_Bean,
    fetchOptions: FetchOptions,
    locale?: string,
    documentSlug?: string
): Promise<DocumentData> {
    let foundDocument: DocumentRecord_Bean | undefined;
    if (documentSlug) {
        foundDocument = findDocument(siteMap.root, documentSlug, locale || siteMap.defaultLocale);
        // if (!foundDocument) {
        //     foundDocument = findDocument(siteMap.root, documentSlug, siteMap.defaultLocale);
        // }
    } else {
        foundDocument = siteMap.root.children.find(i => i.type === 'main_page' && i.contents[locale || siteMap.defaultLocale]);
    }
    if (!foundDocument) {
        throw Error('Document is not found');
    }
    return await fetchDocumentDataById(siteMap, foundDocument.id, fetchOptions, 0, locale);
}
