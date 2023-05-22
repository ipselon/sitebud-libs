import {DocumentData} from './types';

/**
 * Making all fields nulls is required by NextJS serialization mechanism
 */
export const documentDataDefault: DocumentData = {
    baseUrl: null,
    content: null,
    documentDataById: null,
    documentDataListByParentId: null,
    hasRestrictedAreas: null,
    availableLocales: null,
    type: null,
    id: null,
    path: null,
    name: null,
    locale: null
};
