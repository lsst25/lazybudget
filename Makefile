.DEFAULT_GOAL := help

API  := docker compose exec api
WEB  := cd apps/web &&

## —— Containers ——————————————————————————————————————————————————————————————
.PHONY: up build down restart logs ps
up: ## Start api + db in the background
	docker compose up -d

build: ## Rebuild the api image and start
	docker compose up -d --build

down: ## Stop containers (keeps the db volume)
	docker compose down

restart: ## Restart the api container
	docker compose restart api

logs: ## Follow api logs
	docker compose logs -f api

ps: ## Show container status
	docker compose ps

## —— API (inside the container) ——————————————————————————————————————————————
.PHONY: shell artisan composer tinker
shell: ## Open a bash shell in the api container
	$(API) bash

artisan: ## Run artisan, e.g. make artisan CMD="make:model Account -m"
	$(API) php artisan $(CMD)

composer: ## Run composer, e.g. make composer CMD="require foo/bar"
	$(API) composer $(CMD)

tinker: ## Open Laravel tinker
	$(API) php artisan tinker

## —— Quality ——————————————————————————————————————————————————————————————————
.PHONY: test pint pint-check
test: ## Run tests, e.g. make test ARGS="--filter=RegisterTest"
	$(API) php artisan test $(ARGS)

pint: ## Fix code style with Pint
	$(API) ./vendor/bin/pint

pint-check: ## Check code style without changing files
	$(API) ./vendor/bin/pint --test

## —— Database —————————————————————————————————————————————————————————————————
.PHONY: migrate rollback fresh
migrate: ## Run pending migrations
	$(API) php artisan migrate

rollback: ## Roll back the last migration batch
	$(API) php artisan migrate:rollback

fresh: ## DESTRUCTIVE: drop all tables, re-migrate and seed
	$(API) php artisan migrate:fresh --seed

## —— Web (Angular, runs on the host) ————————————————————————————————————————
.PHONY: web web-install web-test web-build
web: ## Start the Angular dev server on :4200 (proxies /api to :8000)
	$(WEB) npm start

web-install: ## Install web dependencies from the lockfile
	$(WEB) npm ci

web-test: ## Run web unit tests
	$(WEB) npm test

web-build: ## Production build of the web app
	$(WEB) npm run build

## —— Help —————————————————————————————————————————————————————————————————————
.PHONY: help
help: ## Show this help
	@grep -E '^(## ——|[a-zA-Z_-]+:.*?## )' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "} /^## ——/ {printf "\n%s\n", substr($$0, 4); next} {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'
