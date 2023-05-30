export const adaptersTypesTemplate: string = `
<% classes.forEach(function(classItem) {%>import {<%= upperFirst(classItem.className) %>Content} from './<%= upperFirst(classItem.className) %>Content';<% }); %>
<% classes.forEach(function(classItem) {%>export * from './<%= upperFirst(classItem.className) %>Content';<% }); %>

export type DocumentClass = <% classes.forEach(function(classItem, idx) {%> | '<%= upperFirst(classItem.className) %>'<% }); %>;

export type DocumentContentContext = {
<% classes.forEach(function(classItem) {%><%= lowerFirst(classItem.className) %>Content?: <%= upperFirst(classItem.className)%>Content;<% }); %>
};

export type DocumentNode = {
    id: string;
    path: string;
    name: string;
    documentClass: DocumentClass;
    documentContentContext: DocumentContentContext;
    children: Array<DocumentNode>;
};

export type DocumentsListField = {
    parentDocumentIds?: Array<string>;
    documentIds?: Array<string>;
};

export type ImageField = { src: string; alt: string; focusX?: number; focusY?: number; };

export type LinkField = { href: string; target: string; };
`;
