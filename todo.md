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

## Portal Network and Signal Discussion Expansion

- [x] Add a private **Network overview** to My Space for reviewing all owned Portals and their saved paths.
- [x] Persist Portal-to-Portal relationship types and optional custom labels; expose them when creating or editing linked Portal Nodes.
- [x] Surface relationship context in the public connected map, including region navigation, animated transitions, and a clickable minimap.
- [x] Notify a Signal owner when a reply is made anywhere in that Signal’s discussion, while also notifying the direct parent commenter when applicable.
- [x] Add owner-only edit and soft-delete controls for Signal comments and replies.
- [x] Add unread conversation counts to Timeline, Portal Signals navigation, and the owner’s Portal tab; counts clear through the existing notification center.
- [x] Validate schema migration, TypeScript, tests, production build, desktop layouts, and 390px mobile layouts.

## Advanced Portal Map and Conversation Controls

- [x] Persist every owner Portal’s private network-region coordinates and enable drag-and-drop arrangement in My Space.
- [x] Add root-map icon and accent-color preferences, with five icon and five color choices in the Portal Builder.
- [x] Add a prominent map center breadcrumb, a nearby **You are viewing** status, root-return navigation, relationship filters, and a filtered minimap experience.
- [x] Add rich Signal-comment reactions: Spark, Love, Insight, and Celebrate.
- [x] Add deep-linked notification actions that open the target Portal’s Signal conversation.
- [x] Validate database migrations, typed APIs, TypeScript, tests, production build, and desktop map controls.

## Clean Connected Portal Switching

- [x] Prevent mobile and desktop destination sheets from opening when a visitor changes connected Portal regions.
- [x] Preserve the animated region transition, breadcrumb, minimap, selected rail state, and root return control.
- [x] Verify live Portal switching and rerun TypeScript, tests, and production build.

## Mobile Map Navigation Refinements

- [x] Replace the persistent mobile connected-Portal rail with a compact, on-demand Portal switcher drawer.
- [x] Close the drawer before moving to a selected Portal region and retain breadcrumb, minimap, and root return controls.
- [x] Add an owner-controlled **Auto-focus next Portal** map preference, persisted to the Profile.
- [x] Add a local, one-time gesture guide for pinch zoom and two-finger pan.
- [x] Generate and apply the `mapAutoFocusNext` profile migration.
- [x] Validate mobile rendering, TypeScript, tests, and production build.

## Embedded and Full Network Mobile Map

- [x] Simplify the normal mobile Portal map to the map preview, zoom/reset controls, and one clear **Show full network** action.
- [x] Move Portal regions, filters, minimap, breadcrumb, and gesture guide into the explicit full-network experience.
- [x] Add an edge-to-edge, scroll-locking full-network map with a persistent **Minimize** action.
- [x] Preserve accessible Escape handling and auto-close the Portal drawer before switching map regions.
- [x] Validate mobile rendering, TypeScript, automated tests, and the production build.

## Persistent Relationship States and Viewer Context

- [x] Add a viewer-specific relationship state query for follow and mutual Connection status.
- [x] Persistively label Follow as **Following** and accepted Connection as **Connected**.
- [x] Prevent reciprocal accepted Connections from being overwritten by a new pending request.
- [x] Link pending inbound requests to the Network workspace and add direct notification acceptance.
- [x] Add a **Viewing as** Portal selector with clear **Your Portal** and **Visitor view** context labels.
- [x] Validate state labels, TypeScript, automated tests, and production build.

## Owner Publishing and Relationship Management

- [x] Replace Follow and Connect with owner-specific Portal actions when viewing an owned Portal.
- [x] Add **Publish Signal** in the owner Portal header and at the Profile Feed heading.
- [x] Show a Connection-request notification badge and direct link for owned Portals with incoming requests.
- [x] Add confirmed unfollow and disconnect actions with persistent state refresh.
- [x] Add All, Following, Connections, and My Signals filters to Timeline.
- [x] Show a short public relationship activity history on each Portal.
- [x] Validate responsive rendering, TypeScript, automated tests, and production build.

## Timeline Header Navigation

- [x] Replace the generic **My Space** header action with **Edit My Portals**.
- [x] Add a prominent **View my Portal** action for the currently selected viewing identity.
- [x] Validate the responsive Timeline header and production build.

## Portal Map Gesture and Control Refinements

- [x] Move full-network relationship filters into a non-overlapping bottom-left control rail.
- [x] Enlarge and label the bottom-right Portal minimap for reachable region selection.
- [x] Enable direct one-finger panning in the mobile full-network view while preserving two-finger pinch zoom.
- [x] Bind desktop mouse-wheel zoom natively so the map responds instead of scrolling the page while hovered.
- [x] Support a direct `?network=full` Portal URL for a shareable full-network opening state.
- [x] Validate the mobile layout, pointer gestures, TypeScript, automated tests, and production build.

## Desktop Full-Network Map

- [x] Add a clear **Show full network** action beneath the desktop embedded Portal map.
- [x] Extend full-screen map mode to desktop with an edge-to-edge canvas and persistent **Minimize** action.
- [x] Preserve all map navigation tools, Portal controls, minimap, zooming, and drag panning in desktop full-network mode.
- [x] Verify the desktop full-map view, TypeScript, automated tests, and production build.

## Mobile Full-Map Destination Detail

- [x] Move the selected destination sheet into a protected clearance zone above full-map bottom controls.
- [x] Fade and disable the full-map filters, minimap, and gesture hint while destination detail is open.
- [x] Verify the corrected 390px mobile map, TypeScript, automated tests, and production build.

## Contextual Portal Map Details

- [x] Replace separate mobile and desktop destination cards with one Node-anchored detail popover.
- [x] Position details above or below the selected Node and constrain edge nodes within the map canvas.
- [x] Preserve a clear mobile full-map control layout when a Node detail is open.
- [x] Validate shared behavior, TypeScript, automated tests, and the production build.
