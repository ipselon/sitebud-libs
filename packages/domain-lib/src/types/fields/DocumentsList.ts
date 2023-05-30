export type DocumentsListSelectionMode =
    'selectChildrenDocuments'
    | 'selectDocuments';

export type DocumentsList = {
    selectionMode: DocumentsListSelectionMode;
    documentsIds?: Array<string>;
    selectDocumentClasses?: Array<string>;
    allowedDocumentClasses?: Array<string>;
    itemsLimit?: number;
};
