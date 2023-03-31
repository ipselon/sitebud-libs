export const adaptersTypesTemplate: string = `
<% classNames.forEach(function(className) {%>export * from './<%= upperFirst(className) %>Content';
export * from './<%= upperFirst(className) %>ContentAdapter';
import {<%= upperFirst(className) %>Content} from './<%= upperFirst(className) %>Content';
<% }); %>
export type DataFieldType = 'string' | 'number';
export type GeneralSettings = { title: string; };
export type PageContentContext = {
<% classNames.forEach(function(className) {%>
    <%= lowerFirst(className) %>Content?: <%= upperFirst(className) %>Content;
<% }); %>
};
`;
