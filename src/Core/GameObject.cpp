#include "GameObject.h"

#include <atomic>

CL::GameObjectId CL::Core::GameObject::mIdCounter{0};

CL::Core::GameObject::GameObject()
    : mId(mIdCounter++),
      mName(""),
      mTag(Constants::DEFAULT_TAG),
      mLayer(Constants::DEFAULT_LAYER),
      mComponentTypeMap({}) {}

CL::Core::GameObject::GameObject(GameObjectName name, GameObjectTag tag,
                                 Constants::LayerType layer)
    : mId(mIdCounter++),
      mName(name),
      mTag(tag),
      mLayer(layer),
      mComponentTypeMap({}) {}

CL::Core::GameObject::~GameObject() {
    for (auto& componentEl : mComponentTypeMap) {
        delete componentEl.second;
    }
}

void CL::Core::GameObject::Update(float deltaTime) {
    for (auto& componentEl : mComponentTypeMap) {
        componentEl.second->Update(deltaTime);
    }
}

void CL::Core::GameObject::Render() {
    for (auto& componentEl : mComponentTypeMap) {
        componentEl.second->Render();
    }
}

