import {AnyFieldType, AnyField} from './fields';
import {DocumentType} from './document';

export type DocumentContentBlockComponentFieldOptions = {
    multipleVariants?: boolean;
};

export type DocumentContentBlockComponentFieldVariant = {
    label: string;
    fieldContent: AnyField;
};

export type DocumentContentBlockComponentFieldClass = {
    label?: string;
    type: AnyFieldType;
    indexNumber: number;
    isRequired?: boolean;
    fieldContent: AnyField;
    fieldContentVariants?: Array<DocumentContentBlockComponentFieldVariant>;
    fieldContentOptions?: DocumentContentBlockComponentFieldOptions;
};

export type DocumentContentBlockComponentClass = {
    label: string;
    helpText?: string;
    imageName?: string; // a big picture that explains what this component is for
    isArray?: boolean;
    indexNumber: number;
    props: Record<string, DocumentContentBlockComponentFieldClass>;
};

export type DocumentContentBlockPaywallClass = {
    accessLevelVariants: Array<string>;
    defaultAccessLevel: string;
};

export type DocumentContentBlockClass = {
    label: string;
    description: string;
    imageName?: string;
    paywall?: DocumentContentBlockPaywallClass;
    components: Record<string, DocumentContentBlockComponentClass>;
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
    documentAreas: Record<string, DocumentContentAreaClass>;
};

export type DocumentClass_Index = Record<string, DocumentClass>;
