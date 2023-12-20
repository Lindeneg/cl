#pragma once

#include <cstddef>
#include <vector>

#include "../Core/GameObject.h"

/* GameObjectManager is responsible for creating, updating,
 * rendering and destroying all GameObject instances. */
namespace CL::Manager::GameObjectManager {
// returns amount of registered game objects
std::size_t GetGameObjectCount();
// true if manager manages any game objects
bool HasGameObjects();
// get const ref of registered game objects
const std::vector<Core::GameObject*>& GetGameObjects();

// TODO: get entity by name
// const Core::GameObject& GetEntityByName(Core::GameObjectAttr name);
// TODO: get entity by tag
// const Core::GameObject& GetEntityByTag(Core::GameObjectAttr tag);

// get all objects by layer (useful when rendering)
std::vector<Core::GameObject*> GetGameObjectsByLayer(
    Constants::LayerType layer);
// register new game object
Core::GameObject* AddGameObject(GameObjectName name, GameObjectTag tag,
                                Constants::LayerType layer);
/* calls update on all active game objects
 * deletes inactive game objects */
void Update(float deltaTime);
/* renders game objects respecting their layers
 * as defined in Constants::LayerType */
void Render();
// prints registered game objects
void Print();
// cleans up inactive game objects
void DestroyInactive();
// cleans up all game objects, active or not
void Destroy();
}  // namespace CL::Manager::GameObjectManager
