# Mobile Portal map refinement verification

At 390×844, the public Alex Revwoods Portal now shows a compact **Portals** trigger instead of the persistent connected-Portal card stack. The unexpanded map remains clear: filters, zoom controls, root Node, and the minimap are all reachable without crowding the canvas. The first-visit guidance appears as a small bottom map prompt that says **Explore the map — Pinch to zoom. Use two fingers to pan.** Its acknowledgement is stored locally, so it is not shown again for that visitor.

The compact drawer opens only on demand from the Portals trigger and lists the root plus every connected Portal with the active region visibly marked. Selecting a Portal closes the drawer before moving the map. The owner-only Builder setting adds an **Auto-focus next Portal** switch; when enabled, a public map begins at the first linked Portal and retains the root return path.

TypeScript compilation, six Vitest files with 13 assertions, the production build, and mobile full-page visual verification passed.
