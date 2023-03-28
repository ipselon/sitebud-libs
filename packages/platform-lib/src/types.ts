import {ReactNode, CSSProperties} from 'react';

export interface HeadProps {
    children?: ReactNode;
}

export interface LinkProps {
    href: string;
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
}

export interface ImgProps {
    url?: string;
    alt?: string;
    svg?: string;
    className?: string;
}
