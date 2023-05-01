import {SearchIndexItem} from './types';

export function parseAndSearchIndexText(inputText: string, searchText: string): Array<SearchIndexItem> {
    const lines = inputText.split('\n');
    const foundIndex: Record<string, SearchIndexItem> = {};
    let newLine: string;
    const testSearchText: string = searchText.toUpperCase();
    for (const line of lines) {
        newLine = `${line}\n`;
        const keyPathMatch = newLine.match(/keyPath=(.*?);/);
        const localeMatch = newLine.match(/locale=(.*?);/);
        const titleMatch = newLine.match(/title=(.*?);/);
        const textMatch = newLine.match(/text=(.*?)\n/);

        if (keyPathMatch && localeMatch && titleMatch && textMatch) {
            const keyPath: string = keyPathMatch[1];
            const locale: string = localeMatch[1];
            const testText: string = textMatch[1];
            const testTitle: string = titleMatch[1];
            const foundKey: string = `${keyPath}/${locale}`;
            const testTextParts: Array<string> = testText.split('|c|');
            let found: boolean = false;
            const foundChunks: Array<string> = [];
            if (testTitle.toUpperCase().includes(testSearchText)) {
                found = true;
            }
            for(const chunkItem of testTextParts) {
                if (chunkItem.toUpperCase().includes(testSearchText)) {
                    found = true;
                    foundChunks.push(chunkItem);
                }
            }
            if (found) {
                foundIndex[foundKey] = {
                    keyPath,
                    locale,
                    title: testTitle,
                    chunks: foundChunks
                };
            }
        }
    }
    if (Object.keys(foundIndex).length > 0) {
        return Object.keys(foundIndex).map(key => {
            return {...foundIndex[key]};
        });
    }
    return [];
}

export function parseIndexText(inputText: string): Array<SearchIndexItem> {
    const lines = inputText.split('\n');
    const foundIndex: Record<string, SearchIndexItem> = {};
    let newLine: string;
    for (const line of lines) {
        newLine = `${line}\n`;
        const keyPathMatch = newLine.match(/keyPath=(.*?);/);
        const localeMatch = newLine.match(/locale=(.*?);/);
        const titleMatch = newLine.match(/title=(.*?);/);
        const textMatch = newLine.match(/text=(.*?)\n/);
        if (keyPathMatch && localeMatch && titleMatch && textMatch) {
            const keyPath: string = keyPathMatch[1];
            const locale: string = localeMatch[1];
            const testText: string = textMatch[1];
            const testTitle: string = titleMatch[1];
            const foundKey: string = `${keyPath}/${locale}`;
            const testTextParts: Array<string> = testText.split('|c|');
            const foundChunks: Array<string> = [];
            for(const chunkItem of testTextParts) {
                foundChunks.push(chunkItem);
            }
            foundIndex[foundKey] = {
                keyPath,
                locale,
                title: testTitle,
                chunks: foundChunks
            };
        }
    }
    if (Object.keys(foundIndex).length > 0) {
        return Object.keys(foundIndex).map(key => {
            return {...foundIndex[key]};
        });
    }
    return [];
}
