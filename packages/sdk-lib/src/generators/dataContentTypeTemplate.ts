export const dataContentTypeTemplate: string = `
<% function printProps(componentName) { componentProps[componentName].forEach(function(prop) { %><% if (prop.type === 'Image') { %><%= prop.name %>: { src: string; alt: string; width: number; height: number; };<% } else if (prop.type === 'HeaderText') { %><%= prop.name %>: string;<% } else if (prop.type === 'ParagraphText') { %><%= prop.name %>: string;<% } else if (prop.type === 'Link') { %><%= prop.name %>: { href: string; target: string; };<% } else if (prop.type === 'DocumentsList' || prop.type === 'TagsList') { %><%= prop.name %>: Array<DocumentContentContext>;<% } else if (prop.type === 'Icon')  { %><%= prop.name %>: string;<% } else if (prop.type === 'StringValue')  { %><%= prop.name %>: string;<% } %>
<% });} %> 
import {DocumentContentContext,<% if (dataFields && dataFields.length > 0) { %> DataFieldType<% } %>} from './types';

/**
 * Types of the blocks
 */
<% forOwn(blockComponents, function(components, blockName) { %>
    export type <%= upperFirst(className) %>_<%= upperFirst(blockName) %> = {
        <% components.forEach(function(component) { %><% if (component.isArray) { %><%= component.name %>: Array<{<% printProps(component.name) %>}>;<% } else { %><%= component.name %>: {<% printProps(component.name) %>};<% } %><% }); %>
    };
<% }); %>

/**
 * Types of the document areas
 */
<% documentAreasNames.forEach(function(areaName) {%>
export type <%= upperFirst(className) %>_Document<%= upperFirst(areaName) %> = Array<{
    <% documentAreaBlocksNames[areaName].forEach(function(blockName) { %><%= blockName %>?: <%= upperFirst(className) %>_<%= upperFirst(blockName) %>;<% }); %>
}>;
<% }); %>

export type <%= upperFirst(className) %>_DocumentAreas = {
    <% documentAreasNames.forEach(function(areaName) {%><%= areaName %>: <%= upperFirst(className) %>_Document<%= upperFirst(areaName) %>;
    <% }); %>
}

<% if (commonAreasNames && commonAreasNames.length > 0) { %>
<% commonAreasNames.forEach(function(areaName) {%>
/**
 * Types of the common areas
 */
export type <%= upperFirst(className) %>_Common<%= upperFirst(areaName) %> = Array<{
    <% commonAreaBlocksNames[areaName].forEach(function(blockName) { %><%= blockName %>?: <%= upperFirst(className) %>_<%= upperFirst(blockName) %>;<% }); %>
}>;
<% }); %>
export type <%= upperFirst(className) %>_CommonAreas = {
    <% commonAreasNames.forEach(function(areaName) {%><%= areaName %>: <%= upperFirst(className) %>_Common<%= upperFirst(areaName) %>;
    <% }); %>
}
<% } %>
 <% if (dataFields && dataFields.length > 0) { %>
/**
 * Type of data fields
 */
 export type <%= upperFirst(className) %>_DataFields = {
    <% dataFields.forEach(function(dataFieldName) { %><%= dataFieldName %>?: {value: string; type: DataFieldType;};
    <% }); %>
 }
 <% } %>
 
/**
 * Document content type
 */
export type <%= upperFirst(className) %>Content = {
    <% if (documentType !== 'site') {%>title: string;<% } %>
    <% if (documentType !== 'site') {%>slug: string;<% } %>
    <% if (documentType !== 'site') {%>tags: Record<string, number>;<% } %>
    <% if (documentType !== 'site') {%>dateUpdated?: number;<% } %>
    <% if (documentType !== 'site') {%>authors?: Record<string, number>;<% } %>
    <% if (documentType !== 'site') {%>path: string;<% } %>
    <% if (documentType === 'site') {%>tagsLinks: Record<string, string>;<% } %>
    <% if (dataFields && dataFields.length > 0) { %>dataFields: <%= upperFirst(className) %>_DataFields;<% } %>
    documentAreas: <%= upperFirst(className) %>_DocumentAreas;
    <% if (commonAreasNames && commonAreasNames.length > 0) { %>commonAreas: <%= upperFirst(className) %>_CommonAreas;<% } %>
};
`;