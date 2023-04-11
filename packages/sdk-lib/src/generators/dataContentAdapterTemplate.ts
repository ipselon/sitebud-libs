export const dataContentAdapterTemplate: string = `
import {ContentAdapter} from '<%= libPaths.bridgeLib %>';
import {<%= upperFirst(className) %>Content, <%= upperFirst(className) %>_DocumentAreas, <% if (commonAreasNames && commonAreasNames.length > 0) { %><%= upperFirst(className) %>_CommonAreas<% } %>} from './types';

export class <%= upperFirst(className) %>ContentAdapter extends ContentAdapter<<%= upperFirst(className) %>Content> {
    adapt(): <%= upperFirst(className) %>Content {
        const {content, generalSettings} = this._documentData;
        const result: <%= upperFirst(className) %>Content = {
            title: content?.title || 'undefined',
            slug: content?.slug || 'undefined',
            tags: content?.tags || {},
            dateUpdated: content?.dateUpdated,
            authors: content?.authors,
            generalSettings: {
                title: generalSettings?.title || 'undefined'
            },
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
                <% documentAreasNames.forEach(function(areaName) {%>
                '<%= areaName %>': {
                    <% documentAreaBlocksNames[areaName].forEach(function(blockName) { %>
                            '<%= blockName %>': {                   
                            <% blockComponents[blockName].forEach(function(component) { %>
                                <%= component.name %>: [<% componentProps[component.name].forEach(function(prop) { %>{name:'<%= prop.name %>', type: '<%= prop.type %>'},<% }); %>],
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
                <% commonAreasNames.forEach(function(areaName) {%>
                '<%= areaName %>': {
                    <% commonAreaBlocksNames[areaName].forEach(function(blockName) { %>
                            '<%= blockName %>': {                   
                            <% blockComponents[blockName].forEach(function(component) { %>
                                <%= component.name %>: [<% componentProps[component.name].forEach(function(prop) { %>{name:'<%= prop.name %>', type: '<%= prop.type %>'},<% }); %>],
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
