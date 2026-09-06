# Desktop Portal map interaction verification

The public Portal preview at a desktop-sized browser displays the side card-free, full-width map, including its scroll-to-zoom, drag-to-pan guidance and zoom controls. Interaction inspection revealed a breakpoint gap between the existing mobile overlay (hidden at 1024px) and the new desktop overlay (shown from 1024px); the next adjustment closes this gap so a selected Node presents an overlay at all widths rather than dropping the detail card.

Direct browser-console interaction verified that selecting the Media Revolution Node activates the in-map desktop detail overlay (`desktop-node-overlay is-open`). The generic browser click helper did not dispatch the component action in this preview session, while the native DOM click did; the implemented React click handler and overlay state transition are therefore confirmed.

The responsive inspection identified the cause of the missing desktop detail overlay: its base style set `display: none`, and the desktop media rule had not overridden that declaration. This has now been explicitly corrected at the desktop breakpoint; the side card is removed and the selected Node details appear as an overlay within the map canvas.

After the breakpoint fix, a live desktop capture verifies the selected Media Revolution Node opens as a compact, pulsing bottom-right detail panel inside the map, with an accessible close control and external-destination action. Console verification also confirms zoom controls immediately transform the map world to `scale(1.14)`. Panning and pinch gestures now apply transforms directly to the DOM while they are in progress, with React state committed only after release; the ambient canvas has been reduced to 30 particles and capped at ~30fps to preserve responsiveness.

Desktop and mobile discovery captures confirm that published Portals are browseable and searchable, with identity-type filters and an adjacent Signals tab. The mobile capture surfaced a compact-header issue: the full Synapse wordmark competes with the page title at 390px. The header will use the logo mark alone on mobile, preserving a clear Discover title.

Live browser verification confirms both Discover modes: published identities load as Portal cards and the Signals tab displays the cross-network public Signal feed, including Media Revolution’s public Signal. A final minor header cleanup will hide the local page-title label on desktop, where the normal desktop Discover navigation item already provides the label.
