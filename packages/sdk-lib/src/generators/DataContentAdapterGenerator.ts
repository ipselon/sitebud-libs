import path from 'path';
import fs from 'fs-extra';
import upperFirst from 'lodash/upperFirst';
import forOwn from 'lodash/forOwn';
import template from 'lodash/template';
import {
    DocumentClass,
    DocumentContentBlockClass,
    DocumentContentBlockComponentClass,
    AnyFieldType,
    DocumentContentBlockComponentFieldClass,
    DocumentContentDataFieldClass,
    DocumentContentAreaClass
} from '@sitebud/domain-lib';
import {formatTS} from './prettierWrapper';
import {dataContentTypeTemplate} from './dataContentTypeTemplate';
import {dataContentAdapterTemplate} from './dataContentAdapterTemplate';

type TemplateComponentObject = { name: string; isArray?: boolean };
type TemplatePropObject = { name: string; type: AnyFieldType };

type AreasTemplateObject = {
    areasNames: Array<string>;
    areaBlocksNames: Record<string, Array<string>>;
    areaBlockComponents: Record<string, Array<TemplateComponentObject>>;
    areaComponentProps: Record<string, Array<TemplatePropObject>>;
};

type TemplateObject = {
    libPaths: Record<LibName, string>;
    upperFirst: any;
    forOwn: any;
    className: string;
    dataFields: Array<string>;
    documentAreasNames: Array<string>;
    documentAreaBlocksNames: Record<string, Array<string>>;
    commonAreasNames: Array<string>;
    commonAreaBlocksNames: Record<string, Array<string>>;
    blockComponents: Record<string, Array<TemplateComponentObject>>;
    componentProps: Record<string, Array<TemplatePropObject>>;
};

type LibName = 'bridgeLib' | 'domainLib';

const defaultLibsPaths: Record<LibName, string> = {
    bridgeLib: '@sitebud/bridge-lib',
    domainLib: '@sitebud/domain-lib'
};

export class DataContentAdapterGenerator {
    private _className: string;
    private _documentClass: DocumentClass;
    private _libsPaths: Record<LibName, string>;
    private _outputDirPath: string;

    constructor(className: string, documentClass: DocumentClass, outputDirPath: string) {
        this._className = className;
        this._documentClass = documentClass;
        this._libsPaths = defaultLibsPaths;
        this._outputDirPath = outputDirPath;
    }

    private createAreasTemplateObject(
        areas: Record<string, DocumentContentAreaClass>
    ): AreasTemplateObject {
        const result: AreasTemplateObject = {
            areasNames: [],
            areaBlocksNames: {},
            areaBlockComponents: {},
            areaComponentProps: {}
        };
        let documentAreaClassTuples: Array<[string, DocumentContentAreaClass]> = Object.entries(areas);
        for (const documentAreaClassTuple of documentAreaClassTuples) {
            const blockClassTuples: Array<[string, DocumentContentBlockClass]> = Object.entries(documentAreaClassTuple[1].blocks);
            const areaBlocksNames: Array<string> = [];
            for (const blockClassTuple of blockClassTuples) {
                areaBlocksNames.push(blockClassTuple[0]);
                const componentClassTuples: Array<[string, DocumentContentBlockComponentClass]> = Object.entries(blockClassTuple[1].components);
                const blockComponents: Array<TemplateComponentObject> = [];
                for (const componentClassTuple of componentClassTuples) {
                    blockComponents.push({
                        name: componentClassTuple[0],
                        isArray: componentClassTuple[1].isArray
                    });
                    const fieldClassTuples: Array<[string, DocumentContentBlockComponentFieldClass]> = Object.entries(componentClassTuple[1].props);
                    const componentProps: Array<TemplatePropObject> = [];
                    for (const fieldClassTuple of fieldClassTuples) {
                        componentProps.push({
                            name: fieldClassTuple[0],
                            type: fieldClassTuple[1].type
                        });
                    }
                    result.areaComponentProps[componentClassTuple[0]] = componentProps;
                }
                result.areaBlockComponents[blockClassTuple[0]] = blockComponents;
            }
            result.areaBlocksNames[documentAreaClassTuple[0]] = areaBlocksNames;
            result.areasNames.push(documentAreaClassTuple[0]);
        }
        return result;
    }

    private createTemplateObject(): TemplateObject {
        const result: TemplateObject = {
            libPaths: this._libsPaths,
            upperFirst,
            forOwn,
            className: this._className,
            dataFields: [],
            documentAreasNames: [],
            documentAreaBlocksNames: {},
            commonAreasNames: [],
            commonAreaBlocksNames: {},
            blockComponents: {},
            componentProps: {}
        };
        let dataFieldClassTuples: Array<[string, DocumentContentDataFieldClass]> = Object.entries(this._documentClass.dataFields);
        dataFieldClassTuples = dataFieldClassTuples.sort((a, b) => {
            return a[1].indexNumber - b[1].indexNumber;
        });
        for (const dataFieldClassTuple of dataFieldClassTuples) {
            result.dataFields.push(dataFieldClassTuple[0]);
        }
        const documentAreasTemplateObject: AreasTemplateObject = this.createAreasTemplateObject(this._documentClass.documentAreas);
        result.documentAreasNames = documentAreasTemplateObject.areasNames;
        result.documentAreaBlocksNames = documentAreasTemplateObject.areaBlocksNames;
        result.blockComponents = documentAreasTemplateObject.areaBlockComponents;
        result.componentProps = documentAreasTemplateObject.areaComponentProps;

        const commonAreasTemplateObject: AreasTemplateObject = this.createAreasTemplateObject(this._documentClass.commonAreas);
        result.commonAreasNames = commonAreasTemplateObject.areasNames;
        result.commonAreaBlocksNames = commonAreasTemplateObject.areaBlocksNames;
        result.blockComponents = {...result.blockComponents, ...commonAreasTemplateObject.areaBlockComponents};
        result.componentProps = {...result.componentProps, ...commonAreasTemplateObject.areaComponentProps};

        return result;
    }

    private async generateFile(fileName: string, templateText: string): Promise<void> {
        let outputFilePath: string = '';
        try {
            outputFilePath = path.join(this._outputDirPath, fileName);
            const typeFileBody: string = template(templateText)(this.createTemplateObject());
            await fs.ensureFile(outputFilePath);
            await fs.writeFile(outputFilePath, formatTS(typeFileBody));
        } catch (e: any) {
            throw Error(`Error while generating '${outputFilePath}' file. Error: ${e.message}`);
        }
    }

    withLibPath(libName: LibName, libPath: string): DataContentAdapterGenerator {
        this._libsPaths[libName] = libPath;
        return this;
    }

    async generate(): Promise<void> {
        await this.generateFile(`${upperFirst(this._className)}Content.ts`, dataContentTypeTemplate);
        await this.generateFile(`${upperFirst(this._className)}ContentAdapter.ts`, dataContentAdapterTemplate);
    }
}
