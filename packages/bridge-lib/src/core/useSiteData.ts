import {useContext} from 'react';
import {SiteDataContext} from './SiteDataProvider';
import {DocumentData} from './types';

export const useSiteData = (): DocumentData => {
    return useContext(SiteDataContext);
};
