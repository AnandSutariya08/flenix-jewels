---
name: Radix overlay z-index stacking
description: Dialog/Sheet z-index must stay below Select/DropdownMenu/Popover portal z-index, or nested dropdowns become invisible/unclickable.
---

Radix UI portals (Dialog, Select, DropdownMenu, Popover, etc.) all render into the document body, outside their component tree. Because of this, their visual stacking is determined purely by CSS `z-index`, not DOM nesting.

If a Dialog's overlay/content z-index is higher than or equal to a Select/DropdownMenu/Popover's content z-index, then opening one of those dropdowns *inside* a dialog will render the dropdown list behind the dialog. The dropdown technically opens (state changes, ARIA updates), but it's visually hidden and unclickable — this looks exactly like "nothing happens when I click."

**Why:** shadcn/ui's default generated components assign different literal z-index values per component type (e.g. Dialog at `z-[1000]`, Select/DropdownMenu/Popover at `z-50`) instead of a coordinated layering scale, so it's easy for someone to bump one component's z-index for an unrelated reason (e.g. to sit above a sticky header) and unintentionally break every dropdown nested inside dialogs across the whole app.

**How to apply:** Whenever a project has custom/overridden z-index values on `dialog.tsx`, `sheet.tsx`, or `alert-dialog.tsx`, verify that `select.tsx`, `dropdown-menu.tsx`, and `popover.tsx` have an equal or higher z-index. Keep the ordering: content meant to render docked "inside" other overlays (Select/DropdownMenu/Popover/Tooltip) should always be same-or-higher than Dialog/Sheet z-index, since users open them from within dialogs far more often than the reverse.
