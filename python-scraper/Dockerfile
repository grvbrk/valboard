FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY . /app

WORKDIR /app
RUN uv sync --frozen --no-cache --no-dev
ENV PORT=8080
EXPOSE 8080
CMD ["sh", "-c", "/app/.venv/bin/fastapi run src/main.py --host 0.0.0.0 --port ${PORT}"]
