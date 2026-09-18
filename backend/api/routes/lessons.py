from __future__ import annotations

import json
import re
import unicodedata

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from db import Assignment, LessonRow, Progress, SessionLocal, User, lesson_document
from security import current_claims

router = APIRouter(tags=["lessons"])

SUBJECTS = {"physics", "science", "math", "language", "social"}


class ProgressBody(BaseModel):
    lesson_id: str
    step_id: str
    status: str
    sim_snapshot: dict | None = None
    predicted_sign: str | None = None


class NewLessonBody(BaseModel):
    title_ar: str = Field(min_length=1, max_length=120)
    subject: str = "physics"


class UpdateLessonBody(BaseModel):
    title_ar: str | None = None
    title_en: str | None = None
    subject: str | None = None
    summary_ar: str | None = None
    summary_en: str | None = None
    minutes: int | None = None
    glossary: dict | None = None
    steps: list[dict] | None = None


def require_user(claims: dict) -> tuple[str, str]:
    return claims["sub"], claims["role"]


def slugify(title: str) -> str:
    """A short, mostly-Latin id derived from the title. Arabic input falls
    back to a random suffix, since transliteration would be unreadable."""
    ascii_title = unicodedata.normalize("NFKD", title).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_title.lower()).strip("-")
    return slug or "lesson"


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


@router.post("/lessons")
def create_lesson(body: NewLessonBody, claims: dict = Depends(current_claims)):
    """Starts a new draft lesson: a title and a subject, no steps yet."""
    user_id, role = require_user(claims)
    if role != "teacher":
        raise HTTPException(status_code=403, detail="للمعلم فقط")
    subject = body.subject if body.subject in SUBJECTS else "physics"
    with SessionLocal() as session:
        base = slugify(body.title_ar)
        lesson_id = base
        suffix = 1
        while session.get(LessonRow, lesson_id) is not None:
            suffix += 1
            lesson_id = f"{base}-{suffix}"
        document = {
            "id": lesson_id,
            "slug": lesson_id,
            "title_ar": body.title_ar,
            "title_en": None,
            "subject": subject,
            "status": "draft",
            "glossary": {},
            "steps": [],
        }
        row = LessonRow(
            id=lesson_id,
            teacher_id=user_id,
            json_body=json.dumps(document, ensure_ascii=False),
            status="draft",
        )
        session.add(row)
        session.commit()
        session.refresh(row)
        return lesson_document(row)


@router.patch("/lessons/{lesson_id}")
def update_lesson(lesson_id: str, body: UpdateLessonBody, claims: dict = Depends(current_claims)):
    """Saves title/subject/summary/glossary/steps edits made in the lesson editor."""
    user_id, role = require_user(claims)
    if role != "teacher":
        raise HTTPException(status_code=403, detail="للمعلم فقط")
    with SessionLocal() as session:
        row = session.get(LessonRow, lesson_id)
        if row is None or row.teacher_id != user_id:
            raise HTTPException(status_code=404, detail="الدرس غير موجود")
        data = json.loads(row.json_body)
        updates = body.model_dump(exclude_unset=True)
        if "subject" in updates and updates["subject"] not in SUBJECTS:
            del updates["subject"]
        data.update(updates)
        row.json_body = json.dumps(data, ensure_ascii=False)
        session.commit()
        session.refresh(row)
        return lesson_document(row)


@router.post("/lessons/{lesson_id}/duplicate")
def duplicate_lesson(lesson_id: str, claims: dict = Depends(current_claims)):
    """Clones a lesson (including its steps) into a new draft the teacher can edit freely."""
    user_id, role = require_user(claims)
    if role != "teacher":
        raise HTTPException(status_code=403, detail="للمعلم فقط")
    with SessionLocal() as session:
        row = session.get(LessonRow, lesson_id)
        if row is None or row.teacher_id != user_id:
            raise HTTPException(status_code=404, detail="الدرس غير موجود")
        data = json.loads(row.json_body)
        base = slugify(f"{data.get('title_ar', 'lesson')}-copy")
        new_id = base
        suffix = 1
        while session.get(LessonRow, new_id) is not None:
            suffix += 1
            new_id = f"{base}-{suffix}"
        data["id"] = new_id
        data["slug"] = new_id
        data["title_ar"] = f"{data.get('title_ar', '')} (نسخة)"
        data["status"] = "draft"
        new_row = LessonRow(
            id=new_id,
            teacher_id=user_id,
            json_body=json.dumps(data, ensure_ascii=False),
            status="draft",
        )
        session.add(new_row)
        session.commit()
        session.refresh(new_row)
        return lesson_document(new_row)


@router.delete("/lessons/{lesson_id}")
def delete_lesson(lesson_id: str, claims: dict = Depends(current_claims)):
    """Archives (deletes) a draft lesson. Published lessons must be unpublished first,
    so a lesson a student is mid-way through never disappears out from under them."""
    user_id, role = require_user(claims)
    if role != "teacher":
        raise HTTPException(status_code=403, detail="للمعلم فقط")
    with SessionLocal() as session:
        row = session.get(LessonRow, lesson_id)
        if row is None or row.teacher_id != user_id:
            raise HTTPException(status_code=404, detail="الدرس غير موجود")
        if row.status == "published":
            raise HTTPException(status_code=400, detail="أوقف نشر الدرس قبل حذفه")
        session.query(Progress).filter(Progress.lesson_id == lesson_id).delete()
        session.query(Assignment).filter(Assignment.lesson_id == lesson_id).delete()
        session.delete(row)
        session.commit()
        return {"ok": True}


@router.get("/students")
def list_students(claims: dict = Depends(current_claims)):
    """Every student assigned to one of this teacher's lessons, with completion counts
    and the most recent activity timestamp, for the students and reports pages."""
    user_id, role = require_user(claims)
    if role != "teacher":
        raise HTTPException(status_code=403, detail="للمعلم فقط")
    with SessionLocal() as session:
        lessons = session.query(LessonRow).filter(LessonRow.teacher_id == user_id).all()
        lesson_ids = [row.id for row in lessons]
        if not lesson_ids:
            return []
        lesson_docs = {row.id: lesson_document(row) for row in lessons}
        assignments = session.query(Assignment).filter(Assignment.lesson_id.in_(lesson_ids)).all()
        student_ids = sorted({a.student_id for a in assignments})
        if not student_ids:
            return []
        students = session.query(User).filter(User.id.in_(student_ids)).all()
        student_by_id = {student.id: student for student in students}
        progress_rows = (
            session.query(Progress)
            .filter(Progress.lesson_id.in_(lesson_ids), Progress.student_id.in_(student_ids))
            .all()
        )
        result = []
        for student_id in student_ids:
            student = student_by_id.get(student_id)
            if student is None:
                continue
            assigned_ids = [a.lesson_id for a in assignments if a.student_id == student_id]
            own_progress = [p for p in progress_rows if p.student_id == student_id]
            completed = 0
            last_activity = None
            for lid in assigned_ids:
                doc = lesson_docs[lid]
                required = [step["id"] for step in doc["steps"] if step.get("type") != "sign_check"]
                done_ids = {p.step_id for p in own_progress if p.lesson_id == lid and p.status == "done"}
                if required and all(step_id in done_ids for step_id in required):
                    completed += 1
            for p in own_progress:
                if p.updated_at and (last_activity is None or p.updated_at > last_activity):
                    last_activity = p.updated_at
            result.append(
                {
                    "id": student.id,
                    "name": student.name,
                    "email": student.email,
                    "assigned_count": len(assigned_ids),
                    "completed_count": completed,
                    "last_activity": last_activity.isoformat() if last_activity else None,
                }
            )
        return result


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


@router.delete("/progress")
def reset_progress(claims: dict = Depends(current_claims)):
    """Clears every progress row for the signed-in student, across all lessons."""
    user_id, role = require_user(claims)
    if role != "student":
        raise HTTPException(status_code=403, detail="للطالب فقط")
    with SessionLocal() as session:
        deleted = session.query(Progress).filter(Progress.student_id == user_id).delete()
        session.commit()
        return {"ok": True, "deleted": deleted}


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
