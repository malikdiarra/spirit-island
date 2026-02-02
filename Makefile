BUCKET ?= $(GCS_BUCKET)
DIST   := dist

.PHONY: dev build deploy clean

dev:
	npx vite

build:
	npx vite build

deploy: build
	@if [ -z "$(BUCKET)" ]; then \
		echo "Error: set GCS_BUCKET env var or pass BUCKET=gs://your-bucket"; \
		exit 1; \
	fi
	gsutil -m rsync -r -d $(DIST) $(BUCKET)

clean:
	rm -rf $(DIST)
