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
    imageName?: string; // a big picture that explains what this component is for
    isArray?: boolean;
    indexNumber: number;
    props: Record<string, DocumentContentBlockComponentFieldClass>;
};

export type DocumentContentBlockClass = {
    label: string;
    description: string;
    imageName?: string; // an icon to depict the block in the list of blocks when the user tries to select the block to append
    isDefault?: boolean;
    components: Record<string, DocumentContentBlockComponentClass>;
};

export type DocumentContentDataFieldClassVariant = {
    label: string;
    value: string;
    svg?: string; // for start icon in the option item
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
    imageName?: string; // show a picture about what this area is responsible for in the document
    indexNumber: number;
    blocks: Record<string, DocumentContentBlockClass>;
};

export type DocumentClass = {
    type: DocumentType;
    label: string;
    imageName?: string; // just an icon of the document class, to distinguish from other document types...
    description: string;
    defaultTitle?: string;
    defaultSlug?: string;
    dataFields: Record<string, DocumentContentDataFieldClass>;
    documentAreas: Record<string, DocumentContentAreaClass>
    commonAreas?: Record<string, DocumentContentAreaClass>
};

export type DocumentClass_Index = Record<string, DocumentClass>;
