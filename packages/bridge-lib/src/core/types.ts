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

export type DocumentContent = Omit<DocumentContent_Bean, 'isCustomSlug' | 'statusMap'>;

export type DocumentDataLinkOptions = {
    documentAreas: Array<string>;
    documentClasses: Array<string>;
};

export type DocumentDataLink = {
    options: DocumentDataLinkOptions;
    array?: Array<DocumentData>;
    item?: DocumentData;
    parentReference?: FoundByParentReference;
};

export type FoundByParentReference = {
    id: string;
    title: string;
    slug: string;
    path?: string;
};

export type DocumentData = {
    id: string | null;
    name: string | null;
    type: DocumentType | null;
    content: DocumentContent | null;
    baseUrl: string | null;
    path: string | null;
    locale: string | null;
    hasRestrictedAreas: boolean | null;
    availableLocales: Array<string> | null;
    documentDataListByParentId: Record<string, DocumentDataLink> | null;
    documentDataById: Record<string, DocumentDataLink> | null;
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

export type RequestOptions = {
    accessLevel: number;
};

export type FetchOptions = RequestOptions & {
    requiredDocumentAreas?: Array<string>;
    requiredDocumentClasses?: Array<string>;
};

