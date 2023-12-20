#pragma once

#include <iostream>

namespace CL {
struct Vector2 {
   private:
    float mX;
    float mY;

   public:
    Vector2() : Vector2(0, 0) {}
    Vector2(float x, float y) : mX(x), mY(y) {}

    static const Vector2 Zero;

    inline void SetX(float x) { mX = x; }
    inline void SetY(float y) { mY = y; }
    inline float GetX() const { return mX; }
    inline float GetY() const { return mY; }

    float MagnitudeAlt() const;
    float Magnitude() const;
    float Distance(const Vector2& vec) const;

    float DotProduct(const Vector2& vec) const;
    Vector2 GetUnitVec() const;
    Vector2& NormalizeVec();

    float AngleBetween(const Vector2& anotherVec) const;
    Vector2 ProjectOnto(const Vector2& anotherVec) const;

    void RotateVec(float angle, const Vector2& refPoint);
    Vector2 RotateVecResult(float angle, const Vector2& refPoint) const;

    // operators
    inline friend std::ostream& operator<<(std::ostream& out,
                                           const Vector2& other) {
        out << "x: " << other.mX << ", y: " << other.mY << '\n';
        return out;
    }

    bool operator==(const Vector2& anotherVec) const;
    bool operator!=(const Vector2& anotherVec) const;

    Vector2 operator-() const;

    Vector2 operator+(const Vector2& vec) const;
    Vector2 operator+=(const Vector2& vec);
    Vector2 operator-(const Vector2& vec) const;
    Vector2 operator-=(const Vector2& vec);

    Vector2 operator*(float scale) const;
    Vector2& operator*=(float scale);
    friend Vector2 operator*(float scale, const Vector2& vec);

    Vector2 operator/(float scale) const;
    Vector2& operator/=(float scale);
};
}  // namespace CL
