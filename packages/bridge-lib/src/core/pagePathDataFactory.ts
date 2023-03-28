import {DocumentRecord_Bean, DocumentContent_Base} from '@sitebud/domain-lib';
import {PagePathData, SiteMapDataContext_Proxy} from './types';

function traverseTree(root: DocumentRecord_Bean): Array<PagePathData> {
    let accumulatorLocal: Array<PagePathData> = [];
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

export function createPagePathDataList(contextProxy: SiteMapDataContext_Proxy): Array<PagePathData> {
    let result: Array<PagePathData> = [];
    const {siteMap} = contextProxy;
    if (siteMap) {
        result = traverseTree(siteMap.root);
    }
    return result;
}
