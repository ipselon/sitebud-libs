export const adaptersTypesTemplate: string = `
<% classes.forEach(function(classItem) {%>import {<%= upperFirst(classItem.className) %>Content} from './<%= upperFirst(classItem.className) %>Content';<% }); %>
<% classes.forEach(function(classItem) {%>export * from './<%= upperFirst(classItem.className) %>Content';<% }); %>
export type DataFieldType = 'string' | 'number';
export type DocumentContentContext = {
<% classes.forEach(function(classItem) {%><%= lowerFirst(classItem.className) %>Content?: <%= upperFirst(classItem.className)%>Content;<% }); %>
};
export type DocumentsListField = {
    entriesByParent?: Array<{ portion: Array<DocumentContentContext>; portionOrigin: any; }>;
    entries?: Array<DocumentContentContext>;
};
export type ImageField = { src: string; alt: string; focusX?: number; focusY?: number; };
export type LinkField = { href: string; target: string; };
`;
