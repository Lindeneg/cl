#pragma once

#include <SDL2/SDL_render.h>

#include <string>

/**/
namespace CL::Manager::AssetManager {
/* add a texture */
void AddTexture(std::string textureId, const char* filePath);
/* get a texture */
SDL_Texture* GetTexture(std::string textureId);
/* check if texture is loaded */
bool HasTexture(std::string textureId);
/* remove a loaded texture */
void RemoveTexture(std::string textureId);
/* destroy all loaded assets */
void Destroy();
}  // namespace CL::Manager::AssetManager
