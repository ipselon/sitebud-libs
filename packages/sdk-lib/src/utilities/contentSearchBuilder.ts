import {DOMParser} from '@xmldom/xmldom';
import xpath from 'xpath';
import {
    DocumentContent_Bean,
    DocumentContentArea,
    iterateDocumentContentAreas,
    iterateDocumentContentAreaBlocks,
    iterateDocumentContentAreaBlockComponents,
    iterateDocumentContentAreaBlockComponentInstances,
    HeaderText,
    ParagraphText,
    StringValue
} from '@sitebud/domain-lib';

function extractTextFromHtml(htmlString: string): string {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(`<div>${htmlString}</div>`, 'application/xml');
    const textNodes = xpath.select('//text()', xmlDoc);
    let text = '';
    for (const textNode of textNodes) {
        text += ((textNode as Node).nodeValue || textNode) + ' ';
    }
    return text.trim();
}

export function buildSearchText(documentContent: DocumentContent_Bean): string {
    let resultText: string = '';
    let restrictedAreaSection = false;
    iterateDocumentContentAreas(documentContent.documentAreas, (area: DocumentContentArea) => {
        restrictedAreaSection = false;
        iterateDocumentContentAreaBlocks(area.blocks, (block) => {
            if (block.accessLevel && block.accessLevel > 0) {
                restrictedAreaSection = true;
            }
            if (!restrictedAreaSection) {
                iterateDocumentContentAreaBlockComponents(block.components, (component) => {
                    iterateDocumentContentAreaBlockComponentInstances(component.instances, (instance) => {
                        for (const instancePropItem of Object.entries(instance.props)) {
                            const [propName, propValue] = instancePropItem;
                            if (propValue.type === 'HeaderText' || propValue.type === 'ParagraphText') {
                                resultText += extractTextFromHtml((propValue.fieldContent as HeaderText | ParagraphText).htmlText) + '|c|';
                            }
                            // else if (propValue.type === 'StringValue') {
                            //     resultText += (propValue.fieldContent as StringValue).value + '|c|';
                            // }
                        }
                    });
                });
            }
        });
    });
    if (resultText.length > 3) {
        return resultText.substring(0, resultText.length - 3);
    }
    return resultText;
}