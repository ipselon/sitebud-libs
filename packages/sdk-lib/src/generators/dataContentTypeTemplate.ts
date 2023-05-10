export const dataContentTypeTemplate: string = `
<% function printProps(componentName, componentProps) { componentProps.forEach(function(prop) { %><% if (prop.type === 'Image') { %><%= prop.name %>: { src: string; alt: string; focusX?: number; focusY?: number; };<% } else if (prop.type === 'HeaderText') { %><%= prop.name %>: string;<% } else if (prop.type === 'ParagraphText') { %><%= prop.name %>: string;<% } else if (prop.type === 'Link') { %><%= prop.name %>: { href: string; target: string; };<% } else if (prop.type === 'DocumentsList' || prop.type === 'TagsList') { %><%= prop.name %>: Array<DocumentContentContext>;<% } else if (prop.type === 'Icon')  { %><%= prop.name %>: string;<% } else if (prop.type === 'StringValue')  { %><%= prop.name %>: string;<% } %>
<% });} %> 
import {DocumentContentContext,<% if (dataFields && dataFields.length > 0) { %> DataFieldType<% } %>} from './types';


<% if (documentAreasNames && documentAreasNames.length > 0) { %>
<% forOwn(documentAreas, function(areaObject, areaName) { %>

<% forOwn(areaObject, function(blockComponents, blockName) { %>
/**
 * From <%= upperFirst(className) %>_<%= upperFirst(areaName) %>
 */
export type <%= upperFirst(className) %>_<%= upperFirst(areaName) %>_<%= upperFirst(blockName) %> = {
    __accessLevel?: number;
    <% blockComponents.forEach(function(componentObject) { %>
        <% if (componentObject.isArray) { %>
            <%= componentObject.name %>: Array<{<% printProps(componentObject.name, componentObject.componentProps) %>}>;
        <% } else { %>
            <%= componentObject.name %>: {<% printProps(componentObject.name, componentObject.componentProps) %>};
        <% } %>
    <% }); %>
};
<% }); %>

/**
 * From Document Areas
 */
export type <%= upperFirst(className) %>_<%= upperFirst(areaName) %> = Array<{
    <% forOwn(areaObject, function(blockComponents, blockName) { %>
        <%= blockName %>?: <%= upperFirst(className) %>_<%= upperFirst(areaName) %>_<%= upperFirst(blockName) %>;
    <% }); %>
}>;

<% }) %>

/**
 * Document Areas
 */
export type <%= upperFirst(className) %>_DocumentAreas = {
<% forOwn(documentAreas, function(areaObject, areaName) { %>
    <%= areaName %>: <%= upperFirst(className) %>_<%= upperFirst(areaName) %>;
<% }); %>
};

<% } %>
 
<% if (dataFields && dataFields.length > 0) { %>
/**
 * Data Fields
 */
 export type <%= upperFirst(className) %>_DataFields = {
    <% dataFields.forEach(function(dataFieldName) { %><%= dataFieldName %>?: {value: string; type: DataFieldType;};
    <% }); %>
 };
 <% } %>
 
/**
 * Document Content
 */
export type <%= upperFirst(className) %>Content = {
    <% if (documentType !== 'site') {%>title: string;<% } %>
    <% if (documentType !== 'site') {%>slug: string;<% } %>
    <% if (documentType !== 'site') {%>tags: Record<string, number>;<% } %>
    <% if (documentType !== 'site') {%>dateUpdated?: number;<% } %>
    <% if (documentType !== 'site') {%>authors?: Record<string, number>;<% } %>
    <% if (documentType !== 'site') {%>path: string;<% } %>
    <% if (documentType !== 'site') {%>locale?: string;<% } %>
    hasRestrictedAreas?: boolean;
    baseUrl: string;
    <% if (documentType === 'site') {%>availableLocales: Array<string>;<% } %>
    <% if (documentType === 'site') {%>tagsLinks: Record<string, string>;<% } %>
    <% if (documentType === 'site') {%>authorProfiles: Record<string, DocumentContentContext>;<% } %>
    <% if (dataFields && dataFields.length > 0) { %>dataFields: <%= upperFirst(className) %>_DataFields;<% } %>
    <% if (documentAreasNames && documentAreasNames.length > 0) { %>documentAreas: <%= upperFirst(className) %>_DocumentAreas;<% } %>
};
`;