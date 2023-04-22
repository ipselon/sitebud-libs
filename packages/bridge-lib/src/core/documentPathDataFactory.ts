import {DocumentRecord_Bean, DocumentContent_Base, SiteMap_Bean} from '@sitebud/domain-lib';
import {DocumentPathData, SiteMapDataContext_Proxy} from './types';

function traverseTree(root: DocumentRecord_Bean): Array<DocumentPathData> {
    let accumulatorLocal: Array<DocumentPathData> = [];
    if (root.type !== 'site') {
        let content: DocumentContent_Base | undefined;
        Object.keys(root.contents).forEach((locale: string) => {
            content = root.contents[locale];
            if (content) {
                accumulatorLocal.push({
                    params: {
                        route_path: [content.slug]
                    },
                    locale
                });
            }
        });
    }
    if (root.children && root.children.length > 0) {
        let childDocument: DocumentRecord_Bean;
        for (childDocument of root.children) {
            accumulatorLocal = accumulatorLocal.concat(traverseTree(childDocument));
        }
    }
    return accumulatorLocal;
}

export function createDocumentPathDataList(siteMap: SiteMap_Bean): Array<DocumentPathData> {
    let result: Array<DocumentPathData> = [];
    if (siteMap) {
        result = traverseTree(siteMap.root);
    }
    return result;
}
