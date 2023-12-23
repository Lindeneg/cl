#include <cstdlib>

#include "./Manager/GameManager.h"
#include "Core/TileMapLoader.h"
#include "Manager/AssetManager.h"

// editor should save to some format, either use json
// https://github.com/nlohmann/json
// or something more lightweight.. figure out schema first tho
int main([[maybe_unused]] int argc, [[maybe_unused]] char** argv) {
    // initialize game manager
    bool success{CL::Manager::GameManager::Initialize(800, 600)};
    if (!success) {
        return EXIT_FAILURE;
    }

    // load assets
    CL::Manager::AssetManager::AddTexture(
        "tilemap-texture", "./assets/tilemaps/terrain_tiles_v2.png");
    // load map
    auto map = CL::Core::TileMapLoader("tilemap-texture", 2, 32);
    map.LoadMap("./assets/tilemaps/tile.map", 10, 10);

    // start game
    while (CL::Manager::GameManager::IsRunning()) {
        CL::Manager::GameManager::RunGameLoop();
    }
    CL::Manager::GameManager::Destroy();
    return EXIT_SUCCESS;
}

