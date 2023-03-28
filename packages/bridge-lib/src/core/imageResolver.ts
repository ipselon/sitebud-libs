export type ImageResolverFunc = (imgSrc?: string | null) => Promise<string>;

export let imageResolverInstance: ImageResolverFunc = (imgSrc?: string | null) => {
    return new Promise(resolve => resolve(imgSrc || ''));
};

export function setImageResolver(func: ImageResolverFunc) {
    imageResolverInstance = func;
}
