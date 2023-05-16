import {DOMParser} from '@xmldom/xmldom';
import xpath from 'xpath';
import {
    DocumentContentArea,
    iterateDocumentContentAreas,
    iterateDocumentContentAreaBlocks,
    iterateDocumentContentAreaBlockComponents,
    iterateDocumentContentAreaBlockComponentInstances,
    HeaderText,
    ParagraphText,
    StringValue
} from '@sitebud/domain-lib';
import {DocumentContent} from './types';

function extractTextFromHtml(htmlString: string): string {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(`<div>${htmlString}</div>`, 'application/xml');
    const textNodes = xpath.select('//text()', xmlDoc);
    let text = '';
    for (const textNode of textNodes) {
        text += (textNode as Node).nodeValue || textNode + ' ';
    }
    return text.trim();
}

export function buildSearchText(documentContent: DocumentContent): string {
    let resultText: string = '';
    iterateDocumentContentAreas(documentContent.documentAreas, (area: DocumentContentArea) => {
        iterateDocumentContentAreaBlocks(area.blocks, (block) => {
            iterateDocumentContentAreaBlockComponents(block.components, (component) => {
                iterateDocumentContentAreaBlockComponentInstances(component.instances, (instance) => {
                    for (const instancePropItem of Object.entries(instance.props)) {
                        const [propName, propValue] = instancePropItem;
                        if (propValue.type === 'HeaderText' || propValue.type === 'ParagraphText') {
                            resultText += extractTextFromHtml((propValue.fieldContent as HeaderText | ParagraphText).htmlText) + '|c|';
                        } else if (propValue.type === 'StringValue') {
                            resultText += (propValue.fieldContent as StringValue).value + '|c|';
                        }
                    }
                });
            });
        });
    });
    if (resultText.length > 3) {
        return resultText.substring(0, resultText.length - 3);
    }
    return resultText;
}