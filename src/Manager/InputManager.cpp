#include "InputManager.h"

#include "SDL2/SDL_events.h"

static SDL_Event mEvent{};

const SDL_Event& CL::Manager::InputManager::GetEventHandle() {
    SDL_PollEvent(&mEvent);
    return mEvent;
}

bool CL::Manager::InputManager::ProcessInput() {
    auto& event = GetEventHandle();
    switch (event.type) {
        case SDL_QUIT: {
            return true;
        }
        case SDL_KEYDOWN: {
            if (event.key.keysym.sym == SDLK_ESCAPE) {
                return true;
            }
        }
        default: {
            break;
        }
    }
    return false;
}
