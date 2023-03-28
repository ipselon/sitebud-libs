export const adaptersHooksTemplate: string = `
import {PageData} from '<%= libPaths.bridgeLib %>';
import { 
    PageContentContext, 
<% classNames.forEach(function(className) {%><%= upperFirst(className) %>ContentAdapter,
<% }); %>
} from './types';

function adaptPageData(pageData: PageData): PageContentContext {
    const pageContentContext: PageContentContext = {};
    if (pageData && pageData.content && pageData.name) {
        switch (pageData.name) {
        <% classNames.forEach(function(className) {%>
            case '<%= upperFirst(className) %>':
                pageContentContext.<%= lowerFirst(className) %>Content = new <%= upperFirst(className) %>ContentAdapter(pageData, adaptPageData).adapt(); 
                break;
        <% }); %>       
        }
    }
    return pageContentContext;
}

export function usePageContentContext(pageData: PageData): PageContentContext {
    return adaptPageData(pageData);
}
`;
