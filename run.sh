#!/usr/bin/env bash
set -e

echo "=== NutriFit AI ==="
echo ""

# Verificar dependencias
if ! command -v uv &> /dev/null; then
    echo "Error: uv no encontrado. Instala con: curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "Error: Node.js no encontrado. Instala Node.js 20+"
    exit 1
fi

# Verificar .env
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "Archivo .env creado desde .env.example"
        echo "IMPORTANTE: Edita .env y añade tu GOOGLE_API_KEY"
        echo ""
    fi
fi

# Instalar dependencias
echo "Instalando dependencias del backend..."
cd backend && uv sync --quiet && cd ..

echo "Instalando dependencias del frontend..."
cd frontend && npm install --silent && cd ..

echo ""
echo "Lanzando servidores..."
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:5173"
echo ""

# Lanzar backend en background
cd backend && uv run uvicorn src.main:app --reload --port 8000 &
BACKEND_PID=$!

# Lanzar frontend
cd frontend && npm run dev &
FRONTEND_PID=$!

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT

wait
