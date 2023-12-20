#include "UpdateManager.h"

#include <SDL2/SDL_timer.h>

#include "../Utilities/Constants.h"
#include "./GameObjectManager.h"
#include "./MainCameraManager.h"

static int mPrevTicks{0};

static void WaitUntilFrameTargetReached() {
    while (!SDL_TICKS_PASSED(static_cast<int>(SDL_GetTicks()),
                             mPrevTicks + CL::Constants::FRAME_TARGET)) {
    }
}

void CL::Manager::UpdateManager::ProcessUpdate() {
    WaitUntilFrameTargetReached();

    float deltaTime{
        static_cast<float>((static_cast<int>(SDL_GetTicks()) - mPrevTicks)) /
        1000.0f};
    deltaTime = (deltaTime > 0.05f) ? 0.05f : deltaTime;
    mPrevTicks = static_cast<int>(SDL_GetTicks());

    GameObjectManager::Update(deltaTime);
    MainCameraManager::Update();
    // TODO: CheckCollisions();
}
