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
    DocumentType
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
    type?: DocumentType;
    content?: DocumentContent;
    path?: string;
    locale?: string;
    tagsLinks?: Record<string, string>;
    availableLocales?: Array<string>;
    documentDataListByTag?: Record<string, Array<DocumentData> | null>;
    documentDataListByParentId?: Record<string, Array<DocumentData> | null>;
    documentDataById?: Record<string, DocumentData | null>;
    authorProfiles?: Record<string, DocumentData>;
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
    documentType: DocumentType;
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

export type SearchIndexItem = {
    keyPath: string;
    locale: string;
    title: string;
    chunks: Array<string>;
}
