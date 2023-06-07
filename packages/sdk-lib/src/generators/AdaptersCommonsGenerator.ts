import path from 'path';
import fs from 'fs-extra';
import upperFirst from 'lodash/upperFirst';
import lowerFirst from 'lodash/lowerFirst';
import template from 'lodash/template';
import {DocumentClass_Index, DocumentType} from '@sitebud/domain-lib';
import {formatTS} from './prettierWrapper';
import {adaptersHooksTemplate} from './adaptersHooksTemplate';
import {adaptersIndexTemplate} from './adaptersIndexTemplate';
import {adaptersTypesTemplate} from './adaptersTypesTemplate';
import {utilitiesTemplate} from './utilitiesTemplate';

type DocumentClassTemplate = {
    className: string;
    documentType: DocumentType;
};

type TemplateObject = {
    libPaths: Record<LibName, string>;
    upperFirst: typeof upperFirst;
    lowerFirst: typeof lowerFirst;
    classes: Array<DocumentClassTemplate>;
};

type LibName = 'bridgeLib' | 'domainLib';

const defaultLibsPaths: Record<LibName, string> = {
    bridgeLib: '@sitebud/bridge-lib',
    domainLib: '@sitebud/domain-lib'
};

export class AdaptersCommonsGenerator {
    private _documentClasses: DocumentClass_Index;
    private _libsPaths: Record<LibName, string>;
    private _outputDirPath: string;

    constructor(documentClasses: DocumentClass_Index, outputDirPath: string) {
        this._documentClasses = documentClasses;
        this._libsPaths = defaultLibsPaths;
        this._outputDirPath = outputDirPath;
    }

    private createTemplateObject(): TemplateObject {
        const classes: Array<DocumentClassTemplate> = [];
        for (const documentClass of Object.entries(this._documentClasses)) {
            classes.push({
                className: documentClass[0],
                documentType: documentClass[1].type
            });
        }
        return {
            libPaths: this._libsPaths,
            upperFirst,
            lowerFirst,
            classes
        } as TemplateObject;
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

    withLibPath(libName: LibName, libPath: string): AdaptersCommonsGenerator {
        this._libsPaths[libName] = libPath;
        return this;
    }

    async generate(): Promise<void> {
        await this.generateFile('hooks.ts', adaptersHooksTemplate);
        await this.generateFile('index.ts', adaptersIndexTemplate);
        await this.generateFile('types.ts', adaptersTypesTemplate);
        await this.generateFile('utils.ts', utilitiesTemplate);
    }
}
