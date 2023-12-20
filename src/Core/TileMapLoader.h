#pragma once

#include <string>

namespace CL::Core {
struct TileMapLoader {
   private:
    std::string mTextureId;
    int mScale;
    int mTileSize;

    void AddTile(int srcX, int srcY, int x, int y);

   public:
    TileMapLoader(std::string textureId, int scale, int tileSize)
        : mTextureId(textureId), mScale(scale), mTileSize(tileSize) {}

    /* Loads a .map file expecting this format: y1x1,y2x2,y3x3,ynxn.. */
    void LoadMap(std::string filePath, int mapSizeX, int mapSizeY);
};
}  // namespace CL::Core
