# Network map and Signal discussion verification

The desktop My Space capture shows a dedicated **Network overview** beneath the Portal cards. It presents each owned Portal as a selectable region, renders saved Portal-to-Portal paths, lists the associated relationship label or type, and offers direct management and public-preview actions. The 390px view keeps this same hierarchy in a single mobile column without horizontal clipping.

The public Portal capture confirms the expanded map carries both the connected-Portal side controls and compact minimap. The map preserves zoom, pan, and a clear return-to-root control; selecting a connected Portal animates the world to that region. Signal cards retain their compact public layout until a signed-in member opens a discussion, at which point the card provides the inline editor, reply workflow, and author-only edit/delete controls.

Validation completed with `pnpm check`, six Vitest files containing 13 assertions, and `pnpm build`.
