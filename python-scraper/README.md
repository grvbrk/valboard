# Valboard scraper

FastAPI service that scrapes vlr.gg for Valorant match fixtures, live
scorelines, and post-match player statistics. Consumed by the Valboard Devvit
app (`../src/server/data/scraper.ts`).

## Routes

| Route                             | Purpose                                       |
| --------------------------------- | --------------------------------------------- |
| `GET /match/upcoming/all`         | Upcoming match list                           |
| `GET /match/upcoming/single?url=` | One upcoming match (rosters, start time)      |
| `GET /match/live/all`             | Currently live matches                        |
| `GET /match/live/single?url=`     | One live match (per-map score + player stats) |
| `GET /match/results/all`          | Recently finished matches                     |
| `GET /match/results/single?url=`  | One finished match                            |
| `GET /health`                     | Liveness probe                                |

`single` routes take a vlr.gg match URL, validated against
`^https://www\.vlr\.gg/\d+/[\w-]+/?$`.

## Local development

```bash
uv sync
uv run fastapi dev src/main.py     # http://127.0.0.1:8000, docs at /docs
```

Or from the repository root: `npm run scraper:dev`.

## Tests

```bash
uv run python -m unittest discover -s tests -t .    # or: npm run scraper:test
```

`tests/test_players.py` pins the vlr.gg scoreboard markup. vlr silently replaced
its `<table>` scoreboard with a `div.ovw-table` grid, which turned every
match-detail request into a 500; nothing caught it because nothing asserted on
the markup. If those tests fail, vlr changed again and
`src/scrapers/players.py` needs revisiting.

## Deployment — Google Cloud Run

Deployment runs from `.github/workflows/deployment.prod.yml`, triggered manually
via **Actions → PROD Deployment → Run workflow**. It builds
`python-scraper/Dockerfile`, pushes to Artifact Registry, and deploys to Cloud
Run using Workload Identity Federation (no long-lived service-account keys).

Required GitHub configuration:

| Kind     | Name                       |
| -------- | -------------------------- |
| Secret   | `GCP_PROJECT_ID_PROD`      |
| Secret   | `GCP_WIF_PROVIDER_PROD`    |
| Secret   | `GCP_SERVICE_ACCOUNT_PROD` |
| Variable | `REGION_PROD`              |
| Variable | `ARTIFACT_REPO_NAME_PROD`  |
| Variable | `SERVICE_NAME_PROD`        |

### Container contract

Cloud Run injects `PORT` and routes traffic to it. `fastapi run` defaults to
8000, so the `CMD` passes `--port ${PORT}` explicitly — without that the
container starts but never becomes reachable and the deploy fails its health
check.

The image installs with `uv sync --frozen`, so **`uv.lock` must be committed and
in sync with `pyproject.toml`** or the build fails. Run `uv sync` after any
dependency change and commit the lockfile.

### After deploying

Two places need the resulting host:

1. `devvit.json` -> `permissions.http.domains` — the bare hostname, no protocol
   or path. Devvit requires every fetched domain to be declared per app.
2. The Devvit secret holding the base URL:

   ```bash
   npx devvit settings set VALBOARD_URL
   # https://<service>-<hash>.<region>.run.app
   ```

### Note on exposure

The service deploys with `--allow-unauthenticated` because Devvit's fetch
cannot present Google credentials. The endpoints are read-only and scrape
public data, but they are reachable by anyone who learns the URL.
