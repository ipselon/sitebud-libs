import path from 'path';
import fs from 'fs-extra';
import upperFirst from 'lodash/upperFirst';
import lowerFirst from 'lodash/lowerFirst';
import template from 'lodash/template';
import {formatTS} from './prettierWrapper';
import {adaptersHooksTemplate} from './adaptersHooksTemplate';
import {adaptersIndexTemplate} from './adaptersIndexTemplate';
import {adaptersTypesTemplate} from './adaptersTypesTemplate';

type TemplateObject = {
    libPaths: Record<LibName, string>;
    upperFirst: typeof upperFirst;
    lowerFirst: typeof lowerFirst;
    classNames: Array<string>;
};

type LibName = 'bridgeLib' | 'domainLib';

const defaultLibsPaths: Record<LibName, string> = {
    bridgeLib: '@sitebud/bridge-lib',
    domainLib: '@sitebud/domain-lib'
};

export class AdaptersCommonsGenerator {
    private _documentClassNames: Array<string>;
    private _libsPaths: Record<LibName, string>;
    private _outputDirPath: string;

    constructor(documentClassNames: Array<string>, outputDirPath: string) {
        this._documentClassNames = documentClassNames;
        this._libsPaths = defaultLibsPaths;
        this._outputDirPath = outputDirPath;
    }

    private createTemplateObject(): TemplateObject {
        return {
            libPaths: this._libsPaths,
            upperFirst,
            lowerFirst,
            classNames: this._documentClassNames
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
    }
}
