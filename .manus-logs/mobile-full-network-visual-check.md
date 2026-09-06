# Embedded and full-network mobile map verification

At 390×844, the mobile Media Revolution Portal now presents an intentionally quiet embedded map: all filters, breadcrumb controls, Portal region controls, minimap, and first-visit instructional panel are removed from the normal Portal page. Only the map preview, its compact zoom/reset cluster, and an unmistakable **Show full network** action remain. The action names the total Portal count so visitors understand the scope before entering.

The full-network state uses a fixed, edge-to-edge `100dvh` map shell and locks background document scroll. It contains a dedicated **Full network** title bar, a visible **Minimize** action, the Portal switcher drawer, relationship filters, zoom controls, minimap, and the one-time gesture hint. Escape also exits full-network view for keyboard users. Selecting a Portal automatically closes the drawer before moving the network canvas.

TypeScript, all six Vitest files with 13 assertions, the production build, and mobile full-page verification passed.
