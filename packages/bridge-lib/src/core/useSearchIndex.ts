import {SEARCH_TEXT_FILE_URL} from '@sitebud/domain-lib';
import {SearchIndexItem} from './types';
import {parseAndSearchIndexText, parseIndexText} from './searchIndexParser';

let cachedSearchText: string;
let cachedTimestamp: number = 0;
const CACHE_DELTA: number = 1000 * 60 * 10; // 10 minutes

function getFullUrl(partialUrl: string): string {
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    return new URL(partialUrl, baseUrl).toString();
}

async function fetchFile(): Promise<string> {
    const fullUrl = getFullUrl(SEARCH_TEXT_FILE_URL);
    try {
        const response = await fetch(fullUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.text();
    } catch (error) {
        console.error("Error fetching the search text file:", error);
    }
    return '';
}

async function fetchAndSearchText(searchText: string): Promise<Array<SearchIndexItem>> {
    let resultList: Array<SearchIndexItem> = [];
    if (typeof window !== 'undefined') {
        if (!cachedSearchText || (cachedSearchText && Date.now() - cachedTimestamp >= CACHE_DELTA)) {
            cachedSearchText = await fetchFile();
            if (cachedSearchText && cachedSearchText.length > 0) {
                cachedTimestamp = Date.now();
            }
        }
        resultList = parseAndSearchIndexText(cachedSearchText, searchText);
    }
    return resultList;
}

async function fetchFullIndex(): Promise<Array<SearchIndexItem>> {
    if (!cachedSearchText || (cachedSearchText && Date.now() - cachedTimestamp >= CACHE_DELTA)) {
        cachedSearchText = await fetchFile();
        if (cachedSearchText && cachedSearchText.length > 0) {
            cachedTimestamp = Date.now();
        }
    }
    return parseIndexText(cachedSearchText);
}

export function useSearchIndex(): {
    fetchAndSearchText: (searchText: string) => Promise<Array<SearchIndexItem>>,
    fetchFullIndex: () => Promise<Array<SearchIndexItem>>
} {
    return {
        fetchAndSearchText,
        fetchFullIndex
    };
}
