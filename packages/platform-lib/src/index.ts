import React from 'react';
import { HeadProps, ImgProps, LinkProps } from './types';

const fakeFCInst: React.FC<any> = () => { return null };

export const Img: React.FC<ImgProps> = fakeFCInst;

export const Link: React.FC<LinkProps> = fakeFCInst;

export const Head: React.FC<HeadProps> = fakeFCInst;
