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
    Icon, StringValue
} from '@pancodex/domain-lib';
import {PageData, DataFieldValue} from './types';

type AreasSpecification = Record<string, BlocksSpecification>;
type BlocksSpecification = Record<string, ComponentsSpecification>;
type ComponentsSpecification = Record<string, PropsSpecification>;
type PropsSpecification = Array<string>;

type AdaptPageDataCallBack = (pageData: PageData) => any;

export abstract class ContentAdapter<T> {
    protected readonly _pageData: PageData;
    protected readonly _adaptPageDataCb: AdaptPageDataCallBack | undefined;

    public constructor(pageData: PageData, adaptPageDataCb?: AdaptPageDataCallBack | undefined) {
        this._pageData = pageData;
        this._adaptPageDataCb = adaptPageDataCb;
    }

    protected processProps(props: Array<DocumentContentBlockComponentField>, propsSpec: PropsSpecification): Record<string, any> {
        const result: Record<string, any> = {};
        for (const propsItem of props) {
            if (propsSpec.includes(propsItem.name)) {
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
                        if (this._adaptPageDataCb) {
                            const {documentsIds, selectionMode} = (fieldContent as DocumentsList);
                            if (documentsIds && documentsIds.length > 0) {
                                const pageContentContextList: Array<any> = [];
                                if (selectionMode === 'selectChildrenDocuments') {
                                    for(const parentDocumentId of documentsIds) {
                                        if (parentDocumentId && this._pageData.pageDataListByParentId) {
                                            const pageDataList: Array<PageData> | null = this._pageData.pageDataListByParentId[parentDocumentId];
                                            if (pageDataList) {
                                                for (const pageData of pageDataList) {
                                                    const adaptedContent: any = this._adaptPageDataCb(pageData);
                                                    if (adaptedContent) {
                                                        pageContentContextList.push(adaptedContent);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } else if (selectionMode === 'selectDocuments') {
                                    for(const documentId of documentsIds) {
                                        if (documentId && this._pageData.pageDataById) {
                                            const pageData: PageData | null = this._pageData.pageDataById[documentId];
                                            if (pageData) {
                                                const adaptedContent: any = this._adaptPageDataCb(pageData);
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
        return result;
    }

    protected processComponents(
        components: Array<DocumentContentBlockComponent>,
        componentsSpec: ComponentsSpecification
    ): Record<string, any> {
        const result: Record<string, any> = {};
        for (const componentsItem of components) {
            const foundPropsSpec = componentsSpec[componentsItem.name];
            if (foundPropsSpec) {
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
