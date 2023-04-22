export const dataContentAdapterProviderTemplate: string = `
import React, {ReactNode} from 'react';
import {Data, useData} from '<%= libPaths.bridgeLib %>';
import {useDocumentDataAdapter} from './hooks';
import {DocumentContentContext} from './types';

export type ContentAdapterProviderProps = {
    children: ReactNode;
};

export const DocumentContentContextInstance = React.createContext<DocumentContentContext>({});

export const ContentAdapterProvider: React.FC<ContentAdapterProviderProps> = (props) => {
    const { children } = props;
    const rawData: Data = useData();
    const documentContentContext: DocumentContentContext = useDocumentDataAdapter(rawData);
    return (
        <DocumentContentContextInstance.Provider value={documentContentContext}>
            {children}
        </DocumentContentContextInstance.Provider>
    );
};
`;