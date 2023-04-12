export const adaptersHooksTemplate: string = `
import {Data, DocumentData} from '<%= libPaths.bridgeLib %>';
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

function adaptData(data: Data): DocumentContentContext {
    const {pageData, siteData} = data;
    let documentContentContext: DocumentContentContext = adaptDocumentData(pageData);
    documentContentContext = {...documentContentContext, ...adaptDocumentData(siteData)}; 
    return documentContentContext;
}

export function useDocumentDataAdapter(data: Data): DocumentContentContext {
    return adaptData(data);
}
`;
