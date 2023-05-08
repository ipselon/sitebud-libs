import fs from 'fs-extra';
import path from 'path';
import klawSync from 'klaw-sync';
import {FileDescription} from './types';

const INDENT_SIZE: number = 2;

export async function readObjectFromFile(sourceFilePath: string): Promise<any> {
    try {
        return fs.readJSON(sourceFilePath);
    } catch (e: any) {
        throw Error(`Error in reading '${sourceFilePath}' file. ${e.message}`);
    }
}

export async function generateJsonFile(object: any, outputFilePath: string): Promise<void> {
    try {
        await fs.ensureFile(outputFilePath);
        await fs.writeJSON(outputFilePath, object, {spaces: INDENT_SIZE});
    } catch (e: any) {
        throw Error(`Error in generating '${outputFilePath}' file. ${e.message}`);
    }
}

export async function deleteDir(dirPath: string): Promise<void> {
    try{
        await fs.remove(dirPath);
    } catch (e: any) {
        throw Error(`Error removing the ${dirPath} directory. ${e.message}`);
    }
}

export function readAllFilesInDir(dirPath: string): Array<FileDescription> {
    const resultList: Array<FileDescription> = [];
    if (fs.existsSync(dirPath)) {
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
    }
    return resultList;
}