cmake_minimum_required(VERSION 3.26)
project(sdl-fun)

set(CMAKE_CXX_STANDARD 17)
set(CL_CLANG_DEBUG_FLAGS "-ggdb -pedantic-errors -D DEBUG -Wall -Weffc++ -Wextra -Wconversion -Wsign-conversion")
set(CL_CLANG_RELEASE_FLAGS "-O2 -DNDEBUG")
set(CL_GNU_DEBUG_FLAGS "-static-libstdc++ ${CL_CLANG_DEBUG_FLAGS}")
set(CL_GNU_RELEASE_FLAGS "-static-libstdc++ -s ${CL_CLANG_RELEASE_FLAGS}")
set(CMAKE_EXPORT_COMPILE_COMMANDS true)

set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)

function(set_flags mode debug_flags release_flags)
    if ("${mode}" STREQUAL "RELEASE")
        set(CMAKE_CXX_FLAGS ${release_flags} PARENT_SCOPE)
    else()
        set(CMAKE_CXX_FLAGS ${debug_flags} PARENT_SCOPE)
    endif()
endfunction()

if (CMAKE_CXX_COMPILER_ID STREQUAL "GNU")
    set_flags("$ENV{CL_BUILD_MODE}" "${CL_GNU_DEBUG_FLAGS}" "${CL_GNU_RELEASE_FLAGS}")
elseif(CMAKE_CXX_COMPILER_ID STREQUAL "Clang")
    set_flags("$ENV{CL_BUILD_MODE}" ${CL_CLANG_DEBUG_FLAGS} ${CL_CLANG_RELEASE_FLAGS})
endif()

message(COMPILER_FLAGS="${CMAKE_CXX_FLAGS}")

file(GLOB_RECURSE PROJECT_SOURCES RELATIVE ${CMAKE_SOURCE_DIR} src/*.cpp)
include_directories("$ENV{SDL2_PATH}/include"
    "$ENV{SDL2_IMAGE_PATH}/include")

add_executable(sdl-fun ${PROJECT_SOURCES})

target_link_libraries(sdl-fun "$ENV{SDL2_PATH}/lib/libSDL2main.a"
    "$ENV{SDL2_PATH}/lib/libSDL2.dll.a"
    "$ENV{SDL2_IMAGE_PATH}/lib/libSDL2_image.dll.a"
)
