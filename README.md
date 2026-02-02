# Spirit Island Randomizer

A web app that randomly assigns spirits, boards, adversaries, and scenarios for Spirit Island game sessions.

## Features

- Random spirit and board assignment per player (1-6 players)
- Random adversary (with level) and scenario selection
- Target difficulty filtering — pick a combined difficulty and only matching adversary+scenario combos are used
- Expansion toggling — enable/disable content from Base Game, Branch & Claw, Jagged Earth, Feather & Flame, and Nature Incarnate

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- npm
- [Google Cloud SDK](https://cloud.google.com/sdk) (only for deployment)

## Development

Install dependencies:

```sh
npm install
```

Start the dev server with hot reload:

```sh
make dev
```

This runs Vite's dev server, typically at `http://localhost:5173`.

### Linting

```sh
npm run lint
```

### Building for production

```sh
make build
```

Output goes to `dist/`.

### Preview the production build locally

```sh
npm run preview
```

### Clean build artifacts

```sh
make clean
```

## Deployment

Deploy the built site to a GCP Cloud Storage bucket:

```sh
# Via environment variable
GCS_BUCKET=gs://your-bucket-name make deploy

# Or pass directly
make deploy BUCKET=gs://your-bucket-name
```

This runs `make build` first, then syncs `dist/` to the bucket using `gsutil rsync`. The `-d` flag removes files from the bucket that are no longer in the build output.

## Project structure

```
src/
  App.jsx              # Main app component
  App.css              # App styles
  main.jsx             # Entry point
  index.css            # Global styles
  components/
    SpiritCard.jsx      # Player spirit + board card
    GameSetupCard.jsx   # Adversary / scenario card
  data/
    spirits.json        # Spirit definitions (name, expansion, complexity)
    boards.json         # Board definitions
    adversaries.json    # Adversaries with per-level difficulties
    scenarios.json      # Scenarios with difficulties
```

## Adding content

Game data lives in JSON files under `src/data/`. Each file is an array of objects:

- **spirits.json** — `{ name, expansion, complexity }`
- **boards.json** — `{ name, expansion }`
- **adversaries.json** — `{ name, expansion, levels: [{ level, difficulty }] }`
- **scenarios.json** — `{ name, expansion, difficulty }`

Set `expansion` to `null` for base/default entries (e.g. "No Adversary", "No Scenario"). Otherwise use the expansion name string — it must match across all data files for the expansion toggle to work correctly.
