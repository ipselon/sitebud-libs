import type {
    Image,
    HeaderText,
    ParagraphText,
    Link,
    StringValue,
    AnyFieldType,
    AnyField,
    DocumentContent_Bean,
    SiteMap_Bean,
    DocumentContentDataFieldType,
    DocumentsList,
    SiteGeneralSettings
} from '@sitebud/domain-lib';

export type {
    Image,
    HeaderText,
    ParagraphText,
    Link,
    StringValue,
    DocumentsList,
    AnyFieldType,
    AnyField,
};

export type DataFieldValue = {
    type: DocumentContentDataFieldType,
    value: string;
};

export type DocumentContent = Omit<DocumentContent_Bean, 'isCustomSlug' | 'statusMap'>;

export type DocumentData = {
    id?: string;
    name?: string;
    content?: DocumentContent;
    path?: string;
    locale?: string;
    tagsLinks?: Record<string, string>;
    generalSettings?: SiteGeneralSettings;
    documentDataListByTag?: Record<string, Array<DocumentData> | null>;
    documentDataListByParentId?: Record<string, Array<DocumentData> | null>;
    documentDataById?: Record<string, DocumentData | null>;
};

export type DocumentPathParams = {
    route_path: Array<string>;
};

export type DocumentPathData = {
    params: DocumentPathParams;
    locale?: string;
};

export type DocumentContext = {
    locale: string;
    siteMap: SiteMap_Bean;
    documentClass: string;
    documentId: string;
    documentContent: DocumentContent_Bean;
};

export type SiteMapDataContext_Proxy = {
    siteMap: SiteMap_Bean;
};

export type SiteMap_IndexBean = {
    nodePath: string;
};

export type SiteMap_Index = Record<string, SiteMap_IndexBean>;

export type Data = {
    pageData: DocumentData;
    siteData: DocumentData;
};