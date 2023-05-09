import {DocumentRecord_Bean, DocumentContent_Base, SiteMap_Bean} from '@sitebud/domain-lib';
import {DocumentPathData, SiteMapDataContext_Proxy} from './types';

function traverseTree(root: DocumentRecord_Bean, prevPathDataMap: Record<string, DocumentPathData> = {}): Array<DocumentPathData> {
    let accumulatorLocal: Array<DocumentPathData> = [];
    const pathDataMap: Record<string, DocumentPathData> = {};
    if (root.type !== 'site') {
        let content: DocumentContent_Base | undefined;
        let prevPathData: DocumentPathData | undefined;
        let currentPathData: DocumentPathData;
        let routePath: Array<string>;
        Object.keys(root.contents).forEach((locale: string) => {
            content = root.contents[locale];
            if (content) {
                prevPathData = prevPathDataMap[locale];
                if (prevPathData) {
                    routePath = [...prevPathData.params.route_path, content.slug];
                } else {
                    routePath = [content.slug];
                }
                currentPathData = {
                    params: {
                        route_path: routePath
                    },
                    locale
                };
                pathDataMap[locale] = currentPathData;
                accumulatorLocal.push(currentPathData);
            }
        });
    }
    if (root.children && root.children.length > 0) {
        let childDocument: DocumentRecord_Bean;
        for (childDocument of root.children) {
            accumulatorLocal = accumulatorLocal.concat(traverseTree(childDocument, pathDataMap));
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
