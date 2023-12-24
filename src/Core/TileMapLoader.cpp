#include "TileMapLoader.h"

#include <fstream>
#include <iostream>
#include <string>

#include "../Manager/GameObjectManager.h"
#include "./GameObject.h"
#include "./TileComponent.h"

bool CL::Core::TileMapLoader::appendCoordToString(std::fstream& stream,
                                                  std::string* s) {
    char c{};
    stream.get(c);
    if (c == COORD_DELIMITER || c == TILE_DELIMITER || c == LAYER_START ||
        c == LAYER_END) {
        return true;
    }
    if (c == EMPTY_TILE) {
        return false;
    }
    *s += c;
    return appendCoordToString(stream, s);
}

bool CL::Core::TileMapLoader::setTileCoords(std::fstream& stream, int* x,
                                            int* y, int* l) {
    if (stream.eof()) {
        return false;
    }
    std::string sX{};
    std::string sY{};
    std::string sL{};
    bool continueToX = appendCoordToString(stream, &sY);
    if (!continueToX) {
        return false;
    }
    if (continueToX && sY.size() == 0) {
        return setTileCoords(stream, x, y, l);
    }
    bool continueToLayer = appendCoordToString(stream, &sX);
    if (!continueToLayer) {
        return false;
    }
    appendCoordToString(stream, &sL);
    if (sX.size() > 0 && sY.size() > 0 && sL.size() > 0) {
        *x = (std::stoi(sX) * mTileSize);
        *y = (std::stoi(sY) * mTileSize);
        *l = std::stoi(sL);
        return true;
    }
    return false;
}

void CL::Core::TileMapLoader::LoadMap(std::string filePath, int mapSizeX,
                                      int mapSizeY) {
    std::fstream file{};
    file.open(filePath);
    for (int y = 0; y < mapSizeY; y++) {
        for (int x = 0; x < mapSizeX; x++) {
            int cX{};
            int cY{};
            int cL{};
            bool didSet = setTileCoords(file, &cX, &cY, &cL);
            if (didSet) {
                AddTile(cX, cY, x * mScaledTile, y * mScaledTile);
            }
        }
    }
    file.close();
}

void CL::Core::TileMapLoader::AddTile(int srcX, int srcY, int x, int y) {
    // TODO GET TEXTURE, TILESIZE AND SCALE
    auto* newTile{Manager::GameObjectManager::AddGameObject(
        "tile", Constants::DEFAULT_TAG, mLayer)};
    newTile->AddComponent<TileComponent>(srcX, srcY, x, y, mTileSize,
                                         mTileScale, mTextureId);
}
