# Graph and Signals visual verification

Initial responsive captures confirmed the compact Builder shell remains stable on mobile. The new Signals workspace capture exposed a React hook-order error introduced by deriving the feed filter after loading guards. The feed-derived memo now runs consistently before conditional returns, fixing the error while retaining the private-note filter and color-coded owner management view.

Final full-page 390px verification confirms the composer guidance now wraps into a clear label and audience-specific message. The owner view exposes Public, Followers, Connections, and Private note as individually color-coded composer choices and horizontal filters; the public feed remains unchanged. The Graph Editor shows the visible zoom control, Tidy map action, a selected Node control within the map itself, and a placement confirmation state; its inspector remains stacked below the map for smaller screens.
