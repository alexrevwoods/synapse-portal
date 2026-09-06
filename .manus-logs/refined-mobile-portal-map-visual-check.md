# Refined full-network Portal map verification

The mobile full-network view at 390×844 now keeps the relationship filters in a dedicated bottom-left rail, well away from the header and map controls. The region minimap is substantially larger, carries a visible Map label, and has a separate elevated position above the filter rail. The new placement leaves the central canvas clear for exploration.

The fullscreen map now accepts direct one-finger touch panning while preserving two-finger pinch zoom. Pointer-event validation confirmed the world transform updates after a touch drag. A native, non-passive wheel listener also prevents page scrolling while the pointer is over the desktop canvas and changes the map zoom instead. TypeScript, 13 automated assertions, and the production build pass.
