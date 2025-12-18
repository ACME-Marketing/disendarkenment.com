# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Astro 5 static marketing website for a psychedelic therapy facilitation service (licensed psilocybin therapy in Oregon and Colorado). Deployed on Netlify.

## Commands

```bash
npm run dev      # Start development server (localhost:4321)
npm run build    # Production build to dist/
npm run preview  # Preview production build locally
```

## Architecture

### Key Directories
- `src/pages/` - File-based routing (Astro pages)
- `src/components/` - Reusable Astro components
- `src/config/` - Site and booking configuration
- `src/lib/` - Utility libraries (analytics, security, GraphQL)
- `src/layouts/` - Base layout with SEO and structured data
- `public/` - Static assets, PWA files, favicon variants

### Configuration Files
- `src/config/site.ts` - Contains `GoLive` flag (true/false) controlling consultation availability
- `src/config/booking.ts` - Cal.com integration settings and helper functions

### Integrations
- **Cal.com** - Scheduling (embedded via ConsultationModal component)
- **GraphQL CMS** - Content from `https://cms.acmemarketing.us/graphql`
- **n8n Webhooks** - Advanced contact form automation

## GoLive Mode

The `GoLive` flag in `src/config/site.ts` controls whether consultation scheduling is enabled:
- `true` - Normal operation, Cal.com scheduling available
- `false` - "Not live" mode, scheduling disabled, shows unavailability message

This flag is checked throughout the codebase in components like ConsultationModal and contact forms.

## Build Configuration

Static site generation with:
- Tailwind CSS + Typography plugin
- Sitemap auto-generation with priority customization
- HTML compression enabled
- Vendor chunking for GraphQL libraries (Vite config)
- Prefetch strategy: 'tap' (on interaction)
