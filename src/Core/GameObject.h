#pragma once

#include <iostream>
#include <map>
#include <typeinfo>

#include "../Utilities/Constants.h"
#include "./Component.h"

namespace CL::Core {
/* GameObjects are objects used in the actual game. GameObjects
 * can have multiple Components attached but not of duplicate types.
 *
 * GameObjects are controlled by a Manager::GameObject. */
class GameObject {
   private:
    // static threadsafe id counter/generator
    static GameObjectId mIdCounter;
    // unique identifier
    GameObjectId mId;
    // non-unique name
    GameObjectName mName;
    // non-unqiue tag
    GameObjectTag mTag;
    // layer game object occupies
    Constants::LayerType mLayer;
    // typemap using generics for component read/write
    std::map<const std::type_info*, Component*> mComponentTypeMap;
    // current state of game object
    bool mIsActive;

   public:
    GameObject();
    GameObject(GameObjectName name, GameObjectTag tag,
               Constants::LayerType layer);
    ~GameObject();
    inline const GameObjectId& GetId() const { return mId; }
    inline bool IsActive() const { return mIsActive; }
    inline void SetActive(bool newState) { mIsActive = newState; }
    inline GameObjectName GetName() const { return mName; }
    inline Constants::LayerType GetLayer() const { return mLayer; }
    inline friend std::ostream& operator<<(std::ostream& os,
                                           const GameObject& obj) {
        os << "GameObject: " << obj.mName << " | Layer: " << obj.mLayer
           << " | ID: " << obj.mId << '\n';
        os << "Components:\n";
        for (auto& componentEl : obj.mComponentTypeMap) {
            os << componentEl.first->name() << '\n';
        }
        return os;
    }
    /* Handle per-frame updates (called before Render) */
    void Update(float deltaTime);
    /* Handle per-frame renders (called after Update) */
    void Render();

    template <typename T, typename... TArgs>
    T& AddComponent(TArgs&&... args) {
        static_assert(
            std::is_base_of<Component, T>::value,
            "type parameter of this class must derive from Core::Component");
        T* newComponent{new T(std::forward<TArgs>(args)...)};
        newComponent->owner = this;
        mComponentTypeMap[&typeid(*newComponent)] = newComponent;
        newComponent->Initialize();
        return *newComponent;
    }

    template <typename T>
    T* GetComponent() {
        return static_cast<T*>(mComponentTypeMap[&typeid(T)]);
    }

    template <typename T>
    bool HasComponent() const {
        return mComponentTypeMap.count(&typeid(T));
    }
};
}  // namespace CL::Core

