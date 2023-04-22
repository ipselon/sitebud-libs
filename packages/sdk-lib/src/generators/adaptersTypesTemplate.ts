export const adaptersTypesTemplate: string = `
<% classNames.forEach(function(className) {%>import {<%= upperFirst(className) %>Content} from './<%= upperFirst(className) %>Content';<% }); %>
<% classNames.forEach(function(className) {%>export * from './<%= upperFirst(className) %>Content';<% }); %>
export type DataFieldType = 'string' | 'number';
export type DocumentContentContext = {
<% classNames.forEach(function(className) {%>
    <%= lowerFirst(className) %>Content?: <%= upperFirst(className) %>Content;
<% }); %>
};
`;
