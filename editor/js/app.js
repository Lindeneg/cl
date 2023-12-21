(() => {
    const {
        ELEMENT,
        LAYER,
        handleFileUpload,
        initSpriteSheetTiles,
        drawMapTiles,
        toIndexFromCoords,
        toCoordsFromIndex,
        createSpriteCanvas,
        createSelectedSpriteCanvas,
        saveStateToLocalStorage,
        getStateFromLocalStorage,
        toggleModal,
        selectElementHighlight,
        deselectElementHighlight,
        initializeArray,
        initializeMapLayers
    } = window.clUtils;

    const state = {
        selectedPos: null,
        selectedModalSprite: null,
        spriteIdx: -1,
        currentLayer: LAYER.TILEMAP,
        sprites: [],
        tile: { size: 0, scale: 0 },
        map: { tileLayer: {}, sizeX: 0, sizeY: 0 },
    };

    const currentSprite = () => {
        if (state.spriteIdx === -1) return null;
        const sprite = state.sprites[state.spriteIdx];
        if (!sprite) return null;
        return {
            ...sprite,
            tileSize: state.tile.size,
            scaledTileSize: state.tile.size * state.tile.scale,
        };
    }

    const initialize = () => {
        if (state.sprites.length) return;
        const savedState = getStateFromLocalStorage();
        state.sprites = savedState?.sprites ?? [];
        state.tile = savedState?.tile ?? state.tile;
        initializeConfig(savedState);
        state.map = savedState?.map ?? initializeMapLayers(state.map);
        drawMapTiles(state.map, state.tile.size * state.tile.scale);
        if (!state.sprites.length) return;
        initializeSpriteSheet(state.sprites[0].name, state.sprites[0].imageData);
        state.spriteIdx = 0;
    }

    const initializeConfig = (savedState) => {
        state.tile.size = setConfigValue(savedState?.tile.size, ELEMENT.input.tileSize);
        state.tile.scale = setConfigValue(savedState?.tile.scale, ELEMENT.input.tileScale);
        state.map.sizeX = setConfigValue(savedState?.map?.sizeX, ELEMENT.input.mapX);
        state.map.sizeY = setConfigValue(savedState?.map?.sizeY, ELEMENT.input.mapY);
        state.currentLayer = setConfigValue(savedState?.currentLayer, ELEMENT.input.layer);
    }

    const setConfigValue = (val, el) => {
        const result = typeof val === 'undefined' ?
            Number(el.dataset.default) : val;
        el.value = result;
        return result;
    }


    const handleSpriteTileClick = (clickX, clickY, canvas, ctx, selectedCtx) => {
        const sprite = currentSprite();
        if (!sprite) return;
        const selectedPos = state.selectedPos;
        const {x: xOffset, y: yOffset} = canvas.getBoundingClientRect();
        const {x, y} = toIndexFromCoords(
            Math.round(clickX - xOffset),
            Math.round(clickY - yOffset),
            sprite.scaledTileSize,
        );
        const coord = toCoordsFromIndex(x, y, sprite.scaledTileSize);
        if (selectedPos && selectedPos.x === coord.x && selectedPos.y === coord.y) return;
        if (selectedPos != null) {
            ctx.strokeStyle = "black";
            ctx.strokeRect(
                state.selectedPos.x, state.selectedPos.y,
                sprite.scaledTileSize, sprite.scaledTileSize
            );
        }
        selectedCtx.putImageData(sprite.tiles[y][x], 0, 0);
        ctx.strokeStyle = "red";
        ctx.strokeRect(coord.x, coord.y, sprite.scaledTileSize, sprite.scaledTileSize);
        state.selectedPos = {
            x: coord.x,
            y: coord.y,
        }
    }

    const handleSavedSpriteClick = (sprite) => {
        if (sprite.name === state.selectedModalSprite) return;
        if (state.selectedModalSprite) {
            deselectElementHighlight(state.selectedModalSprite);
        }
        state.selectedModalSprite = sprite.name;
        selectElementHighlight(sprite.name);
    }

    const initializeSpriteSheet = (name, src, forceSave = false) => {
        const image = new Image();
        image.onload = function() {
            const alreadyLoadedSpriteIdx = state.sprites.findIndex(e => e.name === name);
            if (alreadyLoadedSpriteIdx > -1) {
                state.spriteIdx = alreadyLoadedSpriteIdx;
                setupSpriteCanvases(image, forceSave);
            } else {
                state.sprites.push({
                    name,
                    imageData: src,
                    width: image.width,
                    height: image.height,
                    tiles: []
                });
                state.spriteIdx = state.sprites.length - 1;
                setupSpriteCanvases(image, true);
            }
        };
        image.src = src;
    }

    const setupSpriteCanvases = (image, saveToLS = false) => {
        const sprite = currentSprite();
        if (!sprite) return;
        const canvas = createSpriteCanvas(image, state.tile.scale);
        const ctx = canvas.getContext('2d');
        const selectedCanvas = createSelectedSpriteCanvas(sprite.scaledTileSize);
        const selectedCtx = selectedCanvas.getContext('2d');
        ctx.drawImage(image, 0, 0, image.width, image.height);
        initSpriteSheetTiles(ctx, image.width, image.height, sprite);
        if (saveToLS) {
            saveStateToLocalStorage(state);
        }
        canvas.addEventListener('click', ({x, y}) => {
            handleSpriteTileClick(x, y, canvas, ctx, selectedCtx);
        });
    }

    const handleTileConfigInput = ({ target }) => {
        const val = Number(target.value);
        if (!val || (target.dataset.key2 === 'size' && val % 8 != 0)) return;
        state[target.dataset.key1][target.dataset.key2] = val;
        const sprite = currentSprite();
        if (sprite) {
            initializeSpriteSheet(sprite.name, sprite.imageData, true);
        }
        if (target.dataset.key1 === 'map') {
            state.map = initializeMapLayers(state.map);
        }
        drawMapTiles(state.map, state.tile.size * state.tile.scale);
        saveStateToLocalStorage(state);
    }

    ELEMENT.input.mapX.addEventListener('change', handleTileConfigInput);
    ELEMENT.input.mapY.addEventListener('change', handleTileConfigInput);
    ELEMENT.input.tileSize.addEventListener('change', handleTileConfigInput);
    ELEMENT.input.tileScale.addEventListener('change', handleTileConfigInput);
    ELEMENT.input.layer.addEventListener('change', ({ target }) => {
        state.currentLayer = Number(target.value);
    });
    ELEMENT.button.loadedSprites.addEventListener('click', () => {
        toggleModal(state.sprites, handleSavedSpriteClick);
    });
    ELEMENT.modalBackdrop.addEventListener('click', () => {
        state.selectedModalSprite = null;
        toggleModal();
    });
    ELEMENT.button.uploadSprite.addEventListener('input', (e) => {
        handleFileUpload(e.target, (name, result) => {
            initializeSpriteSheet(name, result);
        });
    });
    ELEMENT.button.loadSelected.addEventListener('click', () => {
        if (state.selectedModalSprite === null) return;
        const sprite = state.sprites.find(e => e.name === state.selectedModalSprite);
        initializeSpriteSheet(
            sprite.name,
            sprite.imageData
        );
        state.selectedModalSprite = null;
        toggleModal();
    });
    ELEMENT.button.deleteSelected.addEventListener('click', () => {
        if (state.selectedModalSprite === null) return;
        const targetIndex = state.sprites.findIndex(e => e.name === state.selectedModalSprite);
        if (targetIndex === state.spriteIdx) {
            state.spriteIdx = -1;
            document.getElementById('sprite-canvas')?.remove();
            document.getElementById('selected-sprite-canvas')?.remove();
        }
        state.sprites.splice(targetIndex, 1);
        document.getElementById(state.selectedModalSprite)?.remove();
        state.selectedModalSprite = null;
        saveStateToLocalStorage(state);
    });

    initialize();
})();
