# Connected Portal network verification

The refreshed **New identity** flow now reads its intent directly from the query string and is reachable from both **My Space** and the Portal Builder. At 390×844 it presents a clear three-step additional-Portal experience, with the account's actual capacity shown in the explanatory panel.

The responsive Builder retains its compact header and portal-setup controls. The public Portal map continues to render inside the responsive canvas with visible zoom and reset controls; its map component now accepts owned, linked Portal regions. Once a second owned Portal is linked through the Builder's **Link Portal** selector, the public map renders that Portal as a distinct region, provides a connected-Portal side control, shifts the canvas to that region without navigation, and exposes that Portal's own public Nodes and connection lines.

The application splash uses the official PWA app icon and brand palette as a short, non-blocking startup overlay. It respects reduced-motion preferences and never delays the underlying route or authentication state.

Validation passed with TypeScript, six Vitest files (13 assertions), and the production build before final responsive captures.
