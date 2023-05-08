import path from 'path';
import type {DocumentClass_Index, Document_Bean} from '@sitebud/domain-lib';
import {fixDocument} from '@sitebud/domain-lib';
import {generateJsonFile, readObjectFromFile, readAllFilesInDir} from '../utilities';
import {FileDescription} from '../utilities/types';

export class FilesCompiler {
    private _dataDirPath: string;
    private _configDirPath: string;

    constructor() {
        this._configDirPath = path.join(process.cwd(), 'data-config');
        this._dataDirPath = path.join(process.cwd(), 'data');
    }

    async fixDocuments(): Promise<void> {
        const documentClassIndex: DocumentClass_Index = await readObjectFromFile(path.join(this._configDirPath, 'documentClassIndex.json'));
        if (documentClassIndex) {
            const documentFilesList: Array<FileDescription> = readAllFilesInDir(path.join(this._dataDirPath, 'documents'));
            if (documentFilesList && documentFilesList.length > 0) {
                for (const documentFile of documentFilesList) {
                    let prevDocument: Document_Bean | undefined = undefined;
                    try {
                        prevDocument = JSON.parse(documentFile.fileData);
                    } catch (e) {
                        //
                    }
                    if (prevDocument) {
                        const fixedDocument: Document_Bean = fixDocument(prevDocument, documentClassIndex);
                        await generateJsonFile(fixedDocument, documentFile.filePath);
                    }
                }
            }
        }
    };
}
