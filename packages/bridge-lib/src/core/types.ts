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
    DocumentsList
} from '@sitebud/domain-lib';
import {SiteGeneralSettings} from '@sitebud/domain-lib/src';

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
    name?: string;
    content?: DocumentContent;
    locale?: string;
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
