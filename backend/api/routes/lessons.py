from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from db import Assignment, LessonRow, Progress, SessionLocal, User, lesson_document
from security import current_claims

router = APIRouter(tags=["lessons"])


class ProgressBody(BaseModel):
    lesson_id: str
    step_id: str
    status: str
    sim_snapshot: dict | None = None
    predicted_sign: str | None = None


def require_user(claims: dict) -> tuple[str, str]:
    return claims["sub"], claims["role"]


@router.get("/lessons")
def list_lessons(claims: dict = Depends(current_claims)):
    user_id, role = require_user(claims)
    with SessionLocal() as session:
        if role == "teacher":
            rows = session.query(LessonRow).filter(LessonRow.teacher_id == user_id).all()
        else:
            assigned = (
                session.query(LessonRow)
                .join(Assignment, Assignment.lesson_id == LessonRow.id)
                .filter(Assignment.student_id == user_id, LessonRow.status == "published")
                .all()
            )
            rows = assigned
        return [lesson_document(row) for row in rows]


@router.get("/lessons/{lesson_id}")
def get_lesson(lesson_id: str, claims: dict = Depends(current_claims)):
    user_id, role = require_user(claims)
    with SessionLocal() as session:
        row = session.get(LessonRow, lesson_id)
        if row is None:
            raise HTTPException(status_code=404, detail="الدرس غير موجود")
        if role == "student":
            assigned = (
                session.query(Assignment)
                .filter(Assignment.lesson_id == lesson_id, Assignment.student_id == user_id)
                .one_or_none()
            )
            if assigned is None or row.status != "published":
                raise HTTPException(status_code=403, detail="هذا الدرس غير معيّن لك")
        elif row.teacher_id != user_id:
            raise HTTPException(status_code=403, detail="لا يمكنك فتح هذا الدرس")
        return lesson_document(row)


@router.post("/lessons/{lesson_id}/publish")
def publish_lesson(lesson_id: str, claims: dict = Depends(current_claims)):
    user_id, role = require_user(claims)
    if role != "teacher":
        raise HTTPException(status_code=403, detail="للمعلم فقط")
    with SessionLocal() as session:
        row = session.get(LessonRow, lesson_id)
        if row is None or row.teacher_id != user_id:
            raise HTTPException(status_code=404, detail="الدرس غير موجود")
        row.status = "published"
        data = json.loads(row.json_body)
        data["status"] = "published"
        row.json_body = json.dumps(data, ensure_ascii=False)
        session.commit()
        return lesson_document(row)


@router.post("/lessons/{lesson_id}/unpublish")
def unpublish_lesson(lesson_id: str, claims: dict = Depends(current_claims)):
    user_id, role = require_user(claims)
    if role != "teacher":
        raise HTTPException(status_code=403, detail="للمعلم فقط")
    with SessionLocal() as session:
        row = session.get(LessonRow, lesson_id)
        if row is None or row.teacher_id != user_id:
            raise HTTPException(status_code=404, detail="الدرس غير موجود")
        row.status = "draft"
        data = json.loads(row.json_body)
        data["status"] = "draft"
        row.json_body = json.dumps(data, ensure_ascii=False)
        session.commit()
        return lesson_document(row)


@router.post("/lessons/{lesson_id}/assign")
def assign_lesson(lesson_id: str, claims: dict = Depends(current_claims)):
    user_id, role = require_user(claims)
    if role != "teacher":
        raise HTTPException(status_code=403, detail="للمعلم فقط")
    with SessionLocal() as session:
        row = session.get(LessonRow, lesson_id)
        if row is None or row.teacher_id != user_id:
            raise HTTPException(status_code=404, detail="الدرس غير موجود")
        student = session.query(User).filter(User.role == "student").first()
        if student is None:
            raise HTTPException(status_code=400, detail="لا يوجد طالب للتعيين")
        existing = (
            session.query(Assignment)
            .filter(Assignment.lesson_id == lesson_id, Assignment.student_id == student.id)
            .one_or_none()
        )
        if existing is None:
            session.add(Assignment(lesson_id=lesson_id, student_id=student.id))
            session.commit()
        return {"ok": True, "student_id": student.id, "student_name": student.name}


@router.get("/lessons/{lesson_id}/progress")
def lesson_progress(lesson_id: str, claims: dict = Depends(current_claims)):
    user_id, role = require_user(claims)
    with SessionLocal() as session:
        row = session.get(LessonRow, lesson_id)
        if row is None:
            raise HTTPException(status_code=404, detail="الدرس غير موجود")
        if role == "teacher" and row.teacher_id != user_id:
            raise HTTPException(status_code=403, detail="لا يمكنك رؤية هذا التقدم")
        query = session.query(Progress, User).join(User, User.id == Progress.student_id)
        query = query.filter(Progress.lesson_id == lesson_id)
        if role == "student":
            query = query.filter(Progress.student_id == user_id)
        items = []
        for progress, user in query.all():
            snapshot = json.loads(progress.sim_snapshot) if progress.sim_snapshot else None
            items.append(
                {
                    "student_id": user.id,
                    "student_name": user.name,
                    "step_id": progress.step_id,
                    "status": progress.status,
                    "sim_snapshot": snapshot,
                    "predicted_sign": progress.predicted_sign,
                    "updated_at": progress.updated_at.isoformat() if progress.updated_at else None,
                }
            )
        return items


@router.post("/progress")
def save_progress(body: ProgressBody, claims: dict = Depends(current_claims)):
    user_id, role = require_user(claims)
    if role != "student":
        raise HTTPException(status_code=403, detail="للطالب فقط")
    with SessionLocal() as session:
        assigned = (
            session.query(Assignment)
            .filter(Assignment.lesson_id == body.lesson_id, Assignment.student_id == user_id)
            .one_or_none()
        )
        if assigned is None:
            raise HTTPException(status_code=403, detail="هذا الدرس غير معيّن لك")
        row = (
            session.query(Progress)
            .filter(
                Progress.student_id == user_id,
                Progress.lesson_id == body.lesson_id,
                Progress.step_id == body.step_id,
            )
            .one_or_none()
        )
        snapshot = json.dumps(body.sim_snapshot, ensure_ascii=False) if body.sim_snapshot else None
        if row is None:
            row = Progress(
                student_id=user_id,
                lesson_id=body.lesson_id,
                step_id=body.step_id,
                status=body.status,
                sim_snapshot=snapshot,
                predicted_sign=body.predicted_sign,
            )
            session.add(row)
        else:
            row.status = body.status
            row.sim_snapshot = snapshot
            row.predicted_sign = body.predicted_sign
        session.commit()
        return {"ok": True, "step_id": body.step_id, "status": body.status}
