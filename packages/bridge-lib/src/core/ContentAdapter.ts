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
import {DocumentData, DataFieldValue, DocumentDataLink} from './types';
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

    private processProps(props: Array<DocumentContentBlockComponentField>, propsSpec: PropsSpecification): Record<string, any> {
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
                            const {documentsIds, selectionMode, tags} = (fieldContent as DocumentsList);
                            const pageContentContextList: Array<any> = [];
                            if (documentsIds && documentsIds.length > 0) {
                                if (selectionMode === 'selectChildrenDocuments') {
                                    for(const parentDocumentId of documentsIds) {
                                        if (parentDocumentId && this._documentData.documentDataListByParentId) {
                                            const pageDataLink: DocumentDataLink = this._documentData.documentDataListByParentId[parentDocumentId];
                                            if (pageDataLink && pageDataLink.array) {
                                                for (const pageData of pageDataLink.array) {
                                                    const adaptedContent: any = this._adaptDocumentDataCb(pageData);
                                                    if (adaptedContent) {
                                                        pageContentContextList.push(adaptedContent);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    for(const documentId of documentsIds) {
                                        if (documentId && this._documentData.documentDataById) {
                                            const pageDataLink: DocumentDataLink = this._documentData.documentDataById[documentId];
                                            if (pageDataLink && pageDataLink.item) {
                                                const adaptedContent: any = this._adaptDocumentDataCb(pageDataLink.item);
                                                if (adaptedContent) {
                                                    pageContentContextList.push(adaptedContent);
                                                }
                                            }
                                        }
                                    }
                                }
                            } else if (tags && tags.length > 0) {
                                for(const tag of tags) {
                                    if (tag && this._documentData.documentDataListByTag) {
                                        const pageDataLink: DocumentDataLink = this._documentData.documentDataListByTag[tag];
                                        if (pageDataLink && pageDataLink.array) {
                                            for (const pageData of pageDataLink.array) {
                                                const adaptedContent: any = this._adaptDocumentDataCb(pageData);
                                                if (adaptedContent) {
                                                    pageContentContextList.push(adaptedContent);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            result[name] = pageContentContextList;
                        }
                        break;
                    case 'TagsList':
                        if (this._adaptDocumentDataCb) {
                            const pageContentContextList: Array<any> = [];
                            const {tags} = (fieldContent as TagsList);
                            if (tags && tags.length > 0) {
                                for(const tag of tags) {
                                    if (tag && this._documentData.documentDataListByTag) {
                                        const pageDataLink: DocumentDataLink = this._documentData.documentDataListByTag[tag];
                                        if (pageDataLink && pageDataLink.array) {
                                            for (const pageData of pageDataLink.array) {
                                                const adaptedContent: any = this._adaptDocumentDataCb(pageData);
                                                if (adaptedContent) {
                                                    pageContentContextList.push(adaptedContent);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            result[name] = pageContentContextList;
                        }
                        break;
                    default:
                        break;
                }
            }
        }
        for (const propSpec of propsSpec) {
            if (!fulfilledProps.includes(propSpec.name)) {
                console.error(`[SiteBud CMS] missing the "${propSpec.name}" property in the "${this._documentData.name}" document data schema.`)
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

    private processComponents(
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
                    if (componentsItem.isArray) {
                        result[componentsItem.name] = [];
                    } else {
                        result[componentsItem.name] = {};
                    }
                }
            } else {
                console.error(`[SiteBud CMS] the "${componentsItem.name}" component in the document data does not exist in the "${this._documentData.name}" document data schema.`);
            }
        }
        for (const componentSpec of Object.entries(componentsSpec)) {
            if (!fulfilledComponents.includes(componentSpec[0])){
                result[componentSpec[0]] = {};
            }
        }
        return result;
    }

    private processBlocks(blocks: Array<DocumentContentBlock>, blocksSpec: BlocksSpecification): Array<Record<string, any>> {
        const result: Array<Record<string, any>> = [];
        for (const blocksItem of blocks) {
            const foundComponentsSpec = blocksSpec[blocksItem.name];
            let newBlock: any;
            if (foundComponentsSpec && blocksItem.components && blocksItem.components.length > 0) {
                newBlock = this.processComponents(blocksItem.components, foundComponentsSpec);
                newBlock.__accessLevel = blocksItem.accessLevel;
                result.push({
                    [blocksItem.name]: newBlock,
                });
            }
        }
        return result;
    }

    private processAreas(areas: Array<DocumentContentArea>, areasSpec: AreasSpecification): Record<string, any> {
        const result: Record<string, any> = {};
        for (const [areaSpecName] of Object.entries(areasSpec)) {
            result[areaSpecName] = [];
        }
        for (const area of areas) {
            const foundBlocksSpec = areasSpec[area.name];
            if (foundBlocksSpec && area.blocks && area.blocks.length > 0) {
                result[area.name] = this.processBlocks(area.blocks, foundBlocksSpec);
            } else {
                result[area.name] = [];
            }
        }
        return result;
    }

    protected processDocumentAreas(areasSpec: AreasSpecification): Record<string, any> {
        if (this._documentData.content?.documentAreas && this._documentData.content.documentAreas.length > 0) {
            return this.processAreas(this._documentData.content.documentAreas, areasSpec);
        }
        return {};
    }

    protected processDataFields(): Record<string, DataFieldValue> {
        const result: Record<string, DataFieldValue> = {};
        if (this._documentData.content?.dataFields && this._documentData.content?.dataFields.length > 0) {
            for (const dataField of this._documentData.content.dataFields) {
                result[dataField.name] = {
                    value: dataField.value,
                    type: dataField.type
                };
            }
        }
        return result;
    }

    protected processAuthorsProfiles(): Record<string, any> {
        const result: Record<string, any> = {};
        if (this._documentData.authorProfiles && this._adaptDocumentDataCb) {
            for (const documentDataEntry of Object.entries(this._documentData.authorProfiles)) {
                result[documentDataEntry[0]] = this._adaptDocumentDataCb(documentDataEntry[1]);
            }
        }
        return result;
    }

    abstract adapt(): T;
}
