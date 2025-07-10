# Ottu Documentation

This documentation site is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

```bash
npm install
```

## Local Development

```bash
npm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Type Checking

```bash
npm run typecheck
```

## Serve Production Build

```bash
npm run serve
```

## Deployment

This project uses GitHub Actions for automated deployment to GitHub Pages. The deployment happens automatically:

- **Production**: Deployments from the `main` branch go to the main site
- **Preview**: Deployments from other branches create preview environments

### Manual Deployment (if needed)

```bash
npm run deploy
```

## Contributing

1. Create a new branch for your changes
2. Make your edits to the documentation
3. Test locally with `npm start`
4. Create a pull request
5. Preview will be automatically generated for your branch

## Project Structure

```
docs/
├── overview/          # About Ottu, Architecture, Changelog
├── quick-start/       # Developer & Merchant quick start guides
├── developers/        # API documentation and developer guides
├── business/          # Dashboard and business user guides
├── glossary/          # Payment terminology and concepts
└── resources/         # Support, tools, and additional resources
```
