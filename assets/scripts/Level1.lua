----------------------------------------------------
-- WIP
----------------------------------------------------

Level1 = {
    assets = {
        -- [0] = { type="texture", id = "terrain-texture-day", file = "{FILE_PATH}" },
    },

    map = {
        --file = "{FILE_PATH}",
        --scale = 0,
        --tileSize = 0,
        --mapSizeX = 0,
        --mapSizeY = 0
    },

    entities = {
        [0] = {
            name = "player",
            layer = 4,
            components = {
                transform = {
                    position = {
                        x = 240,
                        y = 106
                    },
                    velocity = {
                        x = 0,
                        y = 0
                    },
                    width = 32,
                    height = 32,
                    scale = 1,
                    rotation = 0
                },
                sprite = {
                    --textureAssetId = "texture",
                    --animated = true,
                    --frameCount = 2,
                    --animationSpeed = 90,
                    --hasDirections = true,
                    --fixed = false
                },
                collider = {
                    tag = "PLAYER"
                },
                input = {
                    keyboard = {
                        up = "w",
                        left = "a",
                        down = "s",
                        right = "d",
                        shoot = "space"
                    }
                }
            }
        },
        [1] = {
            name = "start",
            layer = 3,
            components = {
                transform = {
                    position = {
                        x = 240,
                        y = 115
                    },
                    velocity = {
                        x = 0,
                        y = 0
                    },
                    width = 32,
                    height = 32,
                    scale = 1,
                    rotation = 0
                },
                sprite = {
                    textureAssetId = "start-texture",
                    animated = false
                }
            }
        }
        -- and so on
    }
}
