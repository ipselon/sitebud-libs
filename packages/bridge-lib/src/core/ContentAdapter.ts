import {
    DocumentContentBlockComponentField,
    DocumentContentBlockComponent,
    DocumentContentBlock,
    Image,
    HeaderText,
    ParagraphText,
    Link,
    DocumentsList,
    DocumentContentDataField,
    DocumentContentArea,
    Icon,
    StringValue,
    AnyFieldType
} from '@sitebud/domain-lib';
import {DocumentData, DataFieldValue} from './types';
import {TagsList} from '@sitebud/domain-lib/src';

type AreasSpecification = Record<string, BlocksSpecification>;
type BlocksSpecification = Record<string, ComponentsSpecification>;
type ComponentsSpecification = Record<string, PropsSpecification>;
type PropsSpecification = Array<{name: string, type: AnyFieldType}>;

type AdaptDocumentDataCallBack = (documentData: DocumentData) => any;

export abstract class ContentAdapter<T> {
    protected readonly _documentData: DocumentData;
    protected readonly _adaptDocumentDataCb: AdaptDocumentDataCallBack | undefined;

    public constructor(pageData: DocumentData, adaptDocumentDataCb?: AdaptDocumentDataCallBack | undefined) {
        this._documentData = pageData;
        this._adaptDocumentDataCb = adaptDocumentDataCb;
    }

    protected processProps(props: Array<DocumentContentBlockComponentField>, propsSpec: PropsSpecification): Record<string, any> {
        const result: Record<string, any> = {};
        const fulfilledProps: Array<string> = [];
        for (const propsItem of props) {
            if (propsSpec.findIndex(i => i.name === propsItem.name) >= 0) {
                fulfilledProps.push(propsItem.name);
                const {type, fieldContent, name} = propsItem;
                switch (type) {
                    case 'Icon':
                        result[name] = (fieldContent as Icon).iconName;
                        break;
                    case 'StringValue':
                        result[name] = (fieldContent as StringValue).value;
                        break;
                    case 'Image':
                        result[name] = {
                            src: (fieldContent as Image).src,
                            alt: (fieldContent as Image).alt,
                            height: (fieldContent as Image).height,
                            width: (fieldContent as Image).width,
                        };
                        break;
                    case 'HeaderText':
                        result[name] = (fieldContent as HeaderText).htmlText;
                        break;
                    case 'ParagraphText':
                        result[name] = (fieldContent as ParagraphText).htmlText;
                        break;
                    case 'Link':
                        result[name] = {
                            href: (fieldContent as Link).href,
                            target: (fieldContent as Link).target
                        };
                        break;
                    case 'DocumentsList':
                        if (this._adaptDocumentDataCb) {
                            const {documentsIds, selectionMode} = (fieldContent as DocumentsList);
                            if (documentsIds && documentsIds.length > 0) {
                                const pageContentContextList: Array<any> = [];
                                if (selectionMode === 'selectChildrenDocuments') {
                                    for(const parentDocumentId of documentsIds) {
                                        if (parentDocumentId && this._documentData.documentDataListByParentId) {
                                            const pageDataList: Array<DocumentData> | null = this._documentData.documentDataListByParentId[parentDocumentId];
                                            if (pageDataList) {
                                                for (const pageData of pageDataList) {
                                                    const adaptedContent: any = this._adaptDocumentDataCb(pageData);
                                                    if (adaptedContent) {
                                                        pageContentContextList.push(adaptedContent);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } else if (selectionMode === 'selectDocuments') {
                                    for(const documentId of documentsIds) {
                                        if (documentId && this._documentData.documentDataById) {
                                            const pageData: DocumentData | null = this._documentData.documentDataById[documentId];
                                            if (pageData) {
                                                const adaptedContent: any = this._adaptDocumentDataCb(pageData);
                                                if (adaptedContent) {
                                                    pageContentContextList.push(adaptedContent);
                                                }
                                            }
                                        }
                                    }
                                }
                                result[name] = pageContentContextList;
                            }
                        }
                        break;
                    case 'TagsList':
                        if (this._adaptDocumentDataCb) {
                            const {tags} = (fieldContent as TagsList);
                            if (tags && tags.length > 0) {
                                const pageContentContextList: Array<any> = [];
                                for(const tag of tags) {
                                    if (tag && this._documentData.documentDataListByTag) {
                                        const pageDataList: Array<DocumentData> | null = this._documentData.documentDataListByTag[tag];
                                        if (pageDataList) {
                                            for (const pageData of pageDataList) {
                                                const adaptedContent: any = this._adaptDocumentDataCb(pageData);
                                                if (adaptedContent) {
                                                    pageContentContextList.push(adaptedContent);
                                                }
                                            }
                                        }
                                    }
                                }
                                result[name] = pageContentContextList;
                            }
                        }
                        break;
                    default:
                        break;
                }
            }
        }
        for (const propSpec of propsSpec) {
            if (!fulfilledProps.includes(propSpec.name)) {
                console.error(`[SiteBud ContentAdapter] missing the "${propSpec.name}" property in the "${this._documentData.name}" document data schema.`)
                switch (propSpec.type) {
                    case 'Icon':
                        result[propSpec.name] = '';
                        break;
                    case 'StringValue':
                        result[propSpec.name] = '';
                        break;
                    case 'Image':
                        result[propSpec.name] = {
                            src: '',
                            alt: '',
                            height: -1,
                            width: -1,
                        };
                        break;
                    case 'HeaderText':
                        result[propSpec.name] = '';
                        break;
                    case 'ParagraphText':
                        result[propSpec.name] = '';
                        break;
                    case 'Link':
                        result[propSpec.name] = {
                            href: '',
                            target: ''
                        };
                        break;
                    case 'DocumentsList':
                    case 'TagsList':
                        result[propSpec.name] = [];
                        break;
                    default:
                        break;
                }
            }
        }
        return result;
    }

    protected processComponents(
        components: Array<DocumentContentBlockComponent>,
        componentsSpec: ComponentsSpecification
    ): Record<string, any> {
        const result: Record<string, any> = {};
        const fulfilledComponents: Array<string> = [];
        for (const componentsItem of components) {
            const foundPropsSpec = componentsSpec[componentsItem.name];
            if (foundPropsSpec) {
                fulfilledComponents.push(componentsItem.name);
                if (componentsItem.instances && componentsItem.instances.length > 0) {
                    if (componentsItem.isArray) {
                        result[componentsItem.name] = [];
                        for (const instance of componentsItem.instances) {
                            const componentContent: any = this.processProps(instance.props, foundPropsSpec);
                            result[componentsItem.name].push(componentContent);
                        }
                    } else {
                        result[componentsItem.name] = this.processProps(componentsItem.instances[0].props, foundPropsSpec);
                    }
                } else {
                    result[componentsItem.name] = {};
                }
            } else {
                console.error(`[SiteBud ContentAdapter] the "${componentsItem.name}" component in the document data does not exist in the "${this._documentData.name}" document data schema.`);
            }
        }
        for (const componentSpec of Object.entries(componentsSpec)) {
            if (!fulfilledComponents.includes(componentSpec[0])){
                result[componentSpec[0]] = {};
            }
        }
        return result;
    }

    protected processBlocks(blocks: Array<DocumentContentBlock>, blocksSpec: BlocksSpecification): Array<Record<string, any>> {
        const result: Array<Record<string, any>> = [];
        for (const blocksItem of blocks) {
            const foundComponentsSpec = blocksSpec[blocksItem.name];
            if (foundComponentsSpec && blocksItem.components && blocksItem.components.length > 0) {
                result.push({
                    [blocksItem.name]: this.processComponents(blocksItem.components, foundComponentsSpec),
                });
            }
        }
        return result;
    }

    protected processAreas(areas: Array<DocumentContentArea>, areasSpec: AreasSpecification): Record<string, any> {
        const result: Record<string, any> = {};
        for (const area of areas) {
            const foundBlocksSpec = areasSpec[area.name];
            if (foundBlocksSpec && area.blocks && area.blocks.length > 0) {
                result[area.name] = this.processBlocks(area.blocks, foundBlocksSpec);
            } else {
                result[area.name] = {};
                console.error(`[SiteBud ContentAdapter] Missing the "${area.name}" area in the "${this._documentData.name}" document data schema.`);
            }
        }
        return result;
    }

    protected processDataFields(dataFields: Array<DocumentContentDataField>): Record<string, DataFieldValue> {
        const result: Record<string, DataFieldValue> = {};
        for (const dataField of dataFields) {
            result[dataField.name] = {
                value: dataField.value,
                type: dataField.type
            };
        }
        return result;
    }

    abstract adapt(): T;
}
