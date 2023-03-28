import {AnyFieldType, AnyField} from './fields';
import {DocumentType, DocumentContentDataFieldType} from './document';

export type DocumentContentBlockComponentFieldVariant = {
    label: string;
    fieldContent: AnyField;
};

export type DocumentContentBlockComponentFieldClass = {
    label?: string;
    type: AnyFieldType;
    indexNumber: number;
    fieldContent: AnyField;
    fieldContentVariants?: Array<DocumentContentBlockComponentFieldVariant>;
};

export type DocumentContentBlockComponentClass = {
    label: string;
    helpText?: string;
    isArray?: boolean;
    indexNumber: number;
    props: Record<string, DocumentContentBlockComponentFieldClass>;
};

export type DocumentContentBlockClass = {
    description: string;
    isDefault?: boolean;
    components: Record<string, DocumentContentBlockComponentClass>;
};

export type DocumentContentDataFieldClassVariant = {
    label: string;
    value: string;
    svg?: string;
};
export type DocumentContentDataFieldClassInputType = 'text' | 'select' | 'image';
export type DocumentContentDataFieldClass = {
    label: string;
    indexNumber: number;
    dataType: DocumentContentDataFieldType;
    inputType: DocumentContentDataFieldClassInputType;
    variants?: Array<DocumentContentDataFieldClassVariant>;
    defaultValue?: string;
    dataSetField?: string;
};

export type DocumentContentAreaClass = {
    label: string;
    helpText?: string;
    indexNumber: number;
    blocks: Record<string, DocumentContentBlockClass>;
};

export type DocumentClass = {
    type: DocumentType;
    label: string;
    description: string;
    defaultTitle: string;
    defaultSlug: string;
    dataFields: Record<string, DocumentContentDataFieldClass>;
    documentAreas: Record<string, DocumentContentAreaClass>
    commonAreas: Record<string, DocumentContentAreaClass>
};

export type DocumentClass_Index = Record<string, DocumentClass>;
