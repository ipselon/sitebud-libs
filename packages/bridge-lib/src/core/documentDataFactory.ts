import {
    Image,
    DocumentContentBlock,
    DocumentsList,
    DocumentRecord_Bean,
    DocumentContent_Base,
    TagsList, SiteMap_Bean
} from '@sitebud/domain-lib';
import {DocumentData, DocumentContext, SiteMap_Index} from './types';
import {imageResolverInstance} from './imageResolver';

export function makeSiteIndex(
    root: DocumentRecord_Bean,
    accumulator: SiteMap_Index = {},
    defaultLocale: string,
    locale?: string,
    rootNodePath?: Array<DocumentRecord_Bean>
): SiteMap_Index {
    let accumulatorLocal: SiteMap_Index = {...accumulator};
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
    accumulatorLocal[root.id] = {
        nodePath: root.contents[validLocale] ? slugPath.replace('/@site/', '') : '',
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
        for(const component of components) {
            const {instances} = component;
            if (instances && instances.length > 0) {
                for(const instance of instances) {
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

async function processBlocks(blocks: Array<DocumentContentBlock>, newDocumentData: DocumentData): Promise<void> {
    if (blocks && blocks.length > 0) {
        for (const documentContentBlock of blocks) {
            await setupSources(documentContentBlock);
            if (documentContentBlock.components && documentContentBlock.components.length > 0) {
                for (const documentContentBlockComponent of documentContentBlock.components) {
                    if (documentContentBlockComponent.instances && documentContentBlockComponent.instances.length > 0) {
                        for (const componentInstance of documentContentBlockComponent.instances) {
                            if (componentInstance.props && componentInstance.props.length > 0) {
                                for (const instanceProp of componentInstance.props) {
                                    const {type, fieldContent} = instanceProp;
                                    if (type === 'DocumentsList') {
                                        const {documentsIds, selectionMode} = fieldContent as DocumentsList;
                                        if (documentsIds && documentsIds.length > 0) {
                                            if (selectionMode === 'selectChildrenDocuments') {
                                                for (const parentDocumentId of documentsIds) {
                                                    newDocumentData.documentDataListByParentId = newDocumentData.documentDataListByParentId || {};
                                                    newDocumentData.documentDataListByParentId[parentDocumentId] = null;
                                                }
                                            } else if (selectionMode === 'selectDocuments') {
                                                for (const documentId of documentsIds) {
                                                    newDocumentData.documentDataById = newDocumentData.documentDataById || {};
                                                    newDocumentData.documentDataById[documentId] = null;
                                                }
                                            }
                                        }
                                    } else if (type === 'TagsList') {
                                        const {tags} = fieldContent as TagsList;
                                        if (tags && tags.length > 0) {
                                            for (const tag of tags) {
                                                newDocumentData.documentDataListByTag = newDocumentData.documentDataListByTag || {};
                                                newDocumentData.documentDataListByTag[tag] = null;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

export async function createDocumentData(documentContext: DocumentContext): Promise<DocumentData> {
    const newDocumentData: DocumentData = {};
    if (documentContext) {
        const {documentClass, documentContent, siteMap, locale, documentId} = documentContext;
        if (documentContent.documentAreas && documentContent.documentAreas.length > 0) {
            for (const documentArea of documentContent.documentAreas) {
                await processBlocks(documentArea.blocks, newDocumentData);
            }
        }
        if (documentContent.commonAreas && documentContent.commonAreas.length > 0) {
            for (const commonArea of documentContent.commonAreas) {
                await processBlocks(commonArea.blocks, newDocumentData);
            }
        }
        newDocumentData.id = documentId;
        newDocumentData.generalSettings = siteMap.generalSettings;
        newDocumentData.content = documentContent;
        newDocumentData.locale = locale;
        newDocumentData.name = documentClass;
    }

    return newDocumentData;
}

export function enhanceDocumentData(documentData: DocumentData, siteMap: SiteMap_Bean, locale?: string): DocumentData {
    const siteIndex: SiteMap_Index = makeSiteIndex(siteMap.root, {}, siteMap.defaultLocale, locale);
    if (documentData.id) {
        documentData.path = siteIndex[documentData.id].nodePath;
    }
    const {documentDataListByParentId, documentDataById, documentDataListByTag} = documentData;
    if (documentDataById) {
        for(const documentDataItem of Object.entries(documentDataById)) {
            if (documentDataItem[1] && documentDataItem[1].id && siteIndex[documentDataItem[1].id]) {
                documentDataItem[1].path = siteIndex[documentDataItem[1].id].nodePath;
            }
        }
    }
    if (documentDataListByParentId) {
        for(const documentDataParentItem of Object.entries(documentDataListByParentId)) {
            if (documentDataParentItem[1] && documentDataParentItem[1].length > 0) {
                for (const documentDataItem of documentDataParentItem[1]) {
                    if (documentDataItem.id && siteIndex[documentDataItem.id]) {
                        documentDataItem.path = siteIndex[documentDataItem.id].nodePath;
                    }
                }
            }
        }
    }
    if (documentDataListByTag) {
        for(const documentDataTagItem of Object.entries(documentDataListByTag)) {
            if (documentDataTagItem[1] && documentDataTagItem[1].length > 0) {
                for (const documentDataItem of documentDataTagItem[1]) {
                    if (documentDataItem.id && siteIndex[documentDataItem.id]) {
                        documentDataItem.path = siteIndex[documentDataItem.id].nodePath;
                    }
                }
            }
        }
    }
    documentData.tagsLinks = {};
    if (siteMap.tagsLinks) {
        const validLocale: string = locale || siteMap.defaultLocale;
        const localeTagsLinks: Record<string, string> | undefined = siteMap.tagsLinks[validLocale];
        if (localeTagsLinks) {
            for (const tagLink of Object.entries(localeTagsLinks)) {
                documentData.tagsLinks[tagLink[0]] = siteIndex[tagLink[1]].nodePath;
            }
        }
    }
    return documentData;
}

