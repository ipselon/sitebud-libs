import {SEARCH_TEXT_FILE_PATH, DocumentRecord_Bean, DocumentContent_Bean, Document_Bean} from '@sitebud/domain-lib';
import {readObjectFromFile} from '../utilities';
import {buildSearchText} from '../utilities/contentSearchBuilder';

const fs = require('fs-extra');
const path = require('path');
const searchIndexFilePath: string = path.join(process.cwd(), SEARCH_TEXT_FILE_PATH);

async function makeSearchIndexRecord(
    root: DocumentRecord_Bean,
    rootNodePath?: Array<DocumentRecord_Bean>
): Promise<void> {
    const localNodePath: Array<DocumentRecord_Bean> = rootNodePath ? [...rootNodePath, root] : [root];
    if (localNodePath.length > 0) {
        let byLocale: Record<string, string> = {};
        for (const nodeItem of localNodePath) {
            for (const nodeItemContent of Object.entries(nodeItem.contents)) {
                if (nodeItemContent[1]) {
                    if (!byLocale[nodeItemContent[0]]) {
                        byLocale[nodeItemContent[0]] = nodeItemContent[1].slug;
                    } else {
                        byLocale[nodeItemContent[0]] = `${byLocale[nodeItemContent[0]]}/${nodeItemContent[1].slug}`;
                    }
                }
            }
        }
        Object.keys(byLocale).forEach((localeKey) => {
            byLocale[localeKey] = byLocale[localeKey].replace('@site', '');
        });
        const documentFilePath = path.join(process.cwd(), `data/documents/${root.id}.json`);
        const document: Document_Bean = await readObjectFromFile(documentFilePath);
        if (document && document.contents) {
            for (const contentItem of Object.entries(document.contents)) {
                const keyPath: string | undefined = byLocale[contentItem[0]];
                const documentContent: DocumentContent_Bean = contentItem[1];
                if (keyPath && documentContent) {
                    const searchText: string = buildSearchText(documentContent);
                    await fs.appendFile(searchIndexFilePath, `keyPath=${keyPath};locale=${contentItem[0]};title=${documentContent.title};text=${searchText}\n`);
                }
            }
        }
    }
    if (root.children && root.children.length > 0) {
        let childDocument: DocumentRecord_Bean;
        for (childDocument of root.children) {
            await makeSearchIndexRecord(childDocument, [...localNodePath]);
        }
    }
}

export async function generateSearchIndex(newId: string): Promise<void> {
    try {
        const searchIndexFilePath = path.join(process.cwd(), SEARCH_TEXT_FILE_PATH);
        await fs.ensureFile(searchIndexFilePath);
        await fs.outputFile(searchIndexFilePath, `BUILD_ID:${newId}\n`);
    } catch (e: any) {
        console.error('[SiteBud CMS] Can not generate search index file: ', e.message);
    }

    try {
        const siteMapFilePath = path.join(process.cwd(), 'data/siteMap.json');
        const siteMap = await fs.readJSON(siteMapFilePath);
        await makeSearchIndexRecord(siteMap.root);
    } catch (e: any) {
        console.error('[SiteBud CMS] Can not write to search index file: ', e.message);
    }
}
