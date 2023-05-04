export interface PreviewConfig {
    repo: string;
    owner: string;
    ghToken: string;
    workingBranch: string;
}

function sendMessageToOpener(message: any): void {
    if (window.opener) {
        window.opener.postMessage(message, '*');
    } else {
        throw Error('Missing the parent window');
    }
}

export class PreviewBus {
    private _timeoutId: ReturnType<typeof setTimeout> | undefined;
    private _previewConfig: PreviewConfig | undefined;
    private _changesData: any;
    private _handleChange: (() => void) | undefined;
    private _handleMessage: (event: any) => void;

    constructor() {
        this._handleChange = undefined;
        this._handleMessage = this.handleMessageFromOpener.bind(this);
        window.addEventListener("message", this._handleMessage, false);
    }

    destroy() {
        window.removeEventListener("message", this._handleMessage, false);
        this._previewConfig = undefined;
        this._changesData = undefined;
        this._handleChange = undefined;
        if (this._timeoutId) {
            clearTimeout(this._timeoutId);
            this._timeoutId = undefined;
        }
    }

    handleMessageFromOpener(event: any): void {
        const {data, origin} = event;
        if (data.type === 'PREVIEW_CONFIG_RESPONSE') {
            this.clearTimeout();
            this._previewConfig = data.config;
            this._changesData = data.changesData;
            if (this._handleChange) {
                this._handleChange();
            }
        } else if (data.type === 'PREVIEW_CONFIG_CHANGE') {
            this._previewConfig = data.config;
            this._changesData = data.changesData;
            if (this._handleChange) {
                this._handleChange();
            }
        } else if (data.type === 'PREVIEW_CLEAR_CACHE') {
            this._previewConfig = data.config;
            if (this._handleChange) {
                this._handleChange();
            }
        }
    }

    get previewConfig(): PreviewConfig | undefined {
        return this._previewConfig;
    }

    get changesData(): any {
        return this._changesData;
    }

    onChange(callback: () => void) {
        this._handleChange = callback;
    }

    clearTimeout(): void {
        if (this._timeoutId) {
            clearTimeout(this._timeoutId);
            this._timeoutId = undefined;
        }
    }

    initPreviewConfig(callback: (error?: string) => void): void {
        try {
            const self = this;
            this._timeoutId = setTimeout(() => {
                self._previewConfig = undefined;
                self._changesData = {};
                this._timeoutId = undefined;
                callback('Can not connect to the opener');
            }, 3000);
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
