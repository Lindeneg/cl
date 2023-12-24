#pragma once

#include <SDL2/SDL_render.h>

#include <string>

#include "../Utilities/Vector2.h"
#include "./Component.h"

namespace CL::Core {
class TileComponent : public Component {
   private:
    std::string mTextureId;
    SDL_Texture* mTexture;
    SDL_Rect mSrcRect;
    SDL_Rect mDstRect;
    Vector2 mPosition;

   public:
    TileComponent(int srcX, int srcY, int x, int y, int tileSize, int tileScale,
                  std::string textureId);

    void Update(float deltaTime) override;
    void Render() override;
};
}  // namespace CL::Core
