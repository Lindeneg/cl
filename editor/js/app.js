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
        saveSpritesToLocalStorage,
        getSpritesFromLocalStorage,
        toggleModal,
        selectElementHighlight,
        deselectElementHighlight,

    } = window.clUtils;

    const state = {
        selectedPos: null,
        selectedModalSprite: null,
        spriteIdx: 0,
        currentLayer: LAYER.TILEMAP,
        sprites: [],
        tile: {
            size: 32,
            scale: 1,
        },
        map: {
            tileLayer: {
                [LAYER.TILEMAP]: [],
            },
            sizeX: 10,
            sizeY: 10,
        },
    };

    const initialize = () => {
        // if we have data, stop
        if (state.sprites.length) return;
        // get/set data
        state.sprites = getSpritesFromLocalStorage() ?? [];
        // if we did not get any data, stop
        if (!state.sprites.length) return;
        // if we did get data, default to first entry
        initializeSpriteSheet(state.sprites[0].name, state.sprites[0].imageData);
    };

    const currentSprite = () => {
        const sprite = state.sprites[state.spriteIdx];
        if (!sprite) return null;
        return {
            ...sprite,
            tileSize: state.tile.size,
            scaledTileSize: state.tile.size * state.tile.scale,
        };
    }

    const handleSpriteTileClick = (clickX, clickY, canvas, ctx, selectedCtx) => {
        const sprite = currentSprite();
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
    };

    const handleSavedSpriteClick = (sprite) => {
        if (sprite.name === state.selectedModalSprite) return;
        if (state.selectedModalSprite) {
            deselectElementHighlight(state.selectedModalSprite);
        }
        state.selectedModalSprite = sprite.name;
        selectElementHighlight(sprite.name);
    };

    const initializeSpriteSheet = (name, src) => {
        const image = new Image();

        image.onload = function() {
            const alreadyLoadedSpriteIdx = state.sprites.findIndex(e => e.name === name);
            if (alreadyLoadedSpriteIdx > -1) {
                state.spriteIdx = alreadyLoadedSpriteIdx;
                setupSpriteCanvases(image, false);
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
    };

    const setupSpriteCanvases = (image, saveToLS = false) => {
        const sprite = currentSprite();
        const canvas = createSpriteCanvas(image, state.tile.scale);
        const ctx = canvas.getContext('2d');
        const selectedCanvas = createSelectedSpriteCanvas(sprite.scaledTileSize);
        const selectedCtx = selectedCanvas.getContext('2d');

        ctx.drawImage(image, 0, 0, image.width, image.height);

        initSpriteSheetTiles(ctx, image.width, image.height, sprite);
        drawMapTiles(state.map, sprite);

        if (saveToLS) {
            saveSpritesToLocalStorage(state.sprites);
        }

        canvas.addEventListener('click', ({x, y}) => {
            handleSpriteTileClick(x, y, canvas, ctx, selectedCtx);
        });
    };

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
        const sprite = state.sprites.find(e => e.name === state.selectedModalSprite);
        initializeSpriteSheet(
            sprite.name,
            sprite.imageData
        );
        state.selectedModalSprite = null;
        toggleModal();
    });

    ELEMENT.button.deleteSelected.addEventListener('click', (e) => {
        console.log('DELETE', e);
    });

    initialize();
})();
