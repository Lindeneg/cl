#include "GameManager.h"

#include <SDL2/SDL.h>
#include <SDL2/SDL_error.h>

#include <cassert>
#include <iostream>

#include "./AssetManager.h"
#include "./GameObjectManager.h"
#include "./InputManager.h"
#include "./MainCameraManager.h"
#include "./RenderManager.h"
#include "./UpdateManager.h"

static bool mIsRunning{false};

bool CL::Manager::GameManager::Initialize(int width, int height) {
    assert(mIsRunning == false && "cannot initialize whilst already running");
    if (SDL_Init(SDL_INIT_VIDEO | SDL_INIT_TIMER | SDL_INIT_EVENTS) != 0) {
        std::cerr << "Error initializing SDL." << SDL_GetError() << '\n';
        return false;
    }
    if (!RenderManager::Initialize("Funkallero", width, height)) {
        return false;
    }
    MainCameraManager::Initialize(width, height);
    mIsRunning = true;
    return true;
}

bool CL::Manager::GameManager::IsRunning() { return mIsRunning; }

void CL::Manager::GameManager::RunGameLoop() {
    bool hasExitSignal = InputManager::ProcessInput();
    if (hasExitSignal) {
        mIsRunning = false;
        return;
    }
    UpdateManager::ProcessUpdate();
    RenderManager::ProcessRender();
}

void CL::Manager::GameManager::Destroy() {
    mIsRunning = false;
    GameObjectManager::Destroy();
    AssetManager::Destroy();
    RenderManager::Destroy();
    SDL_Quit();
}
