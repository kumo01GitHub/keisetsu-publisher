# keisetsu Publisher

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/kumo01GitHub/keisetsu-publisher/pulls)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![CI](https://github.com/kumo01GitHub/keisetsu-publisher/actions/workflows/ci.yml/badge.svg)](https://github.com/kumo01GitHub/keisetsu-publisher/actions/workflows/ci.yml)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/a0da510a881f4e229b63f0db95009c33)](https://app.codacy.com/gh/kumo01GitHub/keisetsu-publisher/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/a0da510a881f4e229b63f0db95009c33)](https://app.codacy.com/gh/kumo01GitHub/keisetsu-publisher/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)


This is an editing and generation tool for keisetsu decks.
It runs on Next.js and generates `.kdb` files and deck manifests directly in the browser.


## Features Overview

- Create new decks and edit cards
- Bulk import cards via CSV
- Load and re-edit existing `.kdb` files
- Generate ZIP files containing both `.kdb` and deck manifest for distribution

## Supported Languages

- English (`en`)
- Japanese (`ja`)

## Architecture

```text
Next.js (App Router)
    |- src/app/layout.tsx
    |    - Font and global layout definitions
    |
    |- src/app/page.tsx  (client component)
    |    - Deck meta info and card editing UI
    |    - CSV/kdb import
    |    - SQLite generation with sql.js
    |    - Deck manifest generation
    |    - ZIP output with JSZip
    |
    |- src/app/page.module.css
             - Admin panel styles
```

### Main Dependencies

- `sql.js`: Generate/read SQLite in the browser
- `papaparse`: CSV parsing
- `jszip`: ZIP multiple outputs

## Local Development Steps

### Prerequisites

- Node.js 20.x or higher (recommended)
- npm

### Setup

```bash
cd keisetsu-publisher
npm ci
```

### Start Development Server

```bash
npm run dev
```

### Quality Checks

```bash
npm run lint
npm run build
```

### Usage Flow

1. Open the app with `npm run dev`
2. Enter cards directly, or import via CSV/kdb
3. Adjust deck meta info (ID, title, language, etc.)
4. Download as a bundled ZIP (includes both `.kdb` and deck manifest)
5. Reflect the generated files in `keisetsu-database` and verify

## Deployment

### Public URL

- [https://keisetsu-publisher.vercel.app](https://keisetsu-publisher.vercel.app)

### Deployment Steps with Vercel

1. Push the `keisetsu-publisher` directory to a repository (e.g., GitHub)
2. Log in to Vercel (https://vercel.com), and select "Add New Project" to choose your repository
3. Set Framework: Next.js (auto-detected) / Root Directory: keisetsu-publisher
4. Set environment variables (.env) as needed
5. Click the "Deploy" button to start deployment
6. After deployment, access the app via the issued URL
7. Any update (push/merge) to the main branch will trigger automatic redeployment

## Related Links

- [keisetsu-database](https://github.com/kumo01GitHub/keisetsu-database)
- [keisetsu-mobile](https://github.com/kumo01GitHub/keisetsu-mobile)
- [keisetsu-docs](https://github.com/kumo01GitHub/keisetsu-docs)
