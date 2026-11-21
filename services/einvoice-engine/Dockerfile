# Sandboxed Compliance & PDF/A-3b Document Engine (No Internet Egress)
# Bundles Python 3.12 + WeasyPrint + Ghostscript (PDF/A-3b ICC locking) + factur-x + veraPDF CLI
FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    EPHEMERAL_DIR=/tmp/ephemeral

RUN apt-get update && apt-get install -y --no-install-recommends \
    ghostscript \
    icc-profiles-free \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    libffi-dev \
    libcairo2 \
    fonts-liberation \
    fonts-dejavu-core \
    openjdk-17-jre-headless \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install veraPDF CLI (official PDF Association PDF/A-3b validator)
RUN mkdir -p /opt/verapdf && \
    curl -fsSL https://software.verapdf.org/releases/verapdf-installer.zip -o /tmp/verapdf.zip && \
    unzip -q /tmp/verapdf.zip -d /tmp/verapdf-inst && \
    rm -f /tmp/verapdf.zip

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

RUN useradd -m -u 10001 engine && mkdir -p /tmp/ephemeral && chown -R engine:engine /app /tmp/ephemeral
USER engine

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
