export const adaptersHooksTemplate: string = `
import {DocumentData} from '<%= libPaths.bridgeLib %>';
import { 
    DocumentContentContext, 
<% classNames.forEach(function(className) {%><%= upperFirst(className) %>ContentAdapter,
<% }); %>
} from './types';

function adaptDocumentData(documentData: DocumentData): DocumentContentContext {
    const documentContentContext: DocumentContentContext = {};
    if (documentData && documentData.content && documentData.name) {
        switch (documentData.name) {
        <% classNames.forEach(function(className) {%>
            case '<%= upperFirst(className) %>':
                documentContentContext.<%= lowerFirst(className) %>Content = new <%= upperFirst(className) %>ContentAdapter(documentData, adaptDocumentData).adapt(); 
                break;
        <% }); %>       
        }
    }
    return documentContentContext;
}

export function useDocumentDataAdapter(documentData: DocumentData): DocumentContentContext {
    return adaptDocumentData(documentData);
}
`;
