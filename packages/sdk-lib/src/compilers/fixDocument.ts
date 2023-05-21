import {
    Document_Bean,
    DocumentContent_Bean,
    DocumentContentBlock,
    DocumentClass_Index,
    DocumentClass,
    DocumentContentArea,
    DocumentContentAreaClass,
    DocumentContentBlockClass,
    DocumentContentBlockComponentClass,
    DocumentContentBlockComponentField,
    DocumentContentBlockComponent,
    DocumentContentBlockComponentFieldClass,
    iterateDocumentContentAreaBlocks,
    iterateDocumentContentAreaBlockComponents,
    iterateDocumentContentAreaBlockComponentInstances,
    iterateDocumentContentAreas,
    iterateDocumentContents
} from '@sitebud/domain-lib';
import {nanoid} from 'nanoid';

export function fixDocumentContentBlocks(blocks: Array<DocumentContentBlock>, areaClass?: DocumentContentAreaClass) {
    iterateDocumentContentAreaBlocks(blocks, (block) => {
        // const {components, name} = block;
        const foundBlockClass: DocumentContentBlockClass | undefined = areaClass?.blocks[block.name];
        const newBlockComponents: Array<DocumentContentBlockComponent> = [];
        if (foundBlockClass) {
            let componentClassTuples: Array<[string, DocumentContentBlockComponentClass]> = Object.entries(foundBlockClass.components);
            componentClassTuples = componentClassTuples.sort((a, b) => {
                return a[1].indexNumber - b[1].indexNumber;
            });
            let indexNumber: number = 0;
            for (const componentClass of componentClassTuples) {
                const foundComponentIndex = block.components.findIndex(c => c.name === componentClass[0]);
                if (foundComponentIndex < 0) {
                    let fieldClassTuples: Array<[string, DocumentContentBlockComponentFieldClass]> = Object.entries(componentClass[1].props);
                    fieldClassTuples = fieldClassTuples.sort((a, b) => {
                        return a[1].indexNumber - b[1].indexNumber;
                    });
                    const instanceProps: Array<DocumentContentBlockComponentField> = [];
                    for (const fieldClassTuple of fieldClassTuples) {
                        instanceProps.push({
                            name: fieldClassTuple[0],
                            type: fieldClassTuple[1].type,
                            fieldContent: fieldClassTuple[1].fieldContent
                        });
                    }
                    block.components.splice(indexNumber, 0, {
                        name: componentClass[0],
                        isArray: componentClass[1].isArray,
                        instances: [
                            {
                                id: nanoid(),
                                props: instanceProps
                            }
                        ]
                    })
                }
                indexNumber++;
            }
        }
        iterateDocumentContentAreaBlockComponents(block.components, (component) => {
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

export function fixDocument(document: Document_Bean, documentClassIndex: DocumentClass_Index): Document_Bean {
    if (document) {
        const foundDocumentClass: DocumentClass | undefined = documentClassIndex[document.documentClass];
        if (!foundDocumentClass) {
            throw Error(`Can not find ${document.documentClass} document class.`);
        }
        iterateDocumentContents(document, fixDocumentContent(foundDocumentClass));
        iterateDocumentContents(document, fixDocumentAreas(foundDocumentClass));
    }
    return document;
}
