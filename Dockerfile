FROM python:3.11-slim

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r backend/requirements.txt

ENV PYTHONPATH=/app

CMD ["python", "-m", "backend.main"]