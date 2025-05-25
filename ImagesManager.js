export default class ImagesManager {
    /**
     * @type {Map<string, HTMLImageElement>}
     * @description A map that stores images, where the key is the asset name and the value is the corresponding HTMLImageElement.
     */
    _assets;

    /**
     * @type {Map<string, string>}
     * @description A map that stores the source URLs of assets, where the key is the asset name and the value is the source URL.
     */
    _srcs;

    /**
     * @private
     * @description The constructor is private to enforce the singleton pattern. Use `getInstance()` to obtain the instance.
     */
    constructor() {
        this._assets = new Map();
        this._srcs = new Map();
    }

    /**
     * Registers an asset name with a source URL to be loaded later.
     * 
     * @param {string} name The name of the asset.
     * @param {string} src The source URL of the asset image.
     */
    add(name, src) {
        this._srcs.set(name, src);
    }

    /**
     * Loads all assets that have been registered. Each registered asset will be fetched from its URL.
     * 
     * @returns {Promise<void>} A promise that resolves once all assets are successfully loaded.
     */
    async load() {
        /**
         * @type {Promise<[string, HTMLImageElement][]>}
         * @description An array of promises that resolve to an array containing the asset name and its corresponding image.
         */
        const loadPromises = [];

        for (const [name, src] of this._srcs.entries()) {
            const image = new Image();
    
            const loadPromise = new Promise((resolve, reject) => {
                image.addEventListener("load", () => {
                    resolve([name, image]);
                });

                image.addEventListener("error", (e) => {
                    reject(new LoadAssetError(name, src, e.error));
                });
            });

            image.src = src;
            loadPromises.push(loadPromise);
        }

        try {
            const loadedAssets = await Promise.all(loadPromises);
            this._assets = new Map(loadedAssets);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Retrieves the image associated with a given asset name.
     * 
     * @param {string} name The name of the asset to retrieve.
     * @returns {HTMLImageElement} The image corresponding to the asset name.
     * @throws {AssetNotLoadedError} Throws an error if the asset has not been loaded.
     */
    get(name) {
        const image = this._assets.get(name);

        if (!image) throw new AssetNotLoadedError(name);

        return image;
    }
}

/**
 * Custom error thrown when an asset is requested but has not been loaded.
 */
class AssetNotLoadedError extends Error {
    /**
     * @param {string} assetName The name of the asset that was not loaded.
     */
    constructor(assetName) {
        super(`Asset: ${assetName} not loaded`);
    }
}

/**
 * Custom error thrown when there is a failure to load an asset.
 */
class LoadAssetError extends Error {
    /**
     * @param {string} name The name of the asset that failed to load.
     * @param {string} src The source URL of the asset.
     * @param {string} inner The inner error message.
     */
    constructor(name, src, inner) {
        super(`Failed to load asset: ${name} at: ${src} bc: ${inner}`);
    }
}
