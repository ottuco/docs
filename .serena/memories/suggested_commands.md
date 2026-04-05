# Suggested Commands

## Development
```bash
npm install              # Install dependencies
npm start                # Dev server
npm run build            # Production build
npm run serve            # Test production build locally
npm run typecheck        # TypeScript validation
```

## API Documentation Pipeline
```bash
npm run fetch-api        # Download schema from Ottu core
npm run enrich-api       # Apply enrichment overlays to raw spec
npm run gen-api          # Enrich + clean + regenerate API docs
npm run update-api       # Full pipeline: fetch + gen-api
```

## Quality Checks (before committing)
1. `npm run build` — must pass without errors
2. `npm run typecheck` — TypeScript must compile
3. Verify all internal links resolve
4. Code examples must be copy-paste ready

## Git
- Semantic commit messages
- `main` → production, `dev` → staging
