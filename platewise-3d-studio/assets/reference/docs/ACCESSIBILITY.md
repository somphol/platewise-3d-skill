# Accessibility

The 3D plate is an enhancement, not the only interface. Every action that changes
the plate can be performed from the DOM.

## Implemented

- **Landmarks and skip link.** `header`, `main`, `footer`, labelled sections and a
  visible-on-focus “Skip to the plate builder” link.
- **Semantic buttons.** Food cards, plate rows, remove buttons and stage tools are
  real `<button>` elements. Icon-only buttons have `aria-label`. The browser test
  asserts that every button has an accessible name.
- **Labelled dialogs.** The warning, guide, sources and save dialogs are native
  `<dialog>` elements with `aria-labelledby`; the warning also uses
  `aria-describedby`. Native focus trapping and Escape work without a library.
- **Search.** The input has a label and a description; `/` focuses it; `Esc`
  clears it; `Enter` adds the first result. The result count is a polite live
  region.
- **Plate management.** Placed servings are listed with name and net carbs;
  “Inspect” selects the 3D mesh; an accessible remove button deletes it. The
  selected-item card exposes nutrition and a remove action.
- **Live announcements.** `#sr-announcer` (polite) announces additions, the
  balanced plate, warnings and saves. The HUD is a polite live region. The pantry
  grid itself is not a live region, to avoid re-announcing 18 cards on each add.
- **Chart alternative.** The canvas has an `aria-label` rewritten with the
  modeled peak/time and the reference peak. Text summaries repeat the peak rise,
  time to peak and estimated load.
- **Keyboard shortcuts.** `/`, `r`, `g`/`?`, `Esc`, `1`–`7`; ignored while typing.
  The 3D view can be rotated automatically, reset and fullscreened by buttons.
- **Focus visibility.** `:focus-visible` uses a 3px green outline with offset.
- **Reduced motion.** `prefers-reduced-motion` removes animations/transitions,
  disables auto-rotate by default (unless the user turns it on) and draws the
  chart immediately.
- **Colour.** Zones are not identified by colour alone: they have text labels,
  the HTML legend and an ordered plate list. Status bands have text labels.
- **Responsive target size.** Buttons are at least ~28–38 px; the mobile dock and
  pantry cards are comfortably tappable. The layout has no horizontal overflow at
  390 px (tested).
- **Language and title.** `<html lang="en">`, a specific page title and a meta
  description.
- **Zoom.** The page does not disable user scaling; the viewport allows
  `viewport-fit=cover` but not `maximum-scale=1`.

## Known limitations

- The 3D scene is a canvas. Screen-reader users get the plate list, HUD and chart
  description, not a spatial model of the plate. This is intentional: the grid is
  the accessible representation.
- Keyboard users cannot raycast the 3D plate directly. They can add/remove/select
  everything from the pantry and plate list.
- The zone labels are canvas sprites; the HTML legend is the accessible source.
- The app has not had a formal WCAG 2.2 AA audit with VoiceOver/NVDA/JAWS. The
  browser suite checks names, labels, skip link and language, not full assistive
  technology behaviour.
- Emoji in food cards may be read as their Unicode names by some screen readers.
  The card's `aria-label` includes the food name and net carbs, which overrides
  the visible emoji for activation.
- Contrast is designed to be strong on the cream and dark surfaces, but the
  translucent in-scene labels and the faint micro-copy do not meet 4.5:1 in every
  state. Do not use them for essential information.
- The chart's visual grid is decorative; its aria-label carries the result.

## Testing it yourself

1. Tab from the top. The skip link should appear first.
2. Activate a food card with Enter/Space; listen for the announcement.
3. Open “Starch & processed watch-outs”; activate a warning; confirm focus lands
   in the dialog and Escape closes it.
4. Open the plate list and remove an item without touching the canvas.
5. Open the guide with `g`; cycle the filters with `1`–`7`.
6. Set the OS to reduce motion; reload; auto-rotate should be off and the chart
   should appear instantly.
7. Zoom to 200% at 390 px; confirm no horizontal scrolling.

Report accessibility issues through GitHub Issues with the assistive technology
and browser you used.
