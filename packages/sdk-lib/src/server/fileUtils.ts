import path from 'path';
import fs from 'fs-extra';
import klawSync from 'klaw-sync';
import {FileDescription} from '../types';

export function readAllFilesInDir(dirPath: string): Array<FileDescription> {
    const resultList: Array<FileDescription> = [];
    const fileList = klawSync(dirPath, {nodir: true});
    if (fileList && fileList.length > 0) {
        fileList.forEach((fileItem: any) => {
            const {path: filePath} = fileItem;
            resultList.push({
                filePath,
                fileName: path.basename(filePath),
                fileData: fs.readFileSync(filePath, {encoding: 'utf8'})
            });
        });
    }
    return resultList;
}

export function readFile(filePath: string): FileDescription {
    return {
        filePath,
        fileName: path.basename(filePath),
        fileData: fs.readFileSync(filePath, {encoding: 'utf8'})
    };
}
