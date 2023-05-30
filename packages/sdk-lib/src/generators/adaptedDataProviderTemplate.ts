export const adaptedDataProviderTemplate: string = `
import React, {ReactNode} from 'react';
import {Data, useData} from '<%= libPaths.bridgeLib %>';
import {useDataAdapter} from './hooks';
import {DocumentContentContext, DocumentNode} from './types';

export type AdaptedDataProviderProps = {
    children: ReactNode;
};

export type AdaptedData = {
    documentContentContext?: DocumentContentContext;
    documentsTree?: DocumentNode;
    documentsMap?: Record<string, DocumentNode>;
};

export const AdaptedDataContext = React.createContext<AdaptedData | null>(null);

export const AdaptedDataProvider: React.FC<AdaptedDataProviderProps> = (
    props
) => {
    const { children } = props;
    const rawData: Data | null = useData();
    const {documentsTree, documentContentContext, documentsMap} = useDataAdapter(rawData);
    if (documentsTree && documentContentContext) {
        return (
            <AdaptedDataContext.Provider value={{documentsTree, documentContentContext, documentsMap}}>
                {children}
            </AdaptedDataContext.Provider>
        );
    }
    return (
        <AdaptedDataContext.Provider value={null}>
            {children}
        </AdaptedDataContext.Provider>
    );
};
`;