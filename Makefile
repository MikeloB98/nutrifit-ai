.PHONY: install dev dev-backend dev-frontend test lint clean

install:
	cd backend && uv sync
	cd frontend && npm install

dev-backend:
	cd backend && uv run uvicorn src.main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

dev:
	@echo "Lanzando backend y frontend..."
	$(MAKE) dev-backend &
	$(MAKE) dev-frontend

test:
	cd backend && uv run pytest tests/ -v

clean:
	rm -rf backend/.venv frontend/node_modules frontend/dist
