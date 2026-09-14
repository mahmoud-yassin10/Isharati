from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import DateTime, ForeignKey, String, Text, UniqueConstraint, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

from config import BASE_DIR
from security import hash_password

DB_PATH = BASE_DIR / "raqeeb.db"
LESSON_SEED_PATH = BASE_DIR / "data" / "newton_2nd.json"
DEMO_PASSWORD = "raqeeb-demo"

engine = create_engine(
    f"sqlite:///{DB_PATH.as_posix()}",
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(32), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)


class LessonRow(Base):
    __tablename__ = "lessons"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    teacher_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    json_body: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)


class Assignment(Base):
    __tablename__ = "assignments"
    __table_args__ = (UniqueConstraint("lesson_id", "student_id", name="uq_assignment"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    lesson_id: Mapped[str] = mapped_column(String(64), ForeignKey("lessons.id"), nullable=False)
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)


class Progress(Base):
    __tablename__ = "progress"
    __table_args__ = (UniqueConstraint("student_id", "lesson_id", "step_id", name="uq_progress"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    lesson_id: Mapped[str] = mapped_column(String(64), ForeignKey("lessons.id"), nullable=False)
    step_id: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    sim_snapshot: Mapped[str | None] = mapped_column(Text, nullable=True)
    predicted_sign: Mapped[str | None] = mapped_column(String(255), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )


def lesson_document(row: LessonRow) -> dict:
    data = json.loads(row.json_body)
    data["status"] = row.status
    data["id"] = row.id
    return data


def init_db() -> None:
    Base.metadata.create_all(engine)
    seed_path = Path(LESSON_SEED_PATH)
    lesson_json = json.loads(seed_path.read_text(encoding="utf-8"))
    with SessionLocal() as session:
        if session.get(User, "teacher-demo") is None:
            teacher = User(
                id="teacher-demo",
                email="teacher@raqeeb.local",
                password_hash=hash_password(DEMO_PASSWORD),
                role="teacher",
                name="معلم التجربة",
            )
            student = User(
                id="student-demo",
                email="student@raqeeb.local",
                password_hash=hash_password(DEMO_PASSWORD),
                role="student",
                name="طالب التجربة",
            )
            session.add_all([teacher, student])
            session.add(Assignment(lesson_id=lesson_json["id"], student_id=student.id))

        row = session.get(LessonRow, lesson_json["id"])
        payload = json.dumps(lesson_json, ensure_ascii=False)
        if row is None:
            session.add(
                LessonRow(
                    id=lesson_json["id"],
                    teacher_id="teacher-demo",
                    json_body=payload,
                    status=lesson_json.get("status", "published"),
                )
            )
        else:
            row.json_body = payload
            row.status = lesson_json.get("status", row.status)
        session.commit()
