from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from db import SessionLocal, User
from security import current_claims, make_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginBody(BaseModel):
    email: str
    password: str


def user_payload(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "name": user.name,
    }


@router.post("/login")
def login(body: LoginBody):
    with SessionLocal() as session:
        user = session.query(User).filter(User.email == body.email.strip().lower()).one_or_none()
        if user is None:
            user = session.query(User).filter(User.email == body.email.strip()).one_or_none()
        if user is None or not verify_password(body.password, user.password_hash):
            raise HTTPException(status_code=401, detail="البريد أو كلمة المرور غير صحيحة")
        return {
            "token": make_token(user.id, user.role),
            "user": user_payload(user),
        }


@router.get("/me")
def me(claims: dict = Depends(current_claims)):
    with SessionLocal() as session:
        user = session.get(User, claims["sub"])
        if user is None:
            raise HTTPException(status_code=401, detail="المستخدم غير موجود")
        return user_payload(user)
