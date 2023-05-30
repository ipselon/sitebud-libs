import React from 'react';
import {PreviewNotification} from '../preview/PreviewNotification';
import {DataProvider} from './DataProvider';
import {usePreview} from './usePreview';
import {PreviewModeMark} from '../preview/PreviewModeMark';
import {RequestOptions} from './types';

interface PreviewDataProviderProps {
    Script: React.FC<any>;
    custom404: React.ReactNode;
    locale: string;
    requestOptions: RequestOptions;
    slug?: string;
    children: React.ReactNode;
}

const octokitCDNScript: string = `
import { Octokit } from 'https://cdn.jsdelivr.net/npm/@octokit/core@4.2.1/+esm';
window.Octokit = Octokit;
`;


export function PreviewDataProvider(props: PreviewDataProviderProps) {
    const {Script, custom404, locale, requestOptions, slug, children} = props;

    const {status, siteTreePreview, documentIdPreview, error} = usePreview(
        true,
        locale,
        {
            accessLevel: requestOptions.accessLevel || 0
        },
        slug
    );

    let content: JSX.Element;
    let notification: JSX.Element | null = null;
    if (documentIdPreview) {
        if (status === 'uninitialized' || status === 'loading') {
            notification = (
                <PreviewNotification message="Please wait. Loading data from GitHub..." />
            );
        } else if (status === 'error') {
            notification = (
                <PreviewNotification message={error || 'Some error occurred. See the console output.'} severity="error" />
            );
        }
        content = (
            <DataProvider data={{siteTree: siteTreePreview, documentId: documentIdPreview}}>
                {notification}
                {children}
            </DataProvider>
        );
    } else {
        if (status === 'uninitialized' || status === 'loading') {
            content = (
                <PreviewNotification message="Please wait. Loading data from GitHub..." />
            );
        } else if (status === 'error') {
            content = (
                <PreviewNotification message={error || 'Some error occurred. See the console output.'} severity="error" />
            );
        } else {
            content = (
                <>{custom404}</>
            );
        }
    }

    return (
        <>
            <Script
                id="octokit-script"
                type="module"
                strategy="beforeInteractive"
                dangerouslySetInnerHTML={{
                    __html: octokitCDNScript
                }}
            />
            <PreviewModeMark />
            {content}
        </>
    );
}