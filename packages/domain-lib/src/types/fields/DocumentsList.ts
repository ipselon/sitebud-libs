export type DocumentsListSelectionMode = 'selectChildrenDocuments' | 'selectDocuments' | 'selectTags';

export type DocumentsList = {
    selectionMode: DocumentsListSelectionMode;
    documentsIds?: Array<string>;
    tags?: Array<string>;
    isRequired?: boolean;
    selectDocumentAreas?: Array<string>;
    allowedDocumentClasses?: Array<string>;
    itemsLimit?: number;
};
