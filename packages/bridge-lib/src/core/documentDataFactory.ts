import {
    Image,
    DocumentContentBlock,
    DocumentsList,
    DocumentRecord_Bean,
    DocumentContent_Base,
    TagsList,
    SiteMap_Bean
} from '@sitebud/domain-lib';
import {DocumentData, DocumentContext, SiteMap_Index} from './types';
import {imageResolverInstance} from './imageResolver';
import {isRestrictedBlock} from './documentDataUtility';

const BASE_URL: string | undefined = process.env.SB_WEBSITE_BASE_URL;

export function getAllLocales(root: DocumentRecord_Bean): Record<string, boolean> {
    let localResult: Record<string, boolean> = {};
    Object.keys(root.contents).forEach(locale => {
        localResult[locale] = true;
    });
    if (root.children && root.children.length > 0) {
        let childDocument: DocumentRecord_Bean;
        for (childDocument of root.children) {
            localResult = {...localResult, ...getAllLocales(childDocument)};
        }
    }
    return localResult;
}

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
        nodePath: root.contents[validLocale] ? slugPath.replace('/@site/', '/') : '',
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
                                        const {
                                            documentsIds,
                                            tags,
                                            selectionMode,
                                            selectDocumentAreas
                                        } = fieldContent as DocumentsList;
                                        if (selectionMode) {
                                            if (selectionMode === 'selectChildrenDocuments') {
                                                if (documentsIds && documentsIds.length > 0) {
                                                    for (const parentDocumentId of documentsIds) {
                                                        newDocumentData.documentDataListByParentId = newDocumentData.documentDataListByParentId || {};
                                                        newDocumentData.documentDataListByParentId[parentDocumentId] =
                                                            {options: {documentAreas: selectDocumentAreas || []}};
                                                    }
                                                }
                                            } else if (selectionMode === 'selectDocuments') {
                                                if (documentsIds && documentsIds.length > 0) {
                                                    for (const documentId of documentsIds) {
                                                        newDocumentData.documentDataById = newDocumentData.documentDataById || {};
                                                        newDocumentData.documentDataById[documentId] = {options: {documentAreas: selectDocumentAreas || []}};
                                                    }
                                                }
                                            } else if (selectionMode === 'selectTags') {
                                                if (tags && tags.length > 0) {
                                                    for (const tag of tags) {
                                                        newDocumentData.documentDataListByTag = newDocumentData.documentDataListByTag || {};
                                                        newDocumentData.documentDataListByTag[tag] = {options: {documentAreas: selectDocumentAreas || []}};
                                                    }
                                                }
                                            }
                                        }
                                    } else if (type === 'TagsList') {
                                        const {tags} = fieldContent as TagsList;
                                        if (tags && tags.length > 0) {
                                            for (const tag of tags) {
                                                newDocumentData.documentDataListByTag = newDocumentData.documentDataListByTag || {};
                                                newDocumentData.documentDataListByTag[tag] = {options: {documentAreas: []}};
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
        const {documentClass, documentContent, locale, documentId, documentType} = documentContext;
        if (documentContent.dataFields && documentContent.dataFields.length > 0) {
            for(const dataField of documentContent.dataFields) {
                if (dataField.type === 'string' && dataField.value && dataField.value.startsWith("/_assets/images")) {
                    dataField.value = await imageResolverInstance(dataField.value);
                }
            }
        }
        let restrictedAreasCount: number = 0;
        if (documentContent.documentAreas && documentContent.documentAreas.length > 0) {
            for (const documentArea of documentContent.documentAreas) {
                if (isRestrictedBlock(documentArea.blocks)) {
                    restrictedAreasCount++;
                }
                await processBlocks(documentArea.blocks, newDocumentData);
            }
        }
        newDocumentData.id = documentId;
        newDocumentData.content = documentContent;
        newDocumentData.locale = locale;
        newDocumentData.name = documentClass;
        newDocumentData.type = documentType;
        newDocumentData.baseUrl = BASE_URL;
        newDocumentData.hasRestrictedAreas = restrictedAreasCount > 0;
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
            const itemId: string | undefined = documentDataItem[1]?.item?.id;
            if (itemId && documentDataItem[1].item) {
                documentDataItem[1].item.path = siteIndex[itemId].nodePath;
            }
        }
    }
    if (documentDataListByParentId) {
        for(const documentDataParentItem of Object.entries(documentDataListByParentId)) {
            if (documentDataParentItem[1].array && documentDataParentItem[1].array.length > 0) {
                for (const documentDataItem of documentDataParentItem[1].array) {
                    if (documentDataItem.id && siteIndex[documentDataItem.id]) {
                        documentDataItem.path = siteIndex[documentDataItem.id].nodePath;
                    }
                }
            }
        }
    }
    if (documentDataListByTag) {
        for(const documentDataTagItem of Object.entries(documentDataListByTag)) {
            if (documentDataTagItem[1].array && documentDataTagItem[1].array.length > 0) {
                for (const documentDataItem of documentDataTagItem[1].array) {
                    if (documentDataItem.id && siteIndex[documentDataItem.id]) {
                        documentDataItem.path = siteIndex[documentDataItem.id].nodePath;
                    }
                }
            }
        }
    }
    documentData.tagsLinks = {};
    if (documentData.type === 'site') {
        const validLocale: string = locale || siteMap.defaultLocale;
        if (siteMap.tagsLinks) {
            const localeTagsLinks: Record<string, string> | undefined = siteMap.tagsLinks[validLocale];
            if (localeTagsLinks) {
                for (const tagLink of Object.entries(localeTagsLinks)) {
                    if (siteIndex[tagLink[1]]) {
                        documentData.tagsLinks[tagLink[0]] = siteIndex[tagLink[1]].nodePath;
                    }
                }
            }
        }
        documentData.availableLocales = Object.keys(getAllLocales(siteMap.root));
    }
    return documentData;
}

