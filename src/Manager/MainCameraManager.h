#pragma once

struct SDL_Rect;

namespace CL::Manager::MainCameraManager {
void Initialize(int width, int height);
SDL_Rect GetRect();
int GetX();
int GetY();
void Update();
}  // namespace CL::Manager::MainCameraManager
