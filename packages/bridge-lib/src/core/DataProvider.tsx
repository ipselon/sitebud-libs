import React, { ReactNode } from 'react';
import {Data} from './types';


export type DataProviderProps = {
    data?: Data;
    children: ReactNode;
};

export const DataContext = React.createContext<Data | null>(null);

export const DataProvider: React.FC<DataProviderProps> = (props) => {
    const { children, data } = props;
    return (
        <DataContext.Provider value={data || null}>
            {children}
        </DataContext.Provider>
    );
};
