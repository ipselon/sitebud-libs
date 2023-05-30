export const dataContentAdapterTemplate: string = `
import {ContentAdapter} from '<%= libPaths.bridgeLib %>';
import {<%= upperFirst(className) %>Content,<% if (documentAreasNames && documentAreasNames.length > 0) { %><%= upperFirst(className) %>_DocumentAreas,<% } %>} from './types';

export class <%= upperFirst(className) %>ContentAdapter extends ContentAdapter<<%= upperFirst(className) %>Content> {
    adapt(): <%= upperFirst(className) %>Content {
        const {hasRestrictedAreas<% if (documentType !== 'site') {%>, content, path, locale<% } %>} = this._documentData;
        const result: <%= upperFirst(className) %>Content = {
            <% if (documentType !== 'site') {%>title: content?.title || 'undefined',<% } %>
            <% if (documentType !== 'site') {%>slug: content?.slug || 'undefined',<% } %>
            <% if (documentType !== 'site') {%>dateUpdated: content?.dateUpdated,<% } %>
            <% if (documentType !== 'site') {%>authors: content?.authors,<% } %>
            <% if (documentType !== 'site') {%>path: path || '',<% } %>
            <% if (documentType !== 'site') {%>locale: locale || '',<% } %>
            hasRestrictedAreas: !!hasRestrictedAreas,
            <% if (documentAreasNames && documentAreasNames.length > 0) { %>
            documentAreas: {
                <% documentAreasNames.forEach(function(areaName) {%><%= areaName %>: [],<% }); %>
            },
            <% } %>
        };
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
