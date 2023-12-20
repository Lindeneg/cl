#pragma once

namespace CL::Core {
// forward declaration
class GameObject;
/* Components are the building blocks for GameObjects
 * and thus each Component have a GameObject owner.
 *
 * The owning GameObject is responsible for deletion. */
struct Component {
    // pointer to GameObject owner
    GameObject* owner;
    // default destructor
    virtual ~Component() {}
    // initialize logic
    virtual void Initialize() {}
    // update logic
    virtual void Update(float) {}
    // render logic
    virtual void Render() {}
};
}  // namespace CL::Core

