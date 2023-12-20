#include "Vector2.h"

#include <cassert>

#include "./Compare.h"
#include "./Constants.h"

const CL::Vector2 CL::Vector2::Zero{};

float CL::Vector2::MagnitudeAlt() const { return (mX * mX) + (mY * mY); }
float CL::Vector2::Magnitude() const { return sqrt(MagnitudeAlt()); }

/*
Normalizes vector to a unit vector by
dividing by the length of the vector
*/
CL::Vector2 CL::Vector2::GetUnitVec() const {
    float magnitude = Magnitude();
    if (magnitude > CL::Constants::ABS_EPSILION) {
        return *this / magnitude;
    }
    return CL::Vector2::Zero;
}

CL::Vector2& CL::Vector2::NormalizeVec() {
    float magnitude = Magnitude();
    if (magnitude > CL::Constants::ABS_EPSILION) {
        *this /= magnitude;
    }
    return *this;
}

// Magnitude (distance) between two vectors
float CL::Vector2::Distance(const Vector2& vec) const {
    return (vec - *this).Magnitude();
}

/*
Returns scalar from the dot product of two vectors
vecA = [ aX , aY ]
vecB = [ bX , bY ]

vecA * vecB = (aX * bX) + (aY * bY)
*/
float CL::Vector2::DotProduct(const Vector2& vec) const {
    return (mX * vec.mX) + (mY * vec.mY);
}

/*
Projects a vector onto another vector by
getting a unit vector in the direction of vec
and multiply it by it's dot product scalar
*/
CL::Vector2 CL::Vector2::ProjectOnto(const Vector2& anotherVec) const {
    CL::Vector2 UnitVec = anotherVec.GetUnitVec();
    float dotProduct = DotProduct(UnitVec);
    return UnitVec * dotProduct;
}
/*
Calculate the angle between two vectors. Example:
        |\
        | \
   v|  \
   e|   \
   c|    \
   B|     \
        |_     \
        |θ|____ \
          vecA
cos(θ) = adj / hyp
if ||vecB|| == 1
cos(θ) = vecB * vecA
else
cos(θ) = ( vecB / ||vecB|| ) * ( vecA / ||vecA|| )
and then returning the inverse
cos(θ)^-1 = some angle
*/
float CL::Vector2::AngleBetween(const Vector2& anotherVec) const {
    return acosf(GetUnitVec().DotProduct(anotherVec.GetUnitVec()));
}

/*
Rotates a vector
xRotate = xcos(θ) - ysin(θ)
yRotate = xsin(θ) + ycos(θ)
*/
void CL::Vector2::RotateVec(float angle, const Vector2& refPoint) {
    float cosine = cosf(angle);
    float sine = sinf(angle);
    CL::Vector2 thisVec(mX, mY);
    thisVec -= refPoint;

    float xRotate = (thisVec.mX * cosine) - (thisVec.mY * sine);
    float yRotate = (thisVec.mX * sine) + (thisVec.mY * cosine);

    CL::Vector2 vecRotate = CL::Vector2(xRotate, yRotate);
    *this = vecRotate + refPoint;
}
CL::Vector2 CL::Vector2::RotateVecResult(float angle,
                                         const Vector2& refPoint) const {
    float cosine = cosf(angle);
    float sine = sinf(angle);
    CL::Vector2 thisVec(mX, mY);
    thisVec -= refPoint;

    float xRotate = (thisVec.mX * cosine) - (thisVec.mY * sine);
    float yRotate = (thisVec.mX * sine) + (thisVec.mY * cosine);

    CL::Vector2 vecRotate = CL::Vector2(xRotate, yRotate);
    return vecRotate + refPoint;
}

bool CL::Vector2::operator==(const Vector2& anotherVec) const {
    return Compare::IsEqual(mX, anotherVec.mX) &&
           Compare::IsEqual(mY, anotherVec.mY);
}
bool CL::Vector2::operator!=(const Vector2& anotherVec) const {
    return !(*this == anotherVec);
}

/*
Addition & Subtration
vecA = [ aX , aY ]
vecB = [ bX , bY ]

vecA + vecB = [ (aX + bX) , (aY + bY) ]
vecA - vecB = [ (aX - bX) , (aY - bY) ]
*/
CL::Vector2 CL::Vector2::operator+(const Vector2& vec) const {
    return CL::Vector2((mX + vec.mX), (mY + vec.mY));
}
CL::Vector2 CL::Vector2::operator+=(const Vector2& vec) {
    *this = *this + vec;
    return *this;
}

CL::Vector2 CL::Vector2::operator-(const Vector2& vec) const {
    return CL::Vector2((mX - vec.mX), (mY - vec.mY));
}
CL::Vector2 CL::Vector2::operator-=(const Vector2& vec) {
    *this = *this - vec;
    return *this;
}

/*
Negation
vec = [3, 0]
--->
-vec = [-3, 0]
<---
*/
CL::Vector2 CL::Vector2::operator-() const { return CL::Vector2(-mX, -mY); }

/*
Multiplication
vec = [3, 0]
--->
3 * vec = [9, 0]
--------->
-3 * vec = [-9, 0]
<---------
*/
CL::Vector2 CL::Vector2::operator*(float scale) const {
    return CL::Vector2((mX * scale), (mY * scale));
}

/*
Multiplies a vector with a scale and assigns that number back
*/
CL::Vector2& CL::Vector2::operator*=(float scale) {
    *this = *this * scale;
    return *this;
}

/*
aVec * scale => aVec.operator*(scale);
If scale * aVec, we'll have an error.
This reverses the order, if that is the case.
*/
CL::Vector2 operator*(float scale, const CL::Vector2& vec) {
    return vec * scale;
}

/*
Division
vec = [6, 0]
------>
3 / vec = [2, 0]
-->
-3 / vec = [-2, 0]
<--
*/
CL::Vector2 CL::Vector2::operator/(float scale) const {
    // scale must be non-zero (or greater than EPSILION)
    assert(fabsf(scale) > CL::Constants::ABS_EPSILION);
    return CL::Vector2((mX / scale), (mY / scale));
}

/*
Divides a vector with a scale and assigns that number back
*/
CL::Vector2& CL::Vector2::operator/=(float scale) {
    assert(fabsf(scale) > CL::Constants::ABS_EPSILION);
    *this = *this / scale;
    return *this;
}
