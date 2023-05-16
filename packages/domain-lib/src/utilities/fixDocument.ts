import {
    Document_Bean,
    DocumentContent_Bean,
    DocumentContentBlock,
    DocumentClass_Index,
    DocumentClass,
    DocumentContentDataFieldClass,
    DocumentContentArea,
    DocumentContentAreaClass,
    DocumentContentBlockClass,
    DocumentContentBlockComponentClass,
    DocumentContentBlockComponentField
} from '../types';
import {
    iterateDocumentContentAreaBlocks,
    iterateDocumentContentAreaBlockComponents,
    iterateDocumentContentAreaBlockComponentInstances,
    iterateDocumentContentAreas,
    iterateDocumentContents
} from './documentUtils';

export function fixDocumentContentBlocks(blocks: Array<DocumentContentBlock>, areaClass?: DocumentContentAreaClass) {
    iterateDocumentContentAreaBlocks(blocks, (block) => {
        const {components, name} = block;
        const foundBlockClass: DocumentContentBlockClass | undefined = areaClass?.blocks[name];
        iterateDocumentContentAreaBlockComponents(components, (component) => {
            const {instances, name} = component;
            const foundComponentClass: DocumentContentBlockComponentClass | undefined = foundBlockClass?.components[name];
            iterateDocumentContentAreaBlockComponentInstances(instances, (instance) => {
                const {props} = instance;
                if (foundComponentClass) {
                    const newProps: Array<DocumentContentBlockComponentField> = [];
                    for (const componentFieldClass of Object.entries(foundComponentClass.props)) {
                        const foundPropIndex: number = props.findIndex(p => p.name === componentFieldClass[0]);
                        if (foundPropIndex >= 0) {
                            newProps.push(props[foundPropIndex]);
                        } else {
                            newProps.push({
                                name: componentFieldClass[0],
                                type: componentFieldClass[1].type,
                                fieldContent: componentFieldClass[1].fieldContent
                            });
                        }
                    }
                    instance.props = newProps;
                }
            });
        });
    });
}

const fixDocumentContent = (documentClass: DocumentClass) => (documentContent?: DocumentContent_Bean): void => {
    if (documentContent) {
        if (!documentContent.dataFields) {
            documentContent.dataFields = [];
        }
        if (!documentContent.documentAreas) {
            documentContent.documentAreas = [];
        }
        (documentContent as any).commonAreas = undefined;
        iterateDocumentContentAreas(documentContent.documentAreas, (area: DocumentContentArea) => {
            if (!area.blocks) {
                area.blocks = [];
            }
            const foundAreaClass: DocumentContentAreaClass | undefined = documentClass.documentAreas[area.name];
            fixDocumentContentBlocks(area.blocks, foundAreaClass);
        });
        if (!documentContent.statusMap) {
            documentContent.statusMap = {};
        }
        if (!documentContent.tags) {
            documentContent.tags = {};
        }
    }
}

const fixDocumentAreas = (documentClass: DocumentClass) => (documentContent?: DocumentContent_Bean): void => {
    if (documentContent) {
        let areaClassTuples: Array<[string, DocumentContentAreaClass]> = Object.entries(documentClass.documentAreas);
        areaClassTuples = areaClassTuples.sort((a, b) => {
            return a[1].indexNumber - b[1].indexNumber;
        });
        let indexNumber: number = 0;
        for (const areaClassTuple of areaClassTuples) {
            const foundIndex: number = documentContent.documentAreas.findIndex(i => i.name === areaClassTuple[0]);
            if (foundIndex < 0) {
                documentContent.documentAreas.splice(indexNumber, 0, {
                    name: areaClassTuple[0],
                    blocks: []
                });
            }
            indexNumber++;
        }
    }
}

const fixDataFields = (documentClass: DocumentClass) => (documentContent?: DocumentContent_Bean): void => {
    if (documentContent && documentClass.dataFields) {
        let dataFieldClassTuples: Array<[string, DocumentContentDataFieldClass]> = Object.entries(documentClass.dataFields);
        dataFieldClassTuples = dataFieldClassTuples.sort((a, b) => {
            return a[1].indexNumber - b[1].indexNumber;
        });
        let indexNumber: number = 0;
        for (const dataFieldClassTuple of dataFieldClassTuples) {
            const foundIndex: number = documentContent.dataFields.findIndex(i => i.name === dataFieldClassTuple[0]);
            if (foundIndex < 0) {
                documentContent.dataFields.splice(indexNumber, 0, {
                    name: dataFieldClassTuple[0],
                    value: dataFieldClassTuple[1].defaultValue || '',
                    type: dataFieldClassTuple[1].dataType
                });
            }
            indexNumber++;
        }
    }
}

export function fixDocument(document: Document_Bean, documentClassIndex: DocumentClass_Index): Document_Bean {
    if (document) {
        const foundDocumentClass: DocumentClass | undefined = documentClassIndex[document.documentClass];
        if (!foundDocumentClass) {
            throw Error(`Can not find ${document.documentClass} document class.`);
        }
        iterateDocumentContents(document, fixDocumentContent(foundDocumentClass));
        iterateDocumentContents(document, fixDocumentAreas(foundDocumentClass));
        iterateDocumentContents(document, fixDataFields(foundDocumentClass));
    }
    return document;
}
