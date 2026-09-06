# Relationship state and viewing context verification

The mobile Portal verification is authenticated as the Media Revolution Portal. It now has an explicit **Viewing as Media Revolution** control and a **Visitor view** label while browsing Hyacinth CS. The relationship actions accurately read **Following** and **Connected** from persisted state rather than falling back to their request labels. On the owner’s own Portal, the same header identifies **Your Portal** and replaces social actions with **Manage Portal**.

The relationship state lookup recognizes a Connection as mutual after it is accepted, even where the accepted row was created in the opposite direction. A new Connection request will no longer overwrite or duplicate that accepted state. Pending inbound requests show **Review request** and lead to the Network workspace. Notifications also expose a direct **Accept Connection** action when a pending request is present.

TypeScript compilation, 13 automated assertions across six Vitest files, and the production build passed.
