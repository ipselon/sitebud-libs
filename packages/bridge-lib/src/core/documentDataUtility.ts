import {
    DocumentContentArea,
    DocumentContentBlock,
    DocumentsList,
    DocumentRecord_Bean,
    iterateDocumentContentAreas,
    iterateDocumentContentAreaBlocks,
    iterateDocumentContentAreaBlockComponents,
    iterateDocumentContentAreaBlockComponentInstances,
    iterateDocumentContentAreaBlockComponentFields
} from '@sitebud/domain-lib';
import {SiteMapIndex} from './types';

export function isRestrictedBlock(blocks: Array<DocumentContentBlock>): boolean {
    return blocks
        && blocks.length > 0
        && blocks.findIndex(testBlock => testBlock.accessLevel && testBlock.accessLevel > 0) >= 0;
}

export function findRestrictedBlockIndex(blocks: Array<DocumentContentBlock>, accessLevel: number): number {
    return blocks.findIndex(testBlock => {
        return testBlock.accessLevel && testBlock.accessLevel > 0 && testBlock.accessLevel > accessLevel;
    });
}

export function removeRestrictedBlocks(
    areas: Array<DocumentContentArea>,
    accessLevel: number
): Array<DocumentContentArea> {
    for (const testDocumentArea of areas) {
        if (testDocumentArea.blocks && testDocumentArea.blocks.length > 0) {
            const restrictedBlockIndex = findRestrictedBlockIndex(testDocumentArea.blocks, accessLevel);
            if (restrictedBlockIndex > 0) {
                let newBlocks: Array<DocumentContentBlock> = testDocumentArea.blocks.slice(0, restrictedBlockIndex);
                newBlocks = newBlocks.filter(i => i.accessLevel === undefined);
                newBlocks.push(testDocumentArea.blocks[restrictedBlockIndex]);
                testDocumentArea.blocks = newBlocks;
            } else {
                testDocumentArea.blocks = testDocumentArea.blocks.filter((i: DocumentContentBlock) => i.accessLevel === undefined);
            }
        }
    }
    return areas;
}

export function filterAreas(
    areas: Array<DocumentContentArea>,
    requiredDocumentAreas?: Array<string>
): Array<DocumentContentArea> {
    if (requiredDocumentAreas && requiredDocumentAreas.length > 0) {
        if (requiredDocumentAreas.includes('*')) {
            return areas;
        }
        return areas.filter(a => requiredDocumentAreas.includes(a.name));
    } else {
        return [];
    }
}

export function clearIds(
    areas: Array<DocumentContentArea>,
): Array<DocumentContentArea> {
    for (const documentArea of areas) {
        if (documentArea.blocks && documentArea.blocks.length > 0) {
            for (const documentContentBlock of documentArea.blocks) {
                if (documentContentBlock.id) {
                    delete documentContentBlock.id;
                }
                if (documentContentBlock.components && documentContentBlock.components.length > 0) {
                    for (const documentContentBlockComponent of documentContentBlock.components) {
                        if (documentContentBlockComponent.instances && documentContentBlockComponent.instances.length > 0) {
                            for (const instance of documentContentBlockComponent.instances) {
                                if (instance.id) {
                                    delete instance.id;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return areas;
}

export function getLinkedDocumentIds(areas: Array<DocumentContentArea>, siteIndex: SiteMapIndex): Array<string> {
    let resultIds: Array<string> = [];
    iterateDocumentContentAreas(areas, (area) => {
        iterateDocumentContentAreaBlocks(area.blocks, (block) => {
            iterateDocumentContentAreaBlockComponents(block.components, (component) => {
                iterateDocumentContentAreaBlockComponentInstances(component.instances, (instance) => {
                    iterateDocumentContentAreaBlockComponentFields(instance.props, (property) => {
                        if (property) {
                            const {fieldContent, type} = property;
                            if (type === 'DocumentsList') {
                                const {
                                    documentsIds,
                                    selectionMode,
                                    selectDocumentClasses
                                } = fieldContent as DocumentsList;
                                if (documentsIds && documentsIds.length > 0) {
                                    for (const documentId of documentsIds) {
                                        const foundIndexRecord: DocumentRecord_Bean | undefined = siteIndex[documentId].node;
                                        if (foundIndexRecord) {
                                            if (selectionMode === 'selectChildrenDocuments') {
                                                if (foundIndexRecord.children && foundIndexRecord.children.length > 0) {
                                                    const filteredChildren: Array<DocumentRecord_Bean> = selectDocumentClasses && selectDocumentClasses.length > 0
                                                        ? foundIndexRecord.children.filter(
                                                            i => selectDocumentClasses.includes(i.documentClass)
                                                        )
                                                        : foundIndexRecord.children;
                                                    resultIds = resultIds.concat(filteredChildren.map(i => i.id));
                                                }
                                            } else if (selectionMode === 'selectDocuments') {
                                                resultIds.push(foundIndexRecord.id);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    });
                });
            });
        });
    });
    return resultIds;
}