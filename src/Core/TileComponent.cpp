#include "TileComponent.h"

#include "../Manager/AssetManager.h"
#include "../Manager/MainCameraManager.h"
#include "../Manager/RenderManager.h"
#include "SDL2/SDL_render.h"

CL::Core::TileComponent::TileComponent(int srcX, int srcY, int x, int y,
                                       int tileSize, int tileScale,
                                       std::string textureId) {
    mTextureId = textureId;
    mTexture = Manager::AssetManager::GetTexture(mTextureId);
    mSrcRect.x = srcX;
    mSrcRect.y = srcY;
    mSrcRect.w = tileSize;
    mSrcRect.h = tileSize;
    mDstRect.x = x;
    mDstRect.y = y;
    mDstRect.w = tileSize * tileScale;
    mDstRect.h = tileSize * tileScale;

    mPosition = Vector2(static_cast<float>(x), static_cast<float>(y));
}

void CL::Core::TileComponent::Update(float) {
    mDstRect.x =
        static_cast<int>(mPosition.GetX()) - Manager::MainCameraManager::GetX();
    mDstRect.y =
        static_cast<int>(mPosition.GetY()) - Manager::MainCameraManager::GetY();
}

void CL::Core::TileComponent::Render() {
    Manager::RenderManager::RenderTexture(mTexture, mSrcRect, mDstRect,
                                          SDL_FLIP_NONE);
}
