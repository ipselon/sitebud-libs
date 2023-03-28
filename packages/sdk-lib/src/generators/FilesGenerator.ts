import path from 'path';
import {DocumentClass, DocumentClass_Index} from '@pancodex/domain-lib';
import {generateJsonFile, readObjectFromFile, deleteDir} from './utilities';
import {DataContentAdapterGenerator} from './DataContentAdapterGenerator';
import {AdaptersCommonsGenerator} from './AdaptersCommonsGenerator';


export class FilesGenerator {
    private _dataDirPath: string;
    private _themeAdaptersDirPath: string;
    private _documentClasses: DocumentClass_Index;

    constructor() {
        this._dataDirPath = path.join(process.cwd(), 'data');
        this._themeAdaptersDirPath = path.join(process.cwd(), 'src', 'adapters');
        this._documentClasses = {};
    }

    private async _generateKeyValuesIndex(keyValuesIndex: any, outputFilePath: string): Promise<void> {
        let prevObject: any;
        try {
            prevObject = await readObjectFromFile(outputFilePath);
        } catch (e) {
        }
        if (prevObject) {
            prevObject = {...keyValuesIndex, ...prevObject};
        } else {
            prevObject = keyValuesIndex;
        }
        return generateJsonFile(prevObject, outputFilePath);
    }

    withDataDir(dirPath: string): FilesGenerator {
        this._dataDirPath = path.join(process.cwd(), dirPath);
        return this;
    }

    withThemeAdaptersDir(dirPath: string): FilesGenerator {
        this._themeAdaptersDirPath = path.join(process.cwd(), dirPath);
        return this;
    }

    withDocumentClasses(index: DocumentClass_Index): FilesGenerator {
        this._documentClasses = {...this._documentClasses, ...index};
        return this;
    }

    async generate(): Promise<void> {
        await deleteDir(this._dataDirPath);
        const documentClassTuples: Array<[string, DocumentClass]> = Object.entries(this._documentClasses);
        let classNames: Array<string> = [];
        for (const documentClassTuple of documentClassTuples) {
            await new DataContentAdapterGenerator(
                documentClassTuple[0],
                documentClassTuple[1],
                this._themeAdaptersDirPath
            ).generate()
            classNames.push(documentClassTuple[0]);
        }
        await new AdaptersCommonsGenerator(classNames, this._themeAdaptersDirPath).generate();
        await generateJsonFile(this._documentClasses, path.join(this._dataDirPath, 'documentClassIndex.json'));
    };

}