#include "AssetManager.h"

#include <SDL2/SDL_image.h>
#include <SDL2/SDL_render.h>
#include <SDL2/SDL_surface.h>

#include <cassert>
#include <iostream>
#include <unordered_map>

#include "./RenderManager.h"

static std::unordered_map<std::string, SDL_Texture*> mTextures{};

static SDL_Texture* LoadTexture(const char* filePath) {
    SDL_Surface* surface = IMG_Load(filePath);
    assert(surface != nullptr && "failed to load texture");
    SDL_Texture* texture = SDL_CreateTextureFromSurface(
        CL::Manager::RenderManager::GetRenderer(), surface);
    SDL_FreeSurface(surface);
    return texture;
}

bool CL::Manager::AssetManager::HasTexture(std::string textureId) {
    return mTextures.find(textureId) != mTextures.end();
}

void CL::Manager::AssetManager::AddTexture(std::string textureId,
                                           const char* filePath) {
    assert(!HasTexture(textureId) && "trying to load already loaded texture");
    mTextures[textureId] = LoadTexture(filePath);
}

SDL_Texture* CL::Manager::AssetManager::GetTexture(std::string textureId) {
    auto texture = mTextures.find(textureId);
    if (texture == mTextures.end()) {
        return nullptr;
    }
    return texture->second;
}

void CL::Manager::AssetManager::RemoveTexture(std::string textureId) {
    auto* texture = GetTexture(textureId);
    assert(texture != nullptr && "trying to delete non-loaded texture");
    // remove from texture map
    mTextures.erase(textureId);
    // free texture pointer
    SDL_DestroyTexture(texture);
}

void CL::Manager::AssetManager::Destroy() {
#ifdef DEBUG
    std::cout << "AssetManager: freeing all assets\n";
#endif
    for (auto& textureEl : mTextures) {
        SDL_DestroyTexture(textureEl.second);
    }
    mTextures.clear();
}
