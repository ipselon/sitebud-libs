export const adaptersTypesTemplate: string = `
<% classes.forEach(function(classItem) {%>import {<%= upperFirst(classItem.className) %>Content} from './<%= upperFirst(classItem.className) %>Content';<% }); %>
<% classes.forEach(function(classItem) {%>export * from './<%= upperFirst(classItem.className) %>Content';<% }); %>
export type DataFieldType = 'string' | 'number';
export type DocumentContentContext = {
<% classes.forEach(function(classItem) {%><%= lowerFirst(classItem.className) %>Content?: <%= upperFirst(classItem.className)%>Content;<% }); %>
};
`;
