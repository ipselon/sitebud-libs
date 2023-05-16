export const dataContentAdapterTemplate: string = `
import {ContentAdapter} from '<%= libPaths.bridgeLib %>';
import {<%= upperFirst(className) %>Content,<% if (documentAreasNames && documentAreasNames.length > 0) { %><%= upperFirst(className) %>_DocumentAreas,<% } %>} from './types';

export class <%= upperFirst(className) %>ContentAdapter extends ContentAdapter<<%= upperFirst(className) %>Content> {
    adapt(): <%= upperFirst(className) %>Content {
        const {content, hasRestrictedAreas, baseUrl<% if (documentType !== 'site') {%>, path, locale<% } %><% if (documentType === 'site') {%>, availableLocales<% } %>} = this._documentData;
        const result: <%= upperFirst(className) %>Content = {
            <% if (documentType !== 'site') {%>title: content?.title || 'undefined',<% } %>
            <% if (documentType !== 'site') {%>slug: content?.slug || 'undefined',<% } %>
            <% if (documentType !== 'site') {%>dateUpdated: content?.dateUpdated,<% } %>
            <% if (documentType !== 'site') {%>authors: content?.authors,<% } %>
            <% if (documentType !== 'site') {%>path: path || '',<% } %>
            <% if (documentType !== 'site') {%>locale,<% } %>
            hasRestrictedAreas,
            baseUrl: baseUrl || '',
            <% if (documentType === 'site') {%>availableLocales: availableLocales || [],<% } %>
            <% // if (dataFields && dataFields.length > 0) { %>
            <% // dataFields: {}, %>
            <% // } %>
            <% if (documentAreasNames && documentAreasNames.length > 0) { %>
            documentAreas: {
                <% documentAreasNames.forEach(function(areaName) {%><%= areaName %>: [],<% }); %>
            },
            <% } %>
        };
        <% // if (dataFields && dataFields.length > 0) { %>
        <% // result.dataFields = this.processDataFields(); %>
        <% // } %>
        <% if (documentAreasNames && documentAreasNames.length > 0) {%>
        result.documentAreas = this.processDocumentAreas({
            <% forOwn(documentAreas, function(areaObject, areaName) { %>
            '<%= areaName %>': {
                <% forOwn(areaObject, function(blockComponents, blockName) { %>
                        '<%= blockName %>': {                   
                        <% blockComponents.forEach(function(component) { %>
                            <%= component.name %>: [<% component.componentProps.forEach(function(prop) { %>{name:'<%= prop.name %>', type: '<%= prop.type %>'},<% }); %>],
                        <% }); %>
                        },
                <% }); %>
                },
            <% }); %>
        }) as <%= upperFirst(className) %>_DocumentAreas;
        <% } %>
        
        return result;
    }
}
`;
