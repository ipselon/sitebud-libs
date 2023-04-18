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
    DocumentContentAreaClass,
    DocumentType
} from '@sitebud/domain-lib';
import {formatTS, removeEmptyLines} from './prettierWrapper';
import {dataContentTypeTemplate} from './dataContentTypeTemplate';
import {dataContentAdapterTemplate} from './dataContentAdapterTemplate';

type TemplatePropObject = { name: string; type: AnyFieldType };
type TemplateComponentObject = {
    name: string;
    isArray?: boolean
    componentProps: Array<TemplatePropObject>;
};
type TemplateAreaObject = Record<string, Array<TemplateComponentObject>>;

type AreasTemplateObject = {
    areasNames: Array<string>;
    areas: Record<string, TemplateAreaObject>;
};

type TemplateObject = {
    libPaths: Record<LibName, string>;
    upperFirst: any;
    forOwn: any;
    className: string;
    documentType: DocumentType;
    dataFields: Array<string>;
    documentAreasNames: Array<string>;
    documentAreas: Record<string, TemplateAreaObject>;
    commonAreasNames: Array<string>;
    commonAreas: Record<string, TemplateAreaObject>;
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
            areas: {},
        };
        let documentAreaClassTuples: Array<[string, DocumentContentAreaClass]> = Object.entries(areas);
        for (const documentAreaClassTuple of documentAreaClassTuples) {
            const blockClassTuples: Array<[string, DocumentContentBlockClass]> = Object.entries(documentAreaClassTuple[1].blocks);
            const area: TemplateAreaObject = {};
            for (const blockClassTuple of blockClassTuples) {
                const componentClassTuples: Array<[string, DocumentContentBlockComponentClass]> = Object.entries(blockClassTuple[1].components);
                const blockComponents: Array<TemplateComponentObject> = [];
                for (const componentClassTuple of componentClassTuples) {
                    const fieldClassTuples: Array<[string, DocumentContentBlockComponentFieldClass]> = Object.entries(componentClassTuple[1].props);
                    const componentProps: Array<TemplatePropObject> = [];
                    for (const fieldClassTuple of fieldClassTuples) {
                        componentProps.push({
                            name: fieldClassTuple[0],
                            type: fieldClassTuple[1].type
                        });
                    }
                    blockComponents.push({
                        name: componentClassTuple[0],
                        isArray: componentClassTuple[1].isArray,
                        componentProps
                    });
                }
                area[blockClassTuple[0]] = blockComponents;
            }
            result.areas[documentAreaClassTuple[0]] = area;
            result.areasNames.push(documentAreaClassTuple[0]);
        }
        return result;
    }

    private createTemplateObject(): TemplateObject {
        const result: TemplateObject = {
            libPaths: this._libsPaths,
            upperFirst,
            forOwn,
            documentType: this._documentClass.type,
            className: this._className,
            dataFields: [],
            documentAreasNames: [],
            documentAreas: {},
            commonAreasNames: [],
            commonAreas: {}
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
        result.documentAreas = documentAreasTemplateObject.areas;

        if (this._documentClass.commonAreas) {
            const commonAreasTemplateObject: AreasTemplateObject = this.createAreasTemplateObject(this._documentClass.commonAreas);
            result.commonAreasNames = commonAreasTemplateObject.areasNames;
            result.commonAreas = commonAreasTemplateObject.areas;
        }
        return result;
    }

    private async generateFile(fileName: string, templateText: string): Promise<void> {
        let outputFilePath: string = '';
        try {
            outputFilePath = path.join(this._outputDirPath, fileName);
            const typeFileBody: string = template(templateText)(this.createTemplateObject());
            await fs.ensureFile(outputFilePath);
            await fs.writeFile(outputFilePath, removeEmptyLines(formatTS(typeFileBody)));
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
