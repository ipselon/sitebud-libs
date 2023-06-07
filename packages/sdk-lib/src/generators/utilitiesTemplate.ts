export const utilitiesTemplate: string = `import {DocumentsListField, DocumentContentContext, DocumentNode} from './types';

export function getDocumentNodeList(
    documentsMap: Record<string, DocumentNode>,
    documentListField?: DocumentsListField,
): Array<DocumentNode> {
    const resultList: Array<DocumentNode> = [];
    if (documentListField) {
        const {documentIds, parentDocumentIds} = documentListField;
        if ((documentIds || parentDocumentIds) && documentsMap) {
            if (documentIds) {
                for (const documentId of documentIds) {
                    const foundDocumentNode: DocumentNode | undefined = documentsMap[documentId];
                    if (foundDocumentNode) {
                        resultList.push(foundDocumentNode);
                    }
                }
            } else if (parentDocumentIds) {
                for (const parentDocumentId of parentDocumentIds) {
                    const foundDocumentNode: DocumentNode | undefined = documentsMap[parentDocumentId];
                    if (
                        foundDocumentNode &&
                        foundDocumentNode.children &&
                        foundDocumentNode.children.length > 0
                    ) {
                        for (const childDocumentNode of foundDocumentNode.children) {
                            resultList.push(childDocumentNode);
                        }
                    }
                }
            }
        }
    }
    return resultList;
}

export function getDocumentContentContextList(
    documentsMap: Record<string, DocumentNode>,
    documentListField?: DocumentsListField,
): Array<DocumentContentContext> {
    const resultList: Array<DocumentContentContext> = [];
    const documentNodeList: Array<DocumentNode> = getDocumentNodeList(documentsMap, documentListField);
    if (documentNodeList.length > 0) {
        for (const documentNode of documentNodeList) {
            if (documentNode.documentContentContext) {
                resultList.push(documentNode.documentContentContext);
            }
        }
    }
    return resultList;
}
`;