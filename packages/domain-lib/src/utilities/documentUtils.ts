import {
    DocumentContentBlock,
    DocumentContentBlockComponent,
    DocumentContentBlockComponentInstance,
    DocumentContentBlockComponentField,
    Document_Bean,
    DocumentContent_Bean,
    DocumentContentArea
} from '../types';

export function iterateDocumentContents(
    document: Document_Bean,
    visitor: (content: DocumentContent_Bean, contentLocale?: string) => void
): void {
    if (document && document.contents) {
        for (const contentItem of Object.entries(document.contents)) {
            visitor(contentItem[1], contentItem[0]);
        }
    }
}

export function iterateDocumentContentAreas(
    documentContentAreas: Array<DocumentContentArea>,
    visitor: (entry: DocumentContentArea) => void
): void {
    if (documentContentAreas && documentContentAreas.length > 0) {
        for (const entryItem of documentContentAreas) {
            visitor(entryItem);
        }
    }
}

export function iterateDocumentContentAreaBlocks(
    documentContentAreaBlocks: Array<DocumentContentBlock>,
    visitor: (entry: DocumentContentBlock) => void
): void {
    if (documentContentAreaBlocks && documentContentAreaBlocks.length > 0) {
        for (const entryItem of documentContentAreaBlocks) {
            visitor(entryItem);
        }
    }
}

export function iterateDocumentContentAreaBlockComponents(
    documentContentAreaBlockComponents: Array<DocumentContentBlockComponent>,
    visitor: (entry: DocumentContentBlockComponent) => void,
): void {
    if (documentContentAreaBlockComponents && documentContentAreaBlockComponents.length > 0) {
        for (const entryItem of documentContentAreaBlockComponents) {
            visitor(entryItem);
        }
    }
}

export function iterateDocumentContentAreaBlockComponentInstances(
    documentContentAreaBlockComponentInstances: Array<DocumentContentBlockComponentInstance>,
    visitor: (entry: DocumentContentBlockComponentInstance) => void
): void {
    if (documentContentAreaBlockComponentInstances && documentContentAreaBlockComponentInstances.length > 0) {
        for (const entryItem of documentContentAreaBlockComponentInstances) {
            visitor(entryItem);
        }
    }
}

export function iterateDocumentContentAreaBlockComponentFields(
    documentContentAreaBlockComponentFields: Array<DocumentContentBlockComponentField>,
    visitor: (entry: DocumentContentBlockComponentField) => void
): void {
    if (documentContentAreaBlockComponentFields && documentContentAreaBlockComponentFields.length > 0) {
        for (const entryItem of documentContentAreaBlockComponentFields) {
            visitor(entryItem);
        }
    }
}
