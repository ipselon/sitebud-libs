import {
    DocumentRecord_Bean,
    DocumentContent_Base,
} from '../types';

type DocumentWithUrl = { document: DocumentRecord_Bean | undefined; url: string; };

export function findDocument(root: DocumentRecord_Bean, documentId: string): DocumentRecord_Bean | undefined {
    if (root.id === documentId) {
        return root;
    } else {
        let foundDocument: DocumentRecord_Bean | undefined;
        if (root.children && root.children.length > 0) {
            let childDocument: DocumentRecord_Bean;
            for (childDocument of root.children) {
                foundDocument = findDocument(childDocument, documentId);
                if (foundDocument) {
                    break;
                }
            }
        }
        return foundDocument;
    }
}

export function findDocumentWithUrl(root: DocumentRecord_Bean, documentId: string, locale: string, url: string = ''): DocumentWithUrl | undefined {
    let accUrl: string = '';
    if (root.type !== 'site') {
        const content: DocumentContent_Base | undefined = root.contents[locale];
        if (!content) {
            throw Error(`Missing document with "${locale}" locale.`);
        }
        accUrl = url ? `${url}/${content.slug}` : content.slug;
    } else {
        accUrl = '@site';
    }
    if (root.id === documentId) {
        return { document: root, url: accUrl.replace('@site', '') };
    } else {
        let foundDocument: DocumentWithUrl | undefined;
        if (root.children && root.children.length > 0) {
            let childDocument: DocumentRecord_Bean;
            for (childDocument of root.children) {
                foundDocument = findDocumentWithUrl(childDocument, documentId, locale, accUrl);
                if (foundDocument) {
                    break;
                }
            }
        }
        return foundDocument;
    }
}

export function getAllDocuments(root: DocumentRecord_Bean, testFunc: (record: DocumentRecord_Bean) => boolean): Array<DocumentRecord_Bean> {
    let localResultList: Array<DocumentRecord_Bean> = testFunc(root)
        ? [root]
        : [];
    if (root.children && root.children.length > 0) {
        let childDocument: DocumentRecord_Bean;
        for (childDocument of root.children) {
            localResultList = localResultList.concat(getAllDocuments(childDocument, testFunc));
        }
    }
    return localResultList;
}

