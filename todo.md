# WhoAreWe Brand & Product Identity Migration

## Objective
Migrate the existing application into **WhoAreWe**, a dark-first network where identity meets opportunity, while preserving authentication, Portals, Signals, Connections, Timeline, Discovery, media, and responsive interactions.

## Completed scope
- [x] Audit visible legacy branding, metadata, and reusable surfaces.
- [x] Establish the WhoAreWe design system: Montserrat typography, near-black surfaces, blue/purple/cyan/green palette, gradient, responsive connected-node mark, and favicon.
- [x] Rebuild the public landing, access, account, onboarding, Discover, Portal, and linked member-navigation presentation layers.
- [x] Standardize member language around **Discover**, **Timeline**, **My Space**, **Portal**, **Signals**, and **Connections**.
- [x] Add a three-step free Portal flow: who the Portal represents, public identity details, then optional first destinations.
- [x] Preserve Media Revolution as the featured live demo and apply the new public Portal layout, navigation, map controls, and actions.
- [x] Migrate the legacy internal Node category to `portal` without losing existing rows.
- [x] Validate TypeScript, automated tests, production build, public Portal behavior, and mobile layouts.
- [x] Save a final checkpoint for deployment.

## Compatibility note
The historical database migration snapshots retain prior enum values so that Drizzle can preserve migration history. The active schema and persisted records have been migrated to the `portal` Node category; no visible legacy product branding remains.

## Acceptance rules
The release uses **WhoAreWe** spelling exactly, presents **Where Identity Meets Opportunity.** in the brand system, preserves existing product behavior, and keeps the public experience free of legacy product branding.

## Official Brand Asset Deployment

- [x] Extract and catalogue the supplied WhoAreWe Official Brand Asset Package.
- [x] Upload official production logo, three-node icon, favicon, PWA icon, Apple touch icon, and OpenGraph art to managed storage.
- [x] Centralize official asset paths, terminology, and color references in `shared/brand.ts`.
- [x] Replace the recreated interface mark with the supplied official logo and icon assets.
- [x] Import the supplied WhoAreWe token stylesheet and align global aliases to the approved palette.
- [x] Configure favicon, PWA manifest, Apple touch icon, OpenGraph, and Twitter metadata with official assets.
- [x] Validate the desktop and mobile presentation, asset URLs, TypeScript, test suite, and production build.

## Connected Portal Network Expansion

- [x] Add a lightweight startup splash using the official WhoAreWe app icon and reduced-motion-safe transition.
- [x] Expand free early-access accounts to **three Portals**, while retaining tiered capacity for active paid memberships.
- [x] Route **New identity** actions from My Space and the Portal Builder to a clear, three-step additional-Portal flow.
- [x] Add a capacity endpoint and show the relevant account capacity before creation; block cleanly when a limit is reached.
- [x] Add an owner-only **Link Portal** action in the Portal Builder, using a `portal` Node attached to the selected owned Portal.
- [x] Enrich public Portal data with the linked Portal's public Nodes and connection lines.
- [x] Expand the live public map into a multi-region canvas: zoom and pan remain available, side controls shift to connected Portal regions, and connected destination cards open the linked Portal.
- [x] Validate mobile onboarding, My Space, Builder, and public Portal map layouts, plus TypeScript, tests, and production build.
