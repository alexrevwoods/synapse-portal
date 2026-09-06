# Map leader line and hover preview verification

A selected destination detail now carries a lightweight directional leader line from the contextual popover to its source Node. The line re-anchors toward the left or right edge of the card for Nodes near map boundaries, avoiding a misleading line that points away from the selected Node.

Desktop Nodes now show a compact, non-interactive hover preview with the destination icon, title, category, and a View cue. Live browser verification confirmed the Facebook Node preview on hover and the expanded contextual popover with its leader line after selection. TypeScript, 13 automated assertions, and the production build pass.
