export let fsExtra: any;
export let path: any;

interface ExternalModules {
    fsExtra: any;
    path: any;
}

export function initExternalModules(modules: ExternalModules) {
    fsExtra = modules.fsExtra;
    path = modules.path;
}
