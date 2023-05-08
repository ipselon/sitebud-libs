import path from 'path';
import {DocumentClass, DocumentClass_Index} from '@sitebud/domain-lib';
import {generateJsonFile, deleteDir} from '../utilities';
import {DataContentAdapterGenerator} from './DataContentAdapterGenerator';
import {AdaptersCommonsGenerator} from './AdaptersCommonsGenerator';

export class FilesGenerator {
    private _configDirPath: string;
    private _adaptersDirPath: string;
    private _documentClasses: DocumentClass_Index;

    constructor() {
        this._configDirPath = path.join(process.cwd(), 'data-config');
        this._adaptersDirPath = path.join(process.cwd(), 'src', 'adapters');
        this._documentClasses = {};
    }

    withAdaptersDir(dirPath: string): FilesGenerator {
        this._adaptersDirPath = path.join(process.cwd(), dirPath);
        return this;
    }

    withDocuments(index: DocumentClass_Index): FilesGenerator {
        this._documentClasses = {...this._documentClasses, ...index};
        return this;
    }

    async generate(): Promise<void> {
        await deleteDir(this._adaptersDirPath);
        const documentClassTuples: Array<[string, DocumentClass]> = Object.entries(this._documentClasses);
        for (const documentClassTuple of documentClassTuples) {
            await new DataContentAdapterGenerator(
                documentClassTuple[0],
                documentClassTuple[1],
                this._adaptersDirPath
            ).generate();
        }
        await new AdaptersCommonsGenerator(this._documentClasses, this._adaptersDirPath).generate();
        await generateJsonFile(this._documentClasses, path.join(this._configDirPath, 'documentClassIndex.json'));
    };
}
