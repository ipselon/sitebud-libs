import {DocumentData, SiteTree, SiteTreeNode, Data} from './types';

export function cloneDeep(object: any): any {
    if (object) {
        const jsonText: string = JSON.stringify(object);
        return JSON.parse(jsonText);
    }
    return object;
}
/**
 * Making all fields nulls is required by NextJS serialization mechanism
 */
export const documentDataDefault: DocumentData = {
    content: null,
    hasRestrictedAreas: null,
    type: null,
    id: null,
    path: null,
    name: null,
    locale: null
};

export const siteTreeNodeDefault: SiteTreeNode = {
    id: '',
    documentClass: '',
    children: [],
    name: '',
    path: ''
};

export const siteTreeDefault: SiteTree = {
    root: cloneDeep(siteTreeNodeDefault),
};

export const dataDefault: Data = {
    documentId: '',
    siteTree: cloneDeep(siteTreeDefault),
};
