import fs from 'fs-extra';

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
