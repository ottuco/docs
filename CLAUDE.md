# Claude Code Instructions for Ottu Documentation

## Project Overview
This is the Ottu public documentation site built with Docusaurus 3.8.1 and TypeScript. It follows a Stripe-inspired dual-path documentation approach serving both developers and business users.

## Architecture & Technology
- **Framework**: Docusaurus 3.8.1 with TypeScript
- **Deployment**: DigitalOcean App Platform
- **Styling**: CSS modules with custom CSS
- **Package Manager**: npm (not yarn)

## Documentation Structure
```
docs/
├── overview/          # About Ottu, Architecture, Changelog
├── quick-start/       # Developer & Merchant quick start guides
├── developers/        # API documentation and developer guides
├── business/          # Dashboard and business user guides
├── glossary/          # Payment terminology and concepts
└── resources/         # Support, tools, and additional resources
```

## Key Configuration
- **Base URL**: `/` (root)
- **Branch Strategy**: main → production (docs.ottu.net), dev → staging (docs.ottu.dev)

## Development Commands
```bash
npm install         # Install dependencies
npm start          # Development server
npm run build      # Production build
npm run serve      # Test production build
npm run typecheck  # TypeScript validation
```

## Deployment
- **Platform**: DigitalOcean App Platform
- **Production**: `main` branch → https://docs.ottu.net
- **Staging**: `dev` branch → https://docs.ottu.dev

## Content Guidelines
- Follow Stripe-style documentation approach
- Dual-path navigation (developers vs business users)
- No external link dependencies in core documentation
- Use relative links within docs (e.g., `../quick-start/developers`)
- Comprehensive, self-contained content

## Technical Constraints
- Build must pass without broken links (`onBrokenLinks: 'throw'`)
- TypeScript strict mode enabled
- All content must work offline
- No external API dependencies for core functionality

## Navigation Structure
- **Main Sidebar**: Overview, Quick Start, Glossary & Resources
- **Developer Sidebar**: Technical documentation flow
- **Business Sidebar**: User-focused documentation flow

## Maintenance Notes
- Remove/avoid unnecessary blog content
- Keep repository clean of local settings
- Use npm for all package management
- Follow semantic commit messages
- Test builds locally before pushing

## Payment Domain Knowledge
This documentation covers:
- Payment processing fundamentals
- API integration patterns
- Webhook implementation
- Multi-currency handling
- Security and compliance (PCI DSS)
- Business payment flows
- Developer tools and SDKs

## File Management
- Static assets in `static/` folder
- React components in `src/components/`
- Custom CSS in `src/css/custom.css`

## Quality Standards
- All documentation must build successfully
- Links must resolve correctly
- TypeScript must compile without errors
- Content should be comprehensive and practical
- Follow existing code style and conventions