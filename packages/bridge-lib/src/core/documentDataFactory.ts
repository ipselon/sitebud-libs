import {Image, DocumentContentBlock, DocumentsList} from '@sitebud/domain-lib';
import {DocumentData, DocumentContext} from './types';
import {imageResolverInstance} from './imageResolver';
import {TagsList} from '@sitebud/domain-lib/src';

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
        const {documentClass, documentContent, siteMap, locale} = documentContext;
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
        newDocumentData.generalSettings = siteMap.generalSettings;
        newDocumentData.content = documentContent;
        newDocumentData.locale = locale;
        newDocumentData.name = documentClass;
    }

    return newDocumentData;
}