export type DocumentsListSelectionMode =
    'selectChildrenDocuments'
    | 'selectDocuments';
    // | 'selectTags';

export type DocumentsList = {
    selectionMode: DocumentsListSelectionMode;
    documentsIds?: Array<string>;
    selectDocumentClasses?: Array<string>;
    selectDocumentAreas?: Array<string>;
    allowedDocumentClasses?: Array<string>;
    itemsLimit?: number;
};
