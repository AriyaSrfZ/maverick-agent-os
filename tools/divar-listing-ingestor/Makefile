.PHONY: install lint typecheck test build

install:
	python -m pip install -e ".[dev]"

lint:
	ruff check src tests

typecheck:
	mypy src

test:
	pytest -q

build:
	python -m build --wheel
