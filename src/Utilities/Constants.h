#pragma once

#include <SDL2/SDL_pixels.h>

#include <atomic>
#include <cstddef>
#include <string_view>

namespace CL {
// commonly used type aliases
using GameObjectName = std::string;
using GameObjectTag = std::string_view;
using GameObjectId = std::atomic_uint32_t;
}  // namespace CL

/**/
namespace CL::Constants {
//
constexpr int FPS{60};
//
constexpr int FRAME_TARGET{1000 / FPS};
// aprox of PI
constexpr double PI{3.14159265359};
// twice the PI, double the fun
constexpr double TWO_PI{PI * 2.0f};
// will be used to produce epsilion
// relative to value of operands
constexpr double REL_EPSILION{1e-8};
// absolute epsilion value
constexpr double ABS_EPSILION{1e-12};
// some RGBA colors
constexpr SDL_Color WHITE_COLOR{255, 255, 255, 255};
constexpr SDL_Color GREEN_COLOR{0, 255, 0, 255};
constexpr SDL_Color GRAY_COLOR{21, 21, 21, 255};

// default tags
constexpr GameObjectTag DEFAULT_TAG{"Default"};
constexpr GameObjectTag PLAYER_TAG{"Player"};
constexpr GameObjectTag ENEMY_TAG{"Enemey"};

enum LayerType {
    TILEMAP_LAYER,
    TERRAIN_LAYER,
    ENEMY_LAYER,
    COLLIDABLE_LAYER,
    PLAYER_LAYER,
    PROJECTILE_LAYER,
    UI_LAYER
};

constexpr std::size_t numOfLayers{7};

}  // namespace CL::Constants
