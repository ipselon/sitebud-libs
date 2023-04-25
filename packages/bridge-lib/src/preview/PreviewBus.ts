export interface PreviewConfig {
    repo: string;
    owner: string;
    ghToken: string;
    workingBranch: string;
}

function sendMessageToOpener(message: any): void {
    // console.log('sendMessageToOpener: ', window.parent);
    if (window.parent) {
        window.parent.postMessage(message, '*');
    } else {
        throw Error('Missing the parent window');
    }
}

const handleMessageFromOpener = (bus: PreviewBus) => (event: any): void => {
    const {data, origin} = event;
    console.log('Received message from ', origin, data);
    if (data.type === 'PREVIEW_CONFIG_RESPONSE') {
        if (bus.previewConfigResponseCallback) {
            const newConfig: PreviewConfig = data.config;
            const changesData: any = data.changesData;
            bus.previewConfigResponseCallback(newConfig, changesData);
        }
    } else if (data.type === 'PREVIEW_CONFIG_CHANGE') {
        if (bus.previewConfigChangeCallback) {
            const newConfig: PreviewConfig = data.config;
            const changesData: any = data.changesData;
            bus.previewConfigChangeCallback(newConfig, changesData);
        }
    }
}

export class PreviewBus {
    private _timeoutId: ReturnType<typeof setTimeout> | undefined;
    private _previewConfig: PreviewConfig | undefined;
    private _changesData: any;
    private _previewConfigResponseCallback: ((previewConfig: PreviewConfig | undefined, changesData: any, error?: string) => void) | undefined;
    private _previewConfigChangeCallback: ((previewConfig: PreviewConfig | undefined, changesData: any, error?: string) => void) | undefined;

    constructor() {
        window.addEventListener("message", handleMessageFromOpener(this), false);
    }

    destroy() {
        window.removeEventListener("message", handleMessageFromOpener(this), false);
        this._previewConfig = undefined;
        this._changesData = undefined;
        this._previewConfigResponseCallback = undefined;
        this._previewConfigChangeCallback = undefined;
        if (this._timeoutId) {
            clearTimeout(this._timeoutId);
            this._timeoutId = undefined;
        }
    }

    get previewConfig(): PreviewConfig | undefined {
        return this._previewConfig;
    }

    get changesData(): any {
        return this._changesData;
    }

    get previewConfigResponseCallback(): ((previewConfig: (PreviewConfig | undefined), changesData: any, error?: string) => void) | undefined {
        return this._previewConfigResponseCallback;
    }

    get timeoutId(): ReturnType<typeof setTimeout> | undefined {
        return this._timeoutId;
    }

    get previewConfigChangeCallback(): ((previewConfig: (PreviewConfig | undefined), changesData: any, error?: string) => void) | undefined {
        return this._previewConfigChangeCallback;
    }

    onPreviewConfigChange(callback: (error?: string) => void): void {
        const self = this;
        this._previewConfigChangeCallback = (previewConfig, changesData) => {
            self._previewConfig = previewConfig;
            self._changesData = changesData;
            callback();
        };
    }

    initPreviewConfig(callback: (error?: string) => void): void {
        try {
            const self = this;
            this._timeoutId = setTimeout(() => {
                self._previewConfigResponseCallback = undefined;
                self._previewConfig = undefined;
                self._changesData = {};
                this._timeoutId = undefined;
                callback('Can not connect to the opener');
            }, 3000);
            // console.log('[Context] setTimeout: ', this._timeoutId);
            this._previewConfigResponseCallback = (previewConfig, changesData, error) => {
                // console.log('[Context] try to clear timeout ID: ', self._timeoutId);
                if (self._timeoutId) {
                    // console.log('[Context] clear timeout ID: ', self._timeoutId);
                    clearTimeout(self._timeoutId);
                    this._timeoutId = undefined;
                }
                self._previewConfigResponseCallback = undefined;
                self._previewConfig = previewConfig;
                self._changesData = changesData;
                callback();
            };
            // console.log('[Context] this, previewConfigResponseCallback: ', this, this._previewConfigResponseCallback);
            sendMessageToOpener({type: 'PREVIEW_CONFIG_REQUEST'});
        } catch (e: any) {
            if (this._timeoutId) {
                clearTimeout(this._timeoutId);
                this._timeoutId = undefined;
            }
            this._previewConfig = undefined;
            this._changesData = {};
            callback(e.message);
        }
    }
}

let instance: PreviewBus | undefined = undefined;

export function getPreviewBusInstance() {
    if (!instance) {
        instance = new PreviewBus();
    }
    return instance;
}
