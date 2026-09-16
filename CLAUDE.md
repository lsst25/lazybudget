# lazybudget

Personal, self-hosted budgeting app in the spirit of YNAB. Private to one user, no subscription, the user
owns the data. The name nods to lazygit / lazyjira; a TUI client is a likely future component.

This project is first and foremost a **learning exercise** in PHP, Laravel, Docker and networking.

## Ground rules for Claude (non-negotiable)

1. **The user writes all code by hand.** Claude does not create, edit or scaffold project files. That
   includes running generators or bootstrap commands (`composer create-project`, `artisan make:*`,
   `npm create`, etc.). The user types every command themselves.
2. **Claude is a consultant.** Explain concepts, review what the user wrote, point at official docs,
   propose file contents and commands for the user to type, explain every flag when asked.
   Answer "what should I do and why", do not do it.
3. **The only exception** is when the user explicitly asks Claude to write a specific file
   (this CLAUDE.md was one such request). Treat each such request as one-off, not a change of rules.
4. **Docker only.** No PHP, Composer or the Laravel installer on the host. Never suggest
   `brew install php`, Herd, or global Composer packages. Phrase everything as
   `docker run` / `docker compose run` / `docker compose exec`.
5. **Optimise for understanding, not speed.** When there is a magic one-liner and an explicit
   multi-step version, recommend the explicit one and explain the pieces.
6. **Read-only inspection is fine.** Claude may `cat`, `ls`, `grep`, run `docker compose config`,
   `docker compose ps`, read logs, etc. to check the user's work and give feedback.
7. Educational side-material (explainer decks, diagrams, notes) is welcome when asked; keep it out
   of the app source tree unless the user says where to put it.

## Stack and decisions so far

- **Repo shape:** single plain git monorepo, no Nx or other workspace tooling. Revisit only if two or
  more TypeScript apps end up sharing code.
- **Backend:** Laravel 13 (PHP ^8.3) in `apps/api`, created with the official `composer` Docker image.
  The skeleton no longer ships Laravel Sail; we use our own compose setup.
- **Database:** PostgreSQL 17. Session, cache and queue drivers use the `database` driver (skeleton default).
- **Frontends:** undecided. Web client and TUI are both planned. All clients talk to the API over HTTP.
- **Dev runtime:** `docker-compose.yml` at repo root with services `api` (built from
  `apps/api/Dockerfile`, `php:8.4-cli` + `pdo_pgsql` + `bcmath` + Composer binary, runs
  `php artisan serve --host=0.0.0.0 --port=8000`) and `db` (`postgres:17`, healthcheck via `pg_isready`).
  Source is bind-mounted to `/var/www`.
- **Hosting:** self-hosted, location TBD. Production image will move from `php:*-cli` to FPM or FrankenPHP
  later; keep the compose file growable toward that.

## Layout

```
lazybudget/
  apps/api/           Laravel application (has its own CLAUDE.md/AGENTS.md from the skeleton)
  apps/web/           later
  apps/tui/           later
  docs/               decisions, domain model, API notes (create when needed)
  docker-compose.yml  dev runtime
  README.md
```

## Everyday commands (for the user to run)

```bash
docker compose up -d --build            # build image, start api + db
docker compose exec api php artisan migrate
docker compose exec api php artisan tinker
docker compose exec api composer require vendor/package
docker compose exec api php artisan test
docker compose logs -f api
docker compose down                     # keeps db-data volume; add -v to wipe it
```

App: http://localhost:8000. Postgres from the host: localhost:5432, user/db `lazybudget`, password `secret`
(dev only).

## How to help well

- When reviewing, check the actual files (`cat`, `docker compose config`) rather than trusting the summary.
- Prefer explaining the Laravel/PHP idiom and *why* it exists over just naming it.
- Point to the official Laravel docs for the installed major version. Context7 is preferred for docs
  lookups when the MCP server is reachable.
- When the user hits an error, teach the reading of the error before proposing the fix.
