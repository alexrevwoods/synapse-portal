# Advanced Portal map and discussion verification

The public Alex Revwoods Portal was verified in the browser after the map expansion. The map now keeps the selected Portal context prominent: a centered **Viewing** breadcrumb, a persistent right-side **You are viewing** label adjacent to zoom controls, a root return control, a rail of connected Portal regions, and a clickable minimap are all present. Relationship filters for All, Projects, Teams, and Communities correctly change the visible map regions without affecting the root identity.

The private My Space network overview now accepts pointer drag placement for every owned Portal region and persists a normalized coordinate layout through the protected Profile API. Portal Builder includes owner controls for the root icon and accent color. Signal comments now expose four reaction types, retain owner edit/delete controls, and use anchored Signal cards so notification links can open the corresponding Portal Signals conversation.

Final validation passed TypeScript, all six Vitest files (13 assertions), and the production build.
