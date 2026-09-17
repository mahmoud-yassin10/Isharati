FROM python:3.12-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ffmpeg \
        libglib2.0-0 \
        libgl1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements-fly.txt /app/requirements-fly.txt
RUN pip install --no-cache-dir -r /app/requirements-fly.txt

COPY backend/ /app/

ENV PYTHONUNBUFFERED=1 \
    RAQEEB_DATA_DIR=/data \
    PORT=8080

RUN mkdir -p /data /app/temp /app/static

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080", "--proxy-headers"]
