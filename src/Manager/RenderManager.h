#pragma once

#include <SDL2/SDL_pixels.h>
#include <SDL2/SDL_render.h>

/* RenderManager is a static class responsible for the
 * main window and the renderer associated with that window.
 *
 * Call renderManager.Initialize before first use.
 * Call renderManager.Shutdown after last use. */
namespace CL::Manager::RenderManager {
// TODO: SDL_Window* GetWindow();
SDL_Renderer* GetRenderer();
/* init logic - required before use */
bool Initialize(const char* title, int width, int height);
/* clear used to clear screen between buffer swap */
void SetClearColor(SDL_Color c);
/* processes game object rendering */
void ProcessRender();
/* draw a loaded texture */
void RenderTexture(SDL_Texture* texture, SDL_Rect src, SDL_Rect dst,
                   SDL_RendererFlip flip);
/* free resources */
void Destroy();
}  // namespace CL::Manager::RenderManager
