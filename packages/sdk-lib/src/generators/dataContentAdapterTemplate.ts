export const dataContentAdapterTemplate: string = `
import {ContentAdapter} from '<%= libPaths.bridgeLib %>';
import {<%= upperFirst(className) %>Content, <%= upperFirst(className) %>_DocumentAreas, <% if (commonAreasNames && commonAreasNames.length > 0) { %><%= upperFirst(className) %>_CommonAreas<% } %>} from './types';

export class <%= upperFirst(className) %>ContentAdapter extends ContentAdapter<<%= upperFirst(className) %>Content> {
    adapt(): <%= upperFirst(className) %>Content {
        const {content <% if (documentType !== 'site') {%>, path<% } %><% if (documentType === 'site') {%>, tagsLinks<% } %>} = this._documentData;
        const result: <%= upperFirst(className) %>Content = {
            <% if (documentType !== 'site') {%>title: content?.title || 'undefined',<% } %>
            <% if (documentType !== 'site') {%>slug: content?.slug || 'undefined',<% } %>
            <% if (documentType !== 'site') {%>tags: content?.tags || {},<% } %>
            <% if (documentType !== 'site') {%>dateUpdated: content?.dateUpdated,<% } %>
            <% if (documentType !== 'site') {%>authors: content?.authors,<% } %>
            <% if (documentType !== 'site') {%>path: path || '',<% } %>
            <% if (documentType === 'site') {%>tagsLinks: tagsLinks || {},<% } %>
            <% if (dataFields && dataFields.length > 0) { %>
            dataFields: {},
            <% } %>
            documentAreas: {
                <% documentAreasNames.forEach(function(areaName) {%><%= areaName %>: [],<% }); %>
            },
            <% if (commonAreasNames && commonAreasNames.length > 0) { %>
            commonAreas: {
                <% commonAreasNames.forEach(function(areaName) {%><%= areaName %>: [],<% }); %>
            }
            <% } %>
        };
        <% if (dataFields && dataFields.length > 0) { %>
        if (content?.dataFields && content.dataFields.length > 0) {
            result.dataFields = this.processDataFields(content.dataFields);
        }
        <% } %>
        
        <% if (documentAreasNames && documentAreasNames.length > 0) {%>
        if (content?.documentAreas && content.documentAreas.length > 0) {
            result.documentAreas = this.processAreas(content.documentAreas, {
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
        }
        <% } %>
        
        <% if (commonAreasNames && commonAreasNames.length > 0) {%>
        if (content?.commonAreas && content.commonAreas.length > 0) {
            result.commonAreas = this.processAreas(content.commonAreas, {
                <% forOwn(commonAreas, function(areaObject, areaName) { %>
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
            }) as <%= upperFirst(className) %>_CommonAreas;
        }
        <% } %>
        return result;
    }
}
`;
