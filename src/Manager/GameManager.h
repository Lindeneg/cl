#pragma once

#include <SDL2/SDL_events.h>
#include <SDL2/SDL_render.h>

/* GameManager is responsible for consuming, and ultimately
 * destroying, all needed classes, such as managers, assets etc.
 * */
namespace CL::Manager::GameManager {
bool IsRunning();
/* initializes SDL window and renderer */
bool Initialize(int width, int height);
/* processes input, updates and rendering */
void RunGameLoop();
/* cleanup logic */
void Destroy();
}  // namespace CL::Manager::GameManager
