#include "GameObjectManager.h"

#include <algorithm>
#include <cstddef>
#include <iostream>

#include "../Utilities/Constants.h"

// 30 seconds interval
static constexpr int CLEANER_FRAME_TARGET{CL::Constants::FPS * 30};
// frames since last game object cleanup
static int mCleanupFrameCount{0};
// all registered game objects
static std::vector<CL::Core::GameObject*> mGameObjects{};

std::size_t CL::Manager::GameObjectManager::GetGameObjectCount() {
    return mGameObjects.size();
}

bool CL::Manager::GameObjectManager::HasGameObjects() {
    return mGameObjects.size() > 0;
}

const std::vector<CL::Core::GameObject*>&
CL::Manager::GameObjectManager::GetGameObjects() {
    return mGameObjects;
}

std::vector<CL::Core::GameObject*>
CL::Manager::GameObjectManager::GetGameObjectsByLayer(
    Constants::LayerType layer) {
    std::vector<Core::GameObject*> gameObjectsInLayer{};
    for (auto& gameObject : mGameObjects) {
        if (gameObject->GetLayer() == layer) {
            gameObjectsInLayer.emplace_back(gameObject);
        }
    }
    return gameObjectsInLayer;
}

CL::Core::GameObject* CL::Manager::GameObjectManager::AddGameObject(
    GameObjectName name, GameObjectTag tag, Constants::LayerType layer) {
    auto* newObject = new Core::GameObject(name, tag, layer);
    mGameObjects.emplace_back(newObject);
    return newObject;
}

void CL::Manager::GameObjectManager::Update(float deltaTime) {
    if (!HasGameObjects()) {
        return;
    }
    ++mCleanupFrameCount;
    if (mCleanupFrameCount >= CLEANER_FRAME_TARGET) {
        DestroyInactive();
        mCleanupFrameCount = 0;
    }
    for (auto& gameObject : mGameObjects) {
        if (gameObject->IsActive()) {
            gameObject->Update(deltaTime);
        }
    }
}

void CL::Manager::GameObjectManager::Render() {
    if (!HasGameObjects()) {
        return;
    }
    for (std::size_t i = 0; i < Constants::numOfLayers; i++) {
        for (auto& entity :
             GetGameObjectsByLayer(static_cast<Constants::LayerType>(i))) {
            entity->Render();
        }
    }
}

void CL::Manager::GameObjectManager::Print() {
    std::cout << "Managed GameObjects:\n";
    for (std::size_t i = 0; i < mGameObjects.size(); i++) {
        std::cout << *mGameObjects[i] << '\n';
    }
}

void CL::Manager::GameObjectManager::DestroyInactive() {
#ifdef DEBUG
    std::cout << "GameObjectManager: freeing inactive game objects\n";
#endif
    if (!HasGameObjects()) {
        return;
    }
    mGameObjects.erase(
        std::remove_if(mGameObjects.begin(), mGameObjects.end(),
                       [](Core::GameObject* obj) { return !obj->IsActive(); }),
        mGameObjects.end());
}

void CL::Manager::GameObjectManager::Destroy() {
#ifdef DEBUG
    std::cout << "GameObjectManager: freeing game objects\n";
#endif
    if (!HasGameObjects()) {
        return;
    }
    for (auto* gameObject : mGameObjects) {
        delete gameObject;
    }
    mGameObjects.clear();
}
