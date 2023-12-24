/**
 * @typedef {Object} TileProperties
 * @property {number} tileSize
 * @property {number} tileScale
 */

/**
 * @typedef {Object} Sprite
 * @property {string} name
 * @property {HTMLImageElement} image
 * @property {string} src
 * @property {number} tileSize
 * @property {number} tileScale
 * @property {number} originalWidth
 * @property {number} originalHeight
 */

/**
 * @typedef  {[x: number, y: number]} Position
 */

/**
 * @typedef  {[x: number, y: number, xPos: number, yPos: number]} ClickCtx
 */

/**
 * @typedef  {[xPos: number, yPos: number, name: string, x: number, y: number]} SelectedSrc
 */

/**
 * @typedef {Object} TileMap
 * @property {Record<number, SelectedSrc[][]>} tileLayer
 * @property {number} sizeX
 * @property {number} sizeY
 * @property {number} tileSize
 * @property {number} tileScale
 */

/**
 * @typedef {Object} StateCxt
 * @property {Sprite} sprite
 * @property {number} spriteScaled
 * @property {TileMap} map
 * @property {number} mapScaled
 */

/**
 * @typedef {Object} State
 * @property {Position | null} selectedDst
 * @property {SelectedSrc | null} selectedSrc
 * @property {string | null} selectedModalSprite
 * @property {number} selectedSpriteIdx
 * @property {number} currentLayer
 * @property {number} drawMode
 * @property {Sprite[]} sprites
 * @property {TileMap} map
 */
(() => {
    const BTN_EL = {
        uploadSprite: document.getElementById("sprite-upload"),
        loadedSprites: document.getElementById("loaded-sprites"),
        loadSelected: document.getElementById("load-selected-sprite"),
        deleteSelected: document.getElementById("delete-selected-sprite"),
    };
    const INPUT_EL = {
        spriteTileSize: document.getElementById("sprite-tile-size-input"),
        spriteTileScale: document.getElementById("sprite-tile-scale-input"),
        mapTileSize: document.getElementById("map-tile-size-input"),
        mapTileScale: document.getElementById("map-tile-scale-input"),
        mapX: document.getElementById("map-x-input"),
        mapY: document.getElementById("map-y-input"),
        layer: document.getElementById("layer-select"),
        mode: document.getElementById("mode-select"),
    };
    const MODAL_EL = {
        modal: document.getElementById("modal"),
        modalWrapper: document.getElementById("modal-wrapper"),
        modalBackdrop: document.getElementById("modal-backdrop"),
    };
    const SECTION_EL = {
        spriteSheet: document.getElementById("spritesheet-section"),
        tileMap: document.getElementById("tilemap-section"),
    };
    const CONTAINER_EL = {
        sprite: document.getElementById("sprite-container"),
        selectedSprite: document.getElementById("selected-sprite-container"),
    };
    const HOOK_EL = {
        selectedSprite: document.getElementById("selected-sprite-canvas-hook"),
        modalSprite: document.getElementById("modal-sprite-hook"),
    };
    const LS_SAVE_KEY = "__cl-saved-state";
    const LAYER = {
        TILEMAP: 0,
        TERRAIN: 1,
        ENEMY: 2,
        COLLIDABLE: 3,
        PLAYER: 4,
    };
    const LAYERS = Object.values(LAYER);
    const DRAW_MODE = {
        PAINT: 0,
        ERASE: 1,
    };

    /**
     * @type {State}
     */
    const state = {
        selectedDst: null,
        selectedSrc: null,
        selectedModalSprite: null,
        selectedSpriteIdx: -1,
        currentLayer: LAYER.TILEMAP,
        drawMode: DRAW_MODE.PAINT,
        sprites: [],
        map: {},
    };

    /**
     * @param {State} state
     */
    const saveStateToLocalStorage = async () => {
        const stringifiedJson = JSON.stringify(state);
        window.localStorage.setItem(LS_SAVE_KEY, stringifiedJson);
    };

    /**
     * @returns {State | null}
     */
    const getStateFromLocalStorage = () => {
        const item = window.localStorage.getItem(LS_SAVE_KEY);
        try {
            return JSON.parse(item);
        } catch (err) {
            return null;
        }
    };

    /**
     * @param {Sprite} sprite
     */
    const handleSavedSpriteClick = (sprite) => {
        if (sprite.name === state.selectedModalSprite) return;
        if (state.selectedModalSprite) {
            deselectElementHighlight(state.selectedModalSprite);
        }
        state.selectedModalSprite = sprite.name;
        selectElementHighlight(sprite.name);
    };

    const loadModalWithSprites = () => {
        for (const sprite of state.sprites) {
            const el = document.createElement("div");
            el.className = "saved-sprite";
            el.id = sprite.name;
            el.innerHTML = sprite.name;
            el.addEventListener("click", () => handleSavedSpriteClick(sprite));
            HOOK_EL.modalSprite.appendChild(el);
        }
    };

    const toggleModal = () => {
        if (MODAL_EL.modalWrapper.classList.contains("hidden")) {
            MODAL_EL.modalWrapper.classList.remove("hidden");
            MODAL_EL.modalBackdrop.classList.remove("hidden");
            loadModalWithSprites();
        } else {
            MODAL_EL.modalWrapper.classList.add("hidden");
            MODAL_EL.modalBackdrop.classList.add("hidden");
            HOOK_EL.modalSprite.innerHTML = "";
        }
    };

    /**
     * @param {string} id
     */
    const selectElementHighlight = (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.add("selected");
    };

    /**
     * @param {string} id
     */
    const deselectElementHighlight = (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove("selected");
    };

    /**
     * @param {TileProperties} obj
     * @returns {number}
     */
    const toScaled = (obj) => {
        return obj.tileSize * obj.tileScale;
    };

    /**
     * @returns {boolean}
     */
    const isPaintMode = () => {
        return state.drawMode === DRAW_MODE.PAINT;
    };

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} scaledTileSize
     * @return {Position}
     */
    const toCoordsFromIndex = (x, y, scaledTileSize) => {
        return [x * scaledTileSize, y * scaledTileSize];
    };

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} scaledTileSize
     * @return {Position}
     */
    const toIndexFromCoords = (x, y, scaledTileSize) => {
        return [Math.floor(x / scaledTileSize), Math.floor(y / scaledTileSize)];
    };

    /**
     * @param {number} clickX
     * @param {number} clickY
     * @param {HTMLCanvasElement} canvas
     * @param {number} scaledTileSize
     * @return {ClickCtx}
     */
    const getClickCtx = (clickX, clickY, canvas, scaledTileSize) => {
        const { x: xOffset, y: yOffset } = canvas.getBoundingClientRect();
        const [x, y] = toIndexFromCoords(
            Math.round(clickX - xOffset),
            Math.round(clickY - yOffset),
            scaledTileSize
        );
        const coord = toCoordsFromIndex(x, y, scaledTileSize);
        return [x, y, ...coord];
    };

    /**
     * @param {HTMLInputElement} target
     * @param {(name: string, data: string) => void} callback
     */
    const handleFileUpload = (target, callback) => {
        const fileReader = new FileReader();
        fileReader.onload = () => {
            console.log(target.files[0]);
            callback(target.files[0].name, fileReader.result.toString());
        };
        fileReader.readAsDataURL(target.files[0]);
    };

    /**
     * @param {Sprite} [overrides]
     * @returns {Sprite}
     */
    const spriteFactory = (overrides) => ({
        name: "",
        image: new Image(),
        src: "",
        tileSize: 0,
        tileScale: 0,
        originalWidth: 0,
        originalHeight: 0,
        ...overrides,
    });

    /**
     * @param {string} src
     * @param {HTMLImageElement} [image]
     * @param {number} [scale]
     * @returns {Promise<[
     * img: HTMLImageElement,
     * originalWidth: number,
     * originalHeight: number
     * ]>}
     */
    const loadImage = (src, image, scale = 1) => {
        return new Promise((resolve, reject) => {
            const img = image ? image : new Image();
            img.onerror = function () {
                reject("failed to load image " + src);
            };
            img.onload = function () {
                const width = image.width;
                const height = image.height;
                image.width *= scale;
                image.height *= scale;
                resolve([image, width, height]);
            };
            img.src = src;
        });
    };

    /**
     * @param {CanvasRenderingContext2D} canvasCtx
     * @param {SelectedSrc} srcCtx
     * @param {number} x
     * @param {number} y
     */
    const drawImageToTile = (canvasCtx, [xPos, yPos, sName], x, y) => {
        const sprite = state.sprites.find((s) => s.name === sName);
        if (!sprite || !sprite.image) return;
        const scaledSprite = toScaled(sprite);
        const scaledMap = toScaled(state.map);
        canvasCtx.drawImage(
            sprite.image,
            xPos,
            yPos,
            scaledSprite,
            scaledSprite,
            x,
            y,
            scaledMap,
            scaledMap
        );
    };

    /**
     * @param {number} mapX
     * @param {number} mapY
     */
    const setMapTile = (mapX, mapY) => {
        const val = isPaintMode() ? state.selectedSrc : null;
        state.map.tileLayer[state.currentLayer][mapY][mapX] = val;
        drawTileMap();
        saveStateToLocalStorage();
    };

    /**
     * @param {Position} obj
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} scaled
     */
    const drawRectOutline = ([x, y], ctx, scaled, color = "black") => {
        ctx.strokeStyle = color;
        ctx.strokeRect(x, y, scaled, scaled);
    };

    /**
     * @param {Position | null} obj
     * @param {number} xPos
     * @param {number} yPos
     * @returns {boolean}
     */
    const isObjEqualPosition = (obj, xPos, yPos) => {
        return obj && obj[0] === xPos && obj[1] === yPos;
    };

    /**
     * @param {number} clickX
     * @param {number} clickY
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} ctx
     * @param {CanvasRenderingContext2D} selectedCtx
     */
    const handleSpriteSheetClick = (
        clickX,
        clickY,
        canvas,
        ctx,
        selectedCtx
    ) => {
        const selectedSrc = state.selectedSrc;
        const { sprite, spriteScaled } = getStateCxt();
        const [x, y, xPos, yPos] = getClickCtx(
            clickX,
            clickY,
            canvas,
            spriteScaled
        );
        if (isObjEqualPosition(selectedSrc, xPos, yPos)) return;
        if (selectedSrc != null) {
            drawRectOutline(selectedSrc, ctx, spriteScaled);
        }
        selectedCtx.clearRect(0, 0, spriteScaled, spriteScaled);
        selectedCtx.drawImage(
            sprite.image,
            xPos,
            yPos,
            spriteScaled,
            spriteScaled,
            0,
            0,
            spriteScaled,
            spriteScaled
        );
        drawRectOutline([xPos, yPos], ctx, spriteScaled, "red");
        state.selectedSrc = [xPos, yPos, sprite.name, x, y];
    };

    /**
     * @param {number} clickX
     * @param {number} clickY
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} ctx
     */
    const handleTileMapClick = (clickX, clickY, canvas, ctx) => {
        const selectedDst = state.selectedDst;
        const scaledMap = toScaled(state.map);
        const [x, y, xPos, yPos] = getClickCtx(
            clickX,
            clickY,
            canvas,
            scaledMap
        );
        if (isObjEqualPosition(selectedDst, xPos, yPos)) return;
        if (selectedDst != null) {
            drawRectOutline(selectedDst, ctx, scaledMap);
        }
        state.selectedDst = [xPos, yPos];
        if (state.selectedSrc || !isPaintMode()) return setMapTile(x, y);
        drawRectOutline(state.selectedDst, ctx, scaledMap, "red");
        saveStateToLocalStorage();
    };

    const drawTileMap = () => {
        const canvas = createUniqueCanvas("tilemap-canvas");
        const ctx = canvas.getContext("2d");
        const mapScale = toScaled(state.map);
        canvas.width = state.map.sizeX * mapScale;
        canvas.height = state.map.sizeY * mapScale;
        canvas.addEventListener("click", ({ x, y }) =>
            handleTileMapClick(x, y, canvas, ctx)
        );
        SECTION_EL.tileMap.appendChild(canvas);
        for (const layer of LAYERS) {
            const arr = state.map.tileLayer[layer];
            for (let row = 0; row < state.map.sizeY; row++) {
                for (let col = 0; col < state.map.sizeX; col++) {
                    const [x, y] = toCoordsFromIndex(col, row, mapScale);
                    const data = arr[row][col];
                    if (data) drawImageToTile(ctx, data, x, y);
                    const color = isObjEqualPosition(state.selectedDst, x, y)
                        ? "red"
                        : undefined;
                    drawRectOutline([x, y], ctx, mapScale, color);
                }
            }
        }
    };

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} width
     * @param {number} height
     * @param {number} tileSize
     * @param {number} scaledTile
     */
    const drawGrid = (ctx, width, height, tileSize, scaledTile) => {
        const numCols = Math.floor(width / tileSize);
        const numRows = Math.floor(height / tileSize);
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                const [x, y] = toCoordsFromIndex(col, row, scaledTile);
                drawRectOutline([x, y], ctx, scaledTile);
            }
        }
    };

    const drawSpriteSheet = () => {
        if (state.selectedSpriteIdx === -1) return;
        const { sprite, spriteScaled } = getStateCxt();
        const width = sprite.image.width;
        const height = sprite.image.height;
        const [canvas, selectedCanvas] = createSpriteCanvases(
            width,
            height,
            spriteScaled
        );
        const ctx = canvas.getContext("2d");
        const selectedCtx = selectedCanvas.getContext("2d");
        ctx.drawImage(sprite.image, 0, 0, width, height);
        drawGrid(
            ctx,
            sprite.image.width,
            sprite.image.height,
            sprite.tileSize,
            spriteScaled
        );
        canvas.addEventListener("click", ({ x, y }) => {
            handleSpriteSheetClick(x, y, canvas, ctx, selectedCtx);
        });
    };

    /**
     * @template T
     * @param {T[][]} arr
     * @param {number} x
     * @param {number} y
     * @returns {T | undefined}
     */
    const tryGet2DValue = (arr, x, y) => {
        if (Array.isArray(arr) && Array.isArray(arr[y])) {
            return arr[y][x];
        }
        return undefined;
    };

    /**
     * @template T
     * @param {number} rows
     * @param {number} cols
     * @param {T} value
     * @param {T[][]} oldArr
     * @returns {T[][]}
     */
    const initializeMapArray = (rows, cols, value, oldArr = []) => {
        const arr = [];
        for (let i = 0; i < rows; i++) {
            if (!Array.isArray(arr[i])) {
                arr[i] = [];
            }
            for (let j = 0; j < cols; j++) {
                const oldValue = tryGet2DValue(oldArr, j, i);
                arr[i][j] = typeof oldValue == "undefined" ? value : oldValue;
            }
        }
        return arr;
    };

    /**
     * @param {TileMap} map
     * @returns {TileMap}
     */
    const initializeMapLayers = (map) => {
        for (const layer of LAYERS) {
            map.tileLayer[layer] = initializeMapArray(
                map.sizeY,
                map.sizeX,
                null,
                map.tileLayer[layer]
            );
        }
        return map;
    };

    /**
     * @param {string} id
     * @returns {HTMLCanvasElement}
     */
    const createUniqueCanvas = (id) => {
        const existingCanvas = document.getElementById(id);
        if (existingCanvas) {
            existingCanvas.remove();
        }
        const canvas = document.createElement("canvas");
        canvas.id = id;
        return canvas;
    };

    /**
     * @param {number} width
     * @param {number} height
     * @param {number} scaled
     * @returns {[HTMLCanvasElement, HTMLCanvasElement]}
     */
    const createSpriteCanvases = (width, height, scaled) => {
        const canvas = createUniqueCanvas("sprite-canvas");
        const selectedCanvas = createUniqueCanvas("selected-sprite-canvas");
        canvas.width = width;
        canvas.height = height;
        selectedCanvas.width = scaled;
        selectedCanvas.height = scaled;
        HOOK_EL.selectedSprite.appendChild(selectedCanvas);
        CONTAINER_EL.sprite.appendChild(canvas);
        return [canvas, selectedCanvas];
    };

    /**
     * @param {string} name
     * @param {string} src
     * @param {number} [tileSize]
     * @param {number} [tileScale]
     * @returns {Promise<Sprite>}
     */
    const createSprite = (name, src, tileSize, tileScale) => {
        return new Promise((resolve, reject) => {
            const sprite = spriteFactory({ name, src, tileSize, tileScale });
            loadImage(src, sprite.image, tileScale)
                .then(([image, originalWidth, originalHeight]) => {
                    sprite.image = image;
                    sprite.originalWidth = originalWidth;
                    sprite.originalHeight = originalHeight;
                    resolve(sprite);
                })
                .catch((err) => reject(err));
        });
    };

    /**
     * @param {string} name
     * @param {string} src
     * @param {number} tileSize
     * @param {number} tileScale
     * @returns {Promise<void>}
     */
    const initializeSpriteSheet = (name, src, tileSize, tileScale) => {
        return new Promise((resolve) => {
            createSprite(name, src, tileSize, tileScale).then((sprite) => {
                state.sprites.push(sprite);
                resolve();
            });
        });
    };

    /**
     * @param {number} [tileSize]
     * @param {number} [tileScale]
     * @param {number} [sizeX]
     * @param {number} [sizeY]
     * @returns {TileMap}
     */
    const createTileMap = (
        tileSize = 0,
        tileScale = 0,
        sizeX = 0,
        sizeY = 0
    ) => {
        return initializeMapLayers({
            tileLayer: {},
            tileSize,
            tileScale,
            sizeX,
            sizeY,
        });
    };

    /**
     * @returns {StateCxt}
     */
    const getStateCxt = () => {
        const sprite = state.sprites[state.selectedSpriteIdx];
        return {
            sprite,
            spriteScaled: sprite.tileSize * sprite.tileScale,
            map: state.map,
            mapScaled: state.map.tileSize * state.map.tileScale,
        };
    };

    /**
     * @param {HTMLElement} el
     * @returns {number }
     */
    const getSetDefaultN = (el) => {
        const n = Number(el.dataset.default);
        el.value = n;
        return n;
    };

    /**
     * @param {string} name
     * @returns {void}
     */
    const removeSpriteFromMapTiles = (name) => {
        for (const layer of LAYERS) {
            const arr = state.map.tileLayer[layer];
            for (let i = 0; i < arr.length; i++) {
                for (let j = 0; j < arr[i].length; j++) {
                    if (arr[i][j] && arr[i][j][2] === name) {
                        arr[i][j] = null;
                    }
                }
            }
        }
    };

    const exportTileMap = () => {
        const rows = state.map.sizeY;
        const cols = state.map.sizeX;
        const idMap = state.sprites.reduce((acc, cur, i) => {
            acc[cur.name] = i;
            return acc;
        }, {});
        for (let layer of LAYERS) {
            let tileMap = "";
            const arr = state.map.tileLayer[layer];
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const entry = arr[row][col];
                    if (!entry) {
                        tileMap += "&";
                    } else {
                        const [, , name, x, y] = entry;
                        tileMap += `${y},${x}(${idMap[name]})`;
                    }
                    if (col < cols - 1) {
                        tileMap += "|";
                    }
                }
                tileMap += "\n";
            }
            //console.log(layer, tileMap);
        }
    };

    /**
     * @param {State} savedState
     * @returns {void}
     */
    const initializeFromSavedState = (savedState) => {
        state.selectedModalSprite = null;
        state.selectedDst = null;
        state.selectedSrc = null;
        state.drawMode = getSetDefaultN(INPUT_EL.mode);
        state.currentLayer = getSetDefaultN(INPUT_EL.layer);
        state.map = savedState.map;
        state.sprites = [];
        const promises = [];
        for (const sprite of savedState.sprites) {
            promises.push(
                initializeSpriteSheet(
                    sprite.name,
                    sprite.src,
                    sprite.tileSize,
                    sprite.tileScale
                )
            );
        }
        Promise.all(promises).then(() => {
            INPUT_EL.mapX.value = state.map.sizeX;
            INPUT_EL.mapY.value = state.map.sizeY;
            INPUT_EL.mapTileSize.value = state.map.tileSize;
            INPUT_EL.mapTileScale.value = state.map.tileScale;
            if (state.sprites.length) {
                state.selectedSpriteIdx = 0;
                const s = state.sprites[0];
                INPUT_EL.spriteTileSize.value = s.tileSize;
                INPUT_EL.spriteTileScale.value = s.tileScale;
                drawSpriteSheet();
            }
            drawTileMap();
            exportTileMap();
        });
    };

    const initialize = () => {
        if (state.sprites.length) return;
        const savedState = getStateFromLocalStorage();
        if (savedState) return initializeFromSavedState(savedState);
        state.map = createTileMap(
            getSetDefaultN(INPUT_EL.mapTileSize),
            getSetDefaultN(INPUT_EL.mapTileScale),
            getSetDefaultN(INPUT_EL.mapX),
            getSetDefaultN(INPUT_EL.mapY)
        );
        state.currentLayer = getSetDefaultN(INPUT_EL.layer);
        state.drawMode = getSetDefaultN(INPUT_EL.mode);
        getSetDefaultN(INPUT_EL.spriteTileSize);
        getSetDefaultN(INPUT_EL.spriteTileScale);
        drawTileMap();
    };

    const handleSpriteConfigChange = (key, value) => {
        if (state.selectedSpriteIdx === -1) return;
        const { sprite } = getStateCxt();
        sprite[key] = value;
        if (key === "tileScale") {
            sprite.image.width = sprite.originalWidth * sprite.tileScale;
            sprite.image.height = sprite.originalHeight * sprite.tileScale;
        }
        state.selectedSrc = null;
        saveStateToLocalStorage();
        drawSpriteSheet();
        drawTileMap();
    };

    /**
     * @param {Record<'target', HTMLElement>} event
     * @param {void}
     */
    const handleConfigChangeEvent = ({ target }) => {
        const value = Number(target.value);
        const { key1, key2 } = target.dataset;
        if (key1 === "sprite") {
            return handleSpriteConfigChange(key2, value);
        }
        if (key1 === "map" && key2) {
            state.map[key2] = value;
            if (/size.+/.test(key2)) {
                // resize map layer arrays
                // if map size has changed
                initializeMapLayers(state.map);
            } else {
                state.selectedDst = null;
            }
            saveStateToLocalStorage();
            // then redraw map
            drawTileMap();
        } else if (target.dataset.key1 && !target.dataset.key2) {
            state[target.dataset.key1] = value;
            saveStateToLocalStorage();
        }
    };

    /**
     * @param {Event} e
     * @returns {Promise<void>}
     */
    const handleUploadSpriteEvent = (e) => {
        handleFileUpload(e.target, (name, result) => {
            const existingIdx = state.sprites.findIndex((s) => s.name === name);
            if (existingIdx > -1) {
                state.selectedSpriteIdx = existingIdx;
                drawSpriteSheet();
            } else {
                initializeSpriteSheet(
                    name,
                    result,
                    Number(INPUT_EL.spriteTileSize.value),
                    Number(INPUT_EL.spriteTileScale.value)
                ).then(() => {
                    state.selectedSpriteIdx = state.sprites.length - 1;
                    drawSpriteSheet();
                    saveStateToLocalStorage();
                });
            }
        });
    };

    const handleLoadSelectedSpriteEvent = () => {
        if (state.selectedModalSprite === null) return;
        const spriteIdx = state.sprites.findIndex(
            (e) => e.name === state.selectedModalSprite
        );
        if (spriteIdx === -1) return;
        const sprite = state.sprites[spriteIdx];
        state.selectedSpriteIdx = spriteIdx;
        state.selectedModalSprite = null;
        INPUT_EL.spriteTileSize.value = sprite.tileSize;
        toggleModal();
        drawSpriteSheet();
    };

    const handleDeleteSelectedSpriteEvent = () => {
        if (state.selectedModalSprite === null) return;
        const targetIndex = state.sprites.findIndex(
            (e) => e.name === state.selectedModalSprite
        );
        if (targetIndex === state.selectedSpriteIdx) {
            state.selectedSpriteIdx = -1;
            document.getElementById("sprite-canvas")?.remove();
            document.getElementById("selected-sprite-canvas")?.remove();
        }
        state.sprites.splice(targetIndex, 1);
        document.getElementById(state.selectedModalSprite)?.remove();
        removeSpriteFromMapTiles(state.selectedModalSprite);
        state.selectedModalSprite = null;
        drawSpriteSheet();
        drawTileMap();
        saveStateToLocalStorage();
    };

    INPUT_EL.mapTileSize.addEventListener("change", handleConfigChangeEvent);
    INPUT_EL.mapX.addEventListener("change", handleConfigChangeEvent);
    INPUT_EL.mapY.addEventListener("change", handleConfigChangeEvent);
    INPUT_EL.layer.addEventListener("change", handleConfigChangeEvent);
    INPUT_EL.mode.addEventListener("change", handleConfigChangeEvent);
    INPUT_EL.spriteTileSize.addEventListener("change", handleConfigChangeEvent);
    BTN_EL.uploadSprite.addEventListener("input", handleUploadSpriteEvent);
    BTN_EL.loadSelected.addEventListener(
        "click",
        handleLoadSelectedSpriteEvent
    );
    BTN_EL.deleteSelected.addEventListener(
        "click",
        handleDeleteSelectedSpriteEvent
    );
    BTN_EL.loadedSprites.addEventListener("click", () => {
        toggleModal();
    });
    MODAL_EL.modalBackdrop.addEventListener("click", () => {
        state.selectedModalSprite = null;
        toggleModal();
    });

    initialize();
})();
