FROM python:3.10-slim-bullseye

# Variables de entorno
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FLASK_DEBUG=0

# Directorio de trabajo
WORKDIR /app

# Instalacion de dependencias del sistema
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    software-properties-common \
    git \
    && rm -rf /var/lib/apt/lists/*

# Instalacion de dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# Asignacion de puerto 5000
EXPOSE 5000

# Ejecutar la aplicación
CMD ["flask", "run", "--host", "0.0.0.0"]