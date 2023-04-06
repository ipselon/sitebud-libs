export const dataContentTypeTemplate: string = `
<% function printProps(componentName) { componentProps[componentName].forEach(function(prop) { %><% if (prop.type === 'Image') { %><%= prop.name %>: { src: string; alt: string; width: number; height: number; };<% } else if (prop.type === 'HeaderText') { %><%= prop.name %>: string;<% } else if (prop.type === 'ParagraphText') { %><%= prop.name %>: string;<% } else if (prop.type === 'Link') { %><%= prop.name %>: { href: string; target: string; };<% } else if (prop.type === 'DocumentsList' || prop.type === 'TagsList') { %><%= prop.name %>: Array<PageContentContext>;<% } else if (prop.type === 'Icon')  { %><%= prop.name %>: string;<% } else if (prop.type === 'StringValue')  { %><%= prop.name %>: string;<% } %>
<% });} %> 
import {PageContentContext, DataFieldType, GeneralSettings} from './types';

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

/**
 * Types of the common areas
 */
<% commonAreasNames.forEach(function(areaName) {%>
export type <%= upperFirst(className) %>_Common<%= upperFirst(areaName) %> = Array<{
    <% commonAreaBlocksNames[areaName].forEach(function(blockName) { %><%= blockName %>?: <%= upperFirst(className) %>_<%= upperFirst(blockName) %>;<% }); %>
}>;
<% }); %>

export type <%= upperFirst(className) %>_CommonAreas = {
    <% commonAreasNames.forEach(function(areaName) {%><%= areaName %>: <%= upperFirst(className) %>_Common<%= upperFirst(areaName) %>;
    <% }); %>
}

/**
 * Type of data fields
 */
 export type <%= upperFirst(className) %>_DataFields = {
    <% dataFields.forEach(function(dataFieldName) { %><%= dataFieldName %>?: {value: string; type: DataFieldType;};
    <% }); %>
 }
 
/**
 * Page content type
 */
export type <%= upperFirst(className) %>Content = {
    title: string;
    slug: string;
    tags: Record<string, number>;
    dateUpdated?: number;
    authors?: Record<string, number>;
    generalSettings: GeneralSettings;
    dataFields: <%= upperFirst(className) %>_DataFields;
    documentAreas: <%= upperFirst(className) %>_DocumentAreas;
    commonAreas: <%= upperFirst(className) %>_CommonAreas;
};
`;