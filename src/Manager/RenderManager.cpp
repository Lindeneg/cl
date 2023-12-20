#include "RenderManager.h"

#include <SDL2/SDL_error.h>
#include <SDL2/SDL_render.h>
#include <SDL2/SDL_video.h>

#include <cassert>
#include <iostream>

#include "../Utilities/Constants.h"
#include "./GameObjectManager.h"
#include "SDL2/SDL_rect.h"

static SDL_Window* mWindow{nullptr};
static SDL_Renderer* mRenderer{nullptr};
static SDL_Color mClearColor{CL::Constants::GRAY_COLOR};

SDL_Renderer* CL::Manager::RenderManager::GetRenderer() { return mRenderer; }

bool CL::Manager::RenderManager::Initialize(const char* title, int width,
                                            int height) {
    // only one initialization allowed if not destroyed beforehand
    assert(mWindow == nullptr && mRenderer == nullptr &&
           "render members are already non-null values");

    mWindow =
        SDL_CreateWindow(title, SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED,
                         width, height, SDL_WINDOW_MAXIMIZED);
    if (!mWindow) {
        std::cerr << "Error creating SDL window: " << SDL_GetError() << '\n';
        return false;
    }
    mRenderer = SDL_CreateRenderer(
        mWindow, -1, SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC);
    if (!mRenderer) {
        std::cerr << "Error creating SDL renderer: " << SDL_GetError() << '\n';
        return false;
    }
    return true;
}

void CL::Manager::RenderManager::SetClearColor(SDL_Color c) { mClearColor = c; }

void CL::Manager::RenderManager::ProcessRender() {
    SDL_SetRenderDrawColor(mRenderer, mClearColor.r, mClearColor.g,
                           mClearColor.b, mClearColor.a);
    SDL_RenderClear(mRenderer);
    GameObjectManager::Render();
    SDL_RenderPresent(mRenderer);
}

void CL::Manager::RenderManager::RenderTexture(SDL_Texture* texture,
                                               SDL_Rect src, SDL_Rect dst,
                                               SDL_RendererFlip flip) {
    SDL_RenderCopyEx(mRenderer, texture, &src, &dst, 0.0l, nullptr, flip);
}

void CL::Manager::RenderManager::Destroy() {
    if (mWindow != nullptr) {
#ifdef DEBUG
        std::cout << "RenderManager: freeing window\n";
#endif
        SDL_DestroyWindow(mWindow);
        mWindow = nullptr;
    }
    if (mRenderer != nullptr) {
#ifdef DEBUG
        std::cout << "RenderManager: freeing renderer\n";
#endif
        SDL_DestroyRenderer(mRenderer);
        mRenderer = nullptr;
    }
}

