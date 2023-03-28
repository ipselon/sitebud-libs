import {AnyField, AnyFieldType} from './fields';

export type LocaleType = string; // todo: add all other locales except orcs' locale
export type DocumentType = 'site' | 'main_page' | 'page' | 'search_results_page';

export type ContentStatus = {
    errorMessage?: string;
    visibility?: undefined | 'visible' | 'hidden';
    errorsCount?: number;
}

export type DocumentContentStatusMap = Record<string, ContentStatus>;

export type DocumentContentBlockComponentField = {
    name: string; // unique name
    type: AnyFieldType,
    fieldContent: AnyField;
};

export type DocumentContentBlockComponentInstance = {
    id?: string;
    props: Array<DocumentContentBlockComponentField>;
};

export type DocumentContentBlockComponent = {
    name: string; // unique name
    isArray?: boolean;
    instances: Array<DocumentContentBlockComponentInstance>;
};

export type DocumentContentBlock = {
    id?: string;
    name: string; // unique name
    components: Array<DocumentContentBlockComponent>;
};

export type DocumentContentDataFieldType = 'string' | 'number';
export type DocumentContentDataField = {
    name: string;
    type: DocumentContentDataFieldType;
    value: string;
    dataSetField?: string;
};

export type DocumentContentArea = {
    name: string;
    blocks: Array<DocumentContentBlock>;
};

export type DocumentContent_Base = {
    // required fields for system
    title: string;
    slug: string;
    tags: Record<string, number>;
    dateUpdated?: number;
    isCustomSlug?: boolean;
};

export type DocumentContent_Bean = DocumentContent_Base & {
    dataFields: Array<DocumentContentDataField>;
    documentAreas: Array<DocumentContentArea>;
    commonAreas: Array<DocumentContentArea>;
    statusMap: DocumentContentStatusMap;
};

export type DocumentContent_Common = {
    commonAreas: Array<DocumentContentArea>;
};

export type Document_Base = {
    id: string;
    type: DocumentType;
    documentClass: string;
};

export type Document_Bean = Document_Base & {
    isDeleted?: boolean;
    contents: Record<LocaleType, DocumentContent_Bean>;
}

export type Document_Common = {
    contents: Record<LocaleType, DocumentContent_Common>;
    documentClass: string;
};

export type DocumentRecord_Bean = Document_Base & {
    contents: Partial<Record<LocaleType, DocumentContent_Base>>;
    children: Array<DocumentRecord_Bean>;
};

export type DocumentRecord_TreeItem = DocumentRecord_Bean & {
    level: number;
};
