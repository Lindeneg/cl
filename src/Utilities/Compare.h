#pragma once

#include <algorithm>

#include "./Constants.h"

template <typename T>
static inline constexpr T Abs(T x) {
    return (x < 0 ? -x : x);
}

template <typename T>
static inline constexpr bool EqualRel(T a, T b) {
    return (Abs(a - b) <=
            (std::max(Abs(a), Abs(b)) * CL::Constants::REL_EPSILION));
}

namespace CL::Compare {
template <typename T>
inline constexpr bool IsEqual(T a, T b) {
    if (Abs(a - b) <= Constants::ABS_EPSILION) {
        return true;
    }
    return EqualRel(a, b);
}

template <typename T>
inline constexpr bool isGreaterOrEqual(T a, T b) {
    if (IsEqual(a, b)) {
        return true;
    }
    return a > b;
}

template <typename T>
inline constexpr bool isLessOrEqual(T a, T b) {
    if (IsEqual(a, b)) {
        return true;
    }
    return a < b;
}

template <typename T>
inline constexpr bool isGreater(T a, T b) {
    if (IsEqual<T>(a, b)) {
        return false;
    }
    return a > b;
}

template <typename T>
inline constexpr bool isLesser(T a, T b) {
    if (IsEqual(a, b)) {
        return false;
    }
    return a < b;
}
}  // namespace CL::Compare

