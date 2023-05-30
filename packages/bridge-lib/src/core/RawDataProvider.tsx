import React from 'react';
import {Data} from './types';
import {DataProvider} from './DataProvider';

interface RawDataProviderProps {
    data?: Data;
    custom404: React.ReactNode;
    children: React.ReactNode;
}

export function RawDataProvider(props: RawDataProviderProps) {
    const {data, custom404, children} = props;
    if (data && data.documentId) {
        return (
            <DataProvider data={data}>
                {children}
            </DataProvider>
        );
    }
    return <>{custom404}</>;
}
