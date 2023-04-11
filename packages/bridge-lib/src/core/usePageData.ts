import {useContext} from 'react';
import {PageDataContext} from './PageDataProvider';
import {DocumentData} from './types';

export const usePageData = (): DocumentData => {
    return useContext(PageDataContext);
};
