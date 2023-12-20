(() => {
    const LS_SAVE_KEY = "__cl-saved-state";
    const ELEMENT = {
        button: {
            uploadSprite: document.getElementById('sprite-upload'),
            loadedSprites: document.getElementById('loaded-sprites'),
            loadSelected: document.getElementById('load-selected-sprite'),
            deleteSelected: document.getElementById('delete-selected-sprite'),
        },
        input: {
            tileSize: document.getElementById('tile-size-input'),
            tileScale: document.getElementById('tile-scale-input'),
            mapX: document.getElementById('map-x-input'),
            mapY: document.getElementById('map-y-input'),
            layer: document.getElementById('layer-select')
        },
        modal: document.getElementById('modal'),
        modalWrapper: document.getElementById('modal-wrapper'),
        modalBackdrop: document.getElementById('modal-backdrop'),
        section: {
            spriteSheet: document.getElementById('spritesheet-section'),
            tileMap: document.getElementById('tilemap-section')
        },
        container: {
            sprite: document.getElementById('sprite-container'),
            selectedSprite: document.getElementById('selected-sprite-container'),
        },
        hook: {
            selectedSprite: document.getElementById("selected-sprite-canvas-hook"),
            modalSprite: document.getElementById("modal-sprite-hook"),
        }
    };

    const LAYER = {
        TILEMAP: 0,
        TERRAIN: 1,
        ENEMY: 2,
        COLLIDABLE: 3,
        PLAYER: 4,
    };

    const saveStateToLocalStorage = (state) => {
        const stringifiedJson = JSON.stringify(state);
        window.localStorage.setItem(LS_SAVE_KEY, stringifiedJson);
    };

    const getStateFromLocalStorage = () => {
        const item = window.localStorage.getItem(LS_SAVE_KEY);
        try {
            return JSON.parse(item);
        } catch(err) {
            return null;
        }
    }

    const handleFileUpload = (target, callback) => {
        const fileReader = new FileReader();

        fileReader.onload = () => {
            callback(target.files[0].name, fileReader.result.toString());
        };

        fileReader.readAsDataURL(target.files[0]);
    };

    const safe2DArrayPush = (arr, x, y, val) => {
        if (!Array.isArray(arr[y])) {
            arr[y] = [];
        }
        arr[y][x] = val;
    };

    const toCoordsFromIndex = (x, y, scaledTileSize) => {
        return {
            x: x * scaledTileSize,
            y: y * scaledTileSize,
        }
    };

    const toIndexFromCoords = (x, y, scaledTileSize) => {
        return {
            x: Math.floor(x / scaledTileSize),
            y: Math.floor(y / scaledTileSize)
        }
    };

    const initSpriteSheetTiles = (ctx, width, height, sprite) => {
        const numCols = Math.floor(width / sprite.tileSize);
        const numRows = Math.floor(height / sprite.tileSize);
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                const {x, y} = toCoordsFromIndex(col, row, sprite.scaledTileSize);
                safe2DArrayPush(sprite.tiles, col, row, ctx.getImageData(
                    x,
                    y,
                    sprite.scaledTileSize,
                    sprite.scaledTileSize,
                ));
                ctx.strokeStyle = "black";
                ctx.strokeRect(
                    x,
                    y,
                    sprite.scaledTileSize,
                    sprite.scaledTileSize
                );
            }
        }
    };

    const drawFromMapTileArray = (numRows, numCols, ctx, scaledTileSize, cb) => {
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                const {x, y} = toCoordsFromIndex(col, row, scaledTileSize);
                cb(col, row, x, y);
                ctx.strokeStyle = "black";
                ctx.strokeRect(
                    x, y,
                    scaledTileSize,
                    scaledTileSize
                );
            }
        }
    };

    const drawMapTiles = (map, sprite) => {
        const canvas = createUniqueCanvas('tilemap-canvas');
        const ctx = canvas.getContext('2d');
        const layers = Object.values(LAYER);
        canvas.width = map.sizeX * sprite.scaledTileSize;
        canvas.height = map.sizeY * sprite.scaledTileSize;
        ELEMENT.section.tileMap.appendChild(canvas);
        for (const layer of layers) {
            const arr = map.tileLayer[layer] || [];
            if (arr.length > 0) {
                drawFromMapTileArray(
                    arr.length, arr[0].length,ctx, sprite.scaledTileSize,
                    (col, row, x, y) => {
                        const item = arr[row][col];
                        console.log("draw tile", item);
                    }
                );
            } else {
                drawFromMapTileArray(map.sizeY, map.sizeX, ctx, sprite.scaledTileSize,
                    (col, row) => {
                        safe2DArrayPush(arr, col, row, null);
                    }
                );
            }
        }
    };

    const createUniqueCanvas = (id) => {
        const exisitingCanvas = document.getElementById(id);
        if (exisitingCanvas) {
            exisitingCanvas.remove();
        }
        const canvas = document.createElement('canvas');
        canvas.id = id;
        return canvas;
    };

    const createSelectedSpriteCanvas = (scaledTileSize) => {
        const selectedCanvas = createUniqueCanvas("selected-sprite-canvas");
        selectedCanvas.width = scaledTileSize;
        selectedCanvas.height = scaledTileSize;
        ELEMENT.hook.selectedSprite.appendChild(selectedCanvas);
        return selectedCanvas;
    };

    const createSpriteCanvas = (image, tileScale) => {
        const canvas = createUniqueCanvas("sprite-canvas");
        image.width *= tileScale;
        image.height *= tileScale;
        canvas.width = image.width;
        canvas.height = image.height;
        ELEMENT.container.sprite.appendChild(canvas);
        return canvas;
    };

    const loadModalWithSprites = (sprites, onClick) => {
        for (const sprite of  sprites) {
            const el = document.createElement('div');
            el.className = 'saved-sprite';
            el.id = sprite.name;
            el.innerHTML = sprite.name;
            el.addEventListener('click', () => onClick(sprite));
            ELEMENT.hook.modalSprite.appendChild(el);
        }
    }

    const toggleModal = (sprites, onClick) => {
        if (ELEMENT.modalWrapper.classList.contains('hidden')) {
            ELEMENT.modalWrapper.classList.remove('hidden');
            ELEMENT.modalBackdrop.classList.remove('hidden');
            loadModalWithSprites(sprites, onClick);
        } else {
            ELEMENT.modalWrapper.classList.add('hidden');
            ELEMENT.modalBackdrop.classList.add('hidden');
            ELEMENT.hook.modalSprite.innerHTML = '';
        }
    }

    const selectElementHighlight = (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.add('selected');
    }

    const deselectElementHighlight = (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('selected');
    }

    window.clUtils = {
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
    }
})();
