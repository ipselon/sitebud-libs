import {
    Image,
    DocumentContentBlock,
    DocumentRecord_Bean,
    DocumentContent_Base,
    DocumentContent_Bean,
    DocumentType,
} from '@sitebud/domain-lib';
import {
    DocumentData,
    SiteMapIndex
} from './types';
import {imageResolverInstance} from './imageResolver';
import {isRestrictedBlock} from './documentDataUtility';
import {
    documentDataDefault,
    cloneDeep
} from './defaultBeans';

export function makeSiteIndex(
    root: DocumentRecord_Bean,
    accumulator: SiteMapIndex = {},
    defaultLocale: string,
    locale?: string,
    rootNodePath?: Array<DocumentRecord_Bean>
): SiteMapIndex {
    let accumulatorLocal: SiteMapIndex = {...accumulator};
    let slugPath: string = '';
    const validLocale: string = locale || defaultLocale;
    const localNodePath: Array<DocumentRecord_Bean> = rootNodePath ? [...rootNodePath, root] : [root];
    if (localNodePath.length > 0) {
        localNodePath.forEach((nodeItem: DocumentRecord_Bean) => {
            let content: DocumentContent_Base | undefined = nodeItem.contents[validLocale];
            if (content) {
                slugPath += `/${content.slug}`;
            } else {
                content = nodeItem.contents[defaultLocale];
                if (content) {
                    slugPath += `/${content.slug}`;
                }
            }
        });
    }
    let rootContent: DocumentContent_Base | undefined = root.contents[validLocale];
    accumulatorLocal[root.id] = {
        nodePath: rootContent ? slugPath.replace('/@site/', '/') : '',
        node: root,
        slug: rootContent?.slug,
        title: rootContent?.title
    };
    if (root.children && root.children.length > 0) {
        let childDocument: DocumentRecord_Bean;
        for (childDocument of root.children) {
            accumulatorLocal = makeSiteIndex(
                childDocument,
                accumulatorLocal,
                defaultLocale,
                locale,
                [...localNodePath]
            );
        }
    }
    return accumulatorLocal;
}

async function setupSources(documentContentBlock: DocumentContentBlock): Promise<void> {
    const {components} = documentContentBlock;
    if (components && components.length > 0) {
        for (const component of components) {
            const {instances} = component;
            if (instances && instances.length > 0) {
                for (const instance of instances) {
                    const {props} = instance;
                    if (props && props.length > 0) {
                        for (const prop of props) {
                            const {type, fieldContent} = prop;
                            if (type === 'Image') {
                                (fieldContent as Image).src = await imageResolverInstance((fieldContent as Image).src);
                            }
                        }
                    }
                }
            }
        }
    }
}

async function processBlocks(blocks: Array<DocumentContentBlock>): Promise<void> {
    if (blocks && blocks.length > 0) {
        for (const documentContentBlock of blocks) {
            await setupSources(documentContentBlock);
        }
    }
}

export async function createDocumentData(
    documentClass: string,
    documentContent: DocumentContent_Bean,
    documentId: string,
    documentType: DocumentType,
    locale: string,
    documentPath: string,
): Promise<DocumentData> {
    const newDocumentData: DocumentData = cloneDeep(documentDataDefault);
    let restrictedAreasCount: number = 0;
    if (documentContent.documentAreas && documentContent.documentAreas.length > 0) {
        for (const documentArea of documentContent.documentAreas) {
            if (isRestrictedBlock(documentArea.blocks)) {
                restrictedAreasCount++;
            }
            await processBlocks(documentArea.blocks);
        }
    }
    newDocumentData.id = documentId || null;
    newDocumentData.path = documentPath || null;
    newDocumentData.content = documentContent || null;
    if (newDocumentData.content) {
        delete newDocumentData.content.isCustomSlug;
        delete newDocumentData.content.statusMap;
    }
    newDocumentData.locale = locale || null;
    newDocumentData.name = documentClass || null;
    newDocumentData.type = documentType || null;
    newDocumentData.hasRestrictedAreas = restrictedAreasCount > 0;
    return newDocumentData;
}

// export function enhanceDocumentData(
//     siteIndex: SiteMapIndex,
//     documentData: DocumentData
// ): DocumentData {
//     if (documentData.id) {
//         documentData.path = siteIndex[documentData.id].nodePath || null;
//     }
//     const {
//         documentDataListByParentId,
//         documentDataById,
//     } = documentData;
//     if (documentDataById) {
//         for (const documentDataItem of Object.entries(documentDataById)) {
//             const itemId: string | null = documentDataItem[1]?.item?.id || null;
//             if (itemId && documentDataItem[1].item) {
//                 documentDataItem[1].item.path = siteIndex[itemId].nodePath || null;
//             }
//         }
//     }
//     if (documentDataListByParentId) {
//         for (const documentDataParentItem of Object.entries(documentDataListByParentId)) {
//             if (documentDataParentItem[1].parentReference) {
//                 if (documentDataParentItem[1].parentReference.id && siteIndex[documentDataParentItem[1].parentReference.id]) {
//                     documentDataParentItem[1].parentReference.path = siteIndex[documentDataParentItem[1].parentReference.id].nodePath;
//                 }
//             }
//             if (documentDataParentItem[1].array && documentDataParentItem[1].array.length > 0) {
//                 for (const documentDataItem of documentDataParentItem[1].array) {
//                     if (documentDataItem.id && siteIndex[documentDataItem.id]) {
//                         documentDataItem.path = siteIndex[documentDataItem.id].nodePath || null;
//                     }
//                 }
//             }
//         }
//     }
//     return documentData;
// }
