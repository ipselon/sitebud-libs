import {SEARCH_TEXT_FILE_PATH} from '@sitebud/domain-lib';
import {fsExtra, path} from '../core/externalModules';
import type {DocumentData} from '../core/types';
import {buildSearchText} from '../core/contentSearchBuilder';

export async function putIntoSearch(pageData: DocumentData, locale: string) {
    if (process.env.NODE_ENV !== 'development') {
        const searchIndexFilePath: string = path.join(process.cwd(), SEARCH_TEXT_FILE_PATH);
        if (fsExtra.existsSync(searchIndexFilePath) && pageData.content) {
            const searchText: string = buildSearchText(pageData.content);
            const stream = fsExtra.createWriteStream(searchIndexFilePath, {flags: 'a'});
            // Write data to file
            stream.write(`keyPath=${pageData.path};locale=${locale};title=${pageData.content?.title};text=${searchText}\n`, (err: any) => {
                if (err) {
                    console.error(`Can not write to the search text file. ${err.message}`);
                }
                console.log(`[SiteBud CMS] the content from ${locale}/${pageData.path} is added to the search text file.`);
            });
            // Listen for 'finish' event
            // stream.on('finish', () => {
            // console.log('All data has been flushed to the search text file');
            // });
            // Close the stream
            stream.end();
        }
    }
}
