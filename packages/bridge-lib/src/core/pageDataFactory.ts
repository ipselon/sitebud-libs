import {Image, DocumentContentBlock, DocumentsList} from '@sitebud/domain-lib';
import {PageData, DocumentContext} from './types';
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

async function processBlocks(blocks: Array<DocumentContentBlock>, newPageData: PageData): Promise<void> {
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
                                                    newPageData.pageDataListByParentId = newPageData.pageDataListByParentId || {};
                                                    newPageData.pageDataListByParentId[parentDocumentId] = null;
                                                }
                                            } else if (selectionMode === 'selectDocuments') {
                                                for (const documentId of documentsIds) {
                                                    newPageData.pageDataById = newPageData.pageDataById || {};
                                                    newPageData.pageDataById[documentId] = null;
                                                }
                                            }
                                        }
                                    } else if (type === 'TagsList') {
                                        const {tags} = fieldContent as TagsList;
                                        if (tags && tags.length > 0) {
                                            for (const tag of tags) {
                                                newPageData.pageDataListByTag = newPageData.pageDataListByTag || {};
                                                newPageData.pageDataListByTag[tag] = null;
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

export async function createPageData(documentContext: DocumentContext): Promise<PageData> {
    const newPageData: PageData = {};
    if (documentContext) {
        const {documentClass, documentContent, siteMap, locale} = documentContext;
        if (documentContent.documentAreas && documentContent.documentAreas.length > 0) {
            for (const documentArea of documentContent.documentAreas) {
                await processBlocks(documentArea.blocks, newPageData);
            }
        }
        if (documentContent.commonAreas && documentContent.commonAreas.length > 0) {
            for (const commonArea of documentContent.commonAreas) {
                await processBlocks(commonArea.blocks, newPageData);
            }
        }
        newPageData.generalSettings = siteMap.generalSettings;
        newPageData.content = documentContent;
        newPageData.locale = locale;
        newPageData.name = documentClass;
    }

    return newPageData;
}