#pragma once

#include <fstream>
#include <string>

#include "../Utilities/Constants.h"

namespace CL::Core {
struct TileMapLoader {
   private:
    enum TileMapSymbol {
        COORD_DELIMITER = ',',
        TILE_DELIMITER = '|',
        EMPTY_TILE = '&',
        LAYER_START = '(',
        LAYER_END = ')'
    };

    // TODO
    std::string mTextureId;       // NO TEXTURE (comes from specific tile)
    int mTileSize;                // comes from layer config
    int mTileScale;               // comes from map config
    int mScaledTile;              // size * scale
    Constants::LayerType mLayer;  // comes from map config

    bool appendCoordToString(std::fstream& stream, std::string* s);
    bool setTileCoords(std::fstream& stream, int* x, int* y, int* l);
    void AddTile(int srcX, int srcY, int x, int y);

   public:
    TileMapLoader(std::string textureId, int tileSize, int tileScale,
                  Constants::LayerType layer)
        : mTextureId(textureId),
          mTileSize(tileSize),
          mTileScale(tileScale),
          mScaledTile(tileSize * tileScale),
          mLayer(layer) {}
    void LoadMap(std::string filePath, int mapSizeX, int mapSizeY);
};
}  // namespace CL::Core
