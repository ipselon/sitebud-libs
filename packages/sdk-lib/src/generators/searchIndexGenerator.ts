const fs = require('fs-extra');
const path = require('path');

export async function generateSearchIndex(newId: string): Promise<void> {
    try {
        const searchIndexFilePath = path.join(process.cwd(), 'public/__search_index.ftstxt');
        await fs.ensureFile(searchIndexFilePath);
        await fs.outputFile(searchIndexFilePath, `BUILD_ID:${newId}\n`);
    } catch (e: any) {
        console.error('[SiteBud CMS] Can not generate search index file: ', e.message);
    }
}