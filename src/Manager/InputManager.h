#pragma once

#include <SDL2/SDL_events.h>

/* InputManager is responsible for global
 * keybindings, such as exit and pause. */
namespace CL::Manager::InputManager {
/* Get const reference to polled SDL event handle */
const SDL_Event& GetEventHandle();
/* Processes default key signals, such as exit.
 * Return true if exit signal has been detected. */
bool ProcessInput();
}  // namespace CL::Manager::InputManager
