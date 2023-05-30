import type {
    Image,
    HeaderText,
    ParagraphText,
    Link,
    StringValue,
    AnyFieldType,
    AnyField,
    DocumentContent_Bean,
    DocumentsList,
    DocumentType,
    DocumentRecord_Bean
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

export type DocumentContent = Partial<DocumentContent_Bean>;

export type DocumentData = {
    id: string | null;
    name: string | null;
    type: DocumentType | null;
    content: DocumentContent | null;
    path: string | null;
    locale: string | null;
    hasRestrictedAreas: boolean | null;
};

export type DocumentPathParams = {
    route_path: Array<string>;
};

export type DocumentPathData = {
    params: DocumentPathParams;
    locale?: string;
};

export type SiteMapIndexRecord = {
    nodePath: string;
    node: DocumentRecord_Bean;
    slug?: string;
    title?: string;
};

export type SiteMapIndex = Record<string, SiteMapIndexRecord>;

export type SearchIndexItem = {
    keyPath: string;
    locale: string;
    title: string;
    chunks: Array<string>;
}

export type SiteTreeNode = {
    id: string;
    name: string;
    path: string;
    documentClass: string;
    documentData?: DocumentData;
    children: Array<SiteTreeNode>;
};

export type SiteTree = {
    root: SiteTreeNode;
};

export type RequestOptions = {
    accessLevel: number;
};

export type FetchOptions = RequestOptions;

export type Data = {
    documentId: string;
    siteTree: SiteTree;
};
