import {useContext} from 'react';
import {PageDataContext} from './PageDataProvider';
import {DocumentData, Data} from './types';
import {SiteDataContext} from './SiteDataProvider';

export const useData = (): Data => {
    const pageData: DocumentData = useContext(PageDataContext);
    const siteData: DocumentData = useContext(SiteDataContext);
    return {
        pageData,
        siteData
    };
};
