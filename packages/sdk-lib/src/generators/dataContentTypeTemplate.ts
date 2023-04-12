export const dataContentTypeTemplate: string = `
<% function printProps(componentName, componentProps) { componentProps.forEach(function(prop) { %><% if (prop.type === 'Image') { %><%= prop.name %>: { src: string; alt: string; width: number; height: number; };<% } else if (prop.type === 'HeaderText') { %><%= prop.name %>: string;<% } else if (prop.type === 'ParagraphText') { %><%= prop.name %>: string;<% } else if (prop.type === 'Link') { %><%= prop.name %>: { href: string; target: string; };<% } else if (prop.type === 'DocumentsList' || prop.type === 'TagsList') { %><%= prop.name %>: Array<DocumentContentContext>;<% } else if (prop.type === 'Icon')  { %><%= prop.name %>: string;<% } else if (prop.type === 'StringValue')  { %><%= prop.name %>: string;<% } %>
<% });} %> 
import {DocumentContentContext,<% if (dataFields && dataFields.length > 0) { %> DataFieldType<% } %>} from './types';


<% if (documentAreasNames && documentAreasNames.length > 0) { %>
<% forOwn(documentAreas, function(areaObject, areaName) { %>

<% forOwn(areaObject, function(blockComponents, blockName) { %>
/**
 * From <%= upperFirst(className) %>_Document<%= upperFirst(areaName) %> Document Area
 */
export type <%= upperFirst(className) %>_Document<%= upperFirst(areaName) %>_<%= upperFirst(blockName) %> = {
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
export type <%= upperFirst(className) %>_Document<%= upperFirst(areaName) %> = Array<{
    <% forOwn(areaObject, function(blockComponents, blockName) { %>
        <%= blockName %>?: <%= upperFirst(className) %>_Document<%= upperFirst(areaName) %>_<%= upperFirst(blockName) %>;
    <% }); %>
}>;

<% }) %>

/**
 * Document Areas
 */
export type <%= upperFirst(className) %>_DocumentAreas = {
<% forOwn(documentAreas, function(areaObject, areaName) { %>
    <%= areaName %>: <%= upperFirst(className) %>_Document<%= upperFirst(areaName) %>;
<% }); %>
};

<% } %>

<% if (commonAreasNames && commonAreasNames.length > 0) { %>
<% forOwn(commonAreas, function(areaObject, areaName) { %>

<% forOwn(areaObject, function(blockComponents, blockName) { %>
/**
 * From <%= upperFirst(className) %>_Common<%= upperFirst(areaName) %> Common Area
 */
export type <%= upperFirst(className) %>_Common<%= upperFirst(areaName) %>_<%= upperFirst(blockName) %> = {
    <% blockComponents.forEach(function(componentObject){ %>
        <% if (componentObject.isArray) { %>
            <%= componentObject.name %>: Array<{<% printProps(componentObject.name, componentObject.componentProps) %>}>;
        <% } else { %>
            <%= componentObject.name %>: {<% printProps(componentObject.name, componentObject.componentProps) %>};
        <% } %>
    <% }); %>
};
<% }); %>

/**
 * From Common Areas
 */
export type <%= upperFirst(className) %>_Common<%= upperFirst(areaName) %> = Array<{
    <% forOwn(areaObject, function(blockComponents, blockName) { %>
        <%= blockName %>?: <%= upperFirst(className) %>_Common<%= upperFirst(areaName) %>_<%= upperFirst(blockName) %>;
    <% }); %>
}>;
<% }); %>

/**
 * Common Areas
 */
export type <%= upperFirst(className) %>_CommonAreas = {
<% forOwn(commonAreas, function(areaObject, areaName) { %>
    <%= areaName %>: <%= upperFirst(className) %>_Common<%= upperFirst(areaName) %>;
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
    <% if (documentType === 'site') {%>tagsLinks: Record<string, string>;<% } %>
    <% if (dataFields && dataFields.length > 0) { %>dataFields: <%= upperFirst(className) %>_DataFields;<% } %>
    documentAreas: <%= upperFirst(className) %>_DocumentAreas;
    <% if (commonAreasNames && commonAreasNames.length > 0) { %>commonAreas: <%= upperFirst(className) %>_CommonAreas;<% } %>
};
`;