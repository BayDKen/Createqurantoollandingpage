## 2026-08-14 - Wrap list items containing drag-and-drop state in React.memo()
**Learning:** When using react-dnd with list items, dragging an item or updating the parent drop zone state can trigger full re-renders of all child components in the list, even those not directly involved in the interaction, causing an O(n) performance hit.
**Action:** Always wrap draggable child components rendered in lists with `React.memo()` to prevent unnecessary re-renders of sibling items when parent drop zone state changes.
