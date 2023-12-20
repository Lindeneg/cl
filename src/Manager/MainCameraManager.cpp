#include "MainCameraManager.h"

#include <SDL2/SDL_rect.h>

static SDL_Rect mCamera{0, 0, 0, 0};

void CL::Manager::MainCameraManager::Initialize(int width, int height) {
    mCamera.w = width;
    mCamera.h = height;
}

SDL_Rect CL::Manager::MainCameraManager::GetRect() { return mCamera; }

int CL::Manager::MainCameraManager::GetX() { return mCamera.x; }

int CL::Manager::MainCameraManager::GetY() { return mCamera.y; }

// TODO
void CL::Manager::MainCameraManager::Update() {}
