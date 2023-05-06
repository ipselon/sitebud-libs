import {DocumentContentArea, DocumentContentBlock} from '@sitebud/domain-lib';

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
                testDocumentArea.blocks = testDocumentArea.blocks.filter(i => i.accessLevel === undefined);
            }
        }
    }
    return areas;
}