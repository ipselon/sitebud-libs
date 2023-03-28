import {useContext} from 'react';
import {PageDataContext} from './PageDataProvider';
import {PageData} from './types';

export const usePageData = (): PageData => {
    return useContext(PageDataContext);
};
