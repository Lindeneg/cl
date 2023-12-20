#include "TileMapLoader.h"

#include <fstream>

#include "../Manager/GameObjectManager.h"
#include "./GameObject.h"
#include "./TileComponent.h"

void CL::Core::TileMapLoader::LoadMap(std::string filePath, int mapSizeX,
                                      int mapSizeY) {
    std::fstream file{};
    file.open(filePath);
    for (int y = 0; y < mapSizeY; y++) {
        for (int x = 0; x < mapSizeX; x++) {
            char ch;
            // get first char in pair (y)
            file.get(ch);
            int sourceRectY = atoi(&ch) * mTileSize;
            // get second char in par (x)
            file.get(ch);
            int sourceRectX = atoi(&ch) * mTileSize;
            // add new tile
            AddTile(sourceRectX, sourceRectY, x * (mScale * mTileSize),
                    y * (mScale * mTileSize));
            // ignore comma
            file.ignore();
        }
    }
    file.close();
}

void CL::Core::TileMapLoader::AddTile(int srcX, int srcY, int x, int y) {
    auto* newTile{Manager::GameObjectManager::AddGameObject(
        "tile", Constants::DEFAULT_TAG, Constants::TILEMAP_LAYER)};
    newTile->AddComponent<TileComponent>(srcX, srcY, x, y, mTileSize, mScale,
                                         mTextureId);
}
