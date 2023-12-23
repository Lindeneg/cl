#pragma once

#include <fstream>
#include <string>

namespace CL::Core {
struct TileMapLoader {
   private:
    enum TileMapSymbol {
        COORD_DELIMITER = ',',
        TILE_DELIMITER = '|',
        EMPTY_TILE = '&'
    };

    std::string mTextureId;
    int mScale;
    int mTileSize;
    int mScaledTile;

    bool appendCoordToString(std::fstream& stream, std::string* s);
    bool setTileCoords(std::fstream& stream, int* x, int* y);
    void AddTile(int srcX, int srcY, int x, int y);

   public:
    TileMapLoader(std::string textureId, int scale, int tileSize)
        : mTextureId(textureId),
          mScale(scale),
          mTileSize(tileSize),
          mScaledTile(tileSize * scale) {}
    void LoadMap(std::string filePath, int mapSizeX, int mapSizeY);
};
}  // namespace CL::Core
