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
    if (c == COORD_DELIMITER || c == TILE_DELIMITER) {
        return true;
    }
    if (c == EMPTY_TILE) {
        return false;
    }
    *s += c;
    return appendCoordToString(stream, s);
}

bool CL::Core::TileMapLoader::setTileCoords(std::fstream& stream, int* x,
                                            int* y) {
    if (stream.eof()) {
        return false;
    }
    std::string sX{};
    std::string sY{};
    bool shouldContinue = appendCoordToString(stream, &sY);
    if (!shouldContinue) {
        return false;
    }
    if (shouldContinue && sY.size() == 0) {
        return setTileCoords(stream, x, y);
    }
    appendCoordToString(stream, &sX);
    if (sX.size() > 0 && sY.size() > 0) {
        *x = (std::stoi(sX) * mTileSize);
        *y = (std::stoi(sY) * mTileSize);
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
            bool didSet = setTileCoords(file, &cX, &cY);
            if (didSet) {
                std::cout << "y: " << y << ", x: " << x << "|cY: " << cY
                          << ", cX: " << cX << '\n';
                AddTile(cX, cY, x * mScaledTile, y * mScaledTile);
            }
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
