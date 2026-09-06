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
