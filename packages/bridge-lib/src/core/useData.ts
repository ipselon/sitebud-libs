import {useContext} from 'react';
import {DataContext} from './DataProvider';
import {Data} from './types';

export const useData = (): Data | null => {
    return useContext(DataContext);
};
