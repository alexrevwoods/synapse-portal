# Skin and brand surface visual verification

The Skin Studio correctly reflects the Account's current Core membership and exposes exactly six included platform skins: Signal, Lagoon, Iris, Ember, Moss, and Arctic. The Brand Studio route renders image upload affordances and correctly locks Nexus brand color and custom-domain controls for the Core tier. The 390×844 visitor Portal remains free of any viewer Skin selector while retaining the Portal owner's visual treatment, confirming that public Portal styling is owner-controlled rather than viewer-controlled.

Final validation passed: TypeScript compilation, four Vitest files (six assertions, including tier allowance and Nexus-only Brand Studio rules), and the production build all complete successfully. The production bundler reports only its existing large-chunk optimization advisory; it does not prevent deployment.
