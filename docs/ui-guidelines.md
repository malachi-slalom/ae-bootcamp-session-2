# UI Guidelines

This document defines the core UI guidelines for the TODO app.

## Design Direction

- Use Material components as the UI foundation for consistency, accessibility, and implementation speed.
- Apply a retro Windows 95 and corporate Metro aesthetic layer on top of Material primitives.
- Keep the interface functional, clean, and task-focused.

## Visual Principles

- Prioritize clarity over decoration: every visual element should support task management.
- Combine two visual influences intentionally:
  - Windows 95: beveled surfaces, sharp corners, subtle gray control panels, strong borders.
  - Corporate Metro: flat color blocks, bold section labels, simple iconography, high readability.
- Use restrained visual hierarchy so content (tasks) remains the primary focus.

## Layout

- Use a simple app-shell layout:
  - Top app bar with product name and global actions.
  - Main content region for task list and task controls.
  - Optional right-side or modal panel for task details/editing.
- Use an 8px spacing scale throughout.
- Keep primary actions visible without scrolling on common laptop viewport sizes.

## Color System

- Base palette should reflect retro enterprise software:
  - Neutrals: light gray backgrounds and medium gray surfaces.
  - Accent color: one strong corporate accent (for example, blue or teal) for key actions and focus states.
  - Semantic colors: success, warning, error for task states (done, due soon, overdue).
- Ensure color contrast meets WCAG AA for text and controls.
- Do not rely on color alone to communicate state; pair with icons or labels.

## Typography

- Use a readable sans-serif font stack suitable for UI density.
- Use compact but legible sizing:
  - App title: prominent.
  - Section headings: medium emphasis.
  - Task content: optimized for scanability.
- Avoid overly decorative fonts.

## Material Component Usage

- Preferred components:
  - `AppBar`, `Toolbar`, `Container`, `Paper`, `Card` for page structure.
  - `TextField`, `Select`, `Checkbox`, `Switch`, `Button`, `IconButton` for interaction.
  - `List`, `ListItem`, `Divider`, `Chip`, `Badge` for task display and metadata.
  - `Dialog`, `Drawer`, `Snackbar`, `Tooltip`, `Menu` for secondary workflows.
- Component behavior:
  - Use clear disabled, hover, focus, and active states.
  - Maintain consistent component sizes and spacing across screens.
  - Use `outlined` and `filled` variants intentionally; avoid mixing variants randomly in the same area.

## Retro Windows 95 and Metro Styling Rules

- Surfaces and controls:
  - Prefer square corners (`border-radius: 0` or very small radius).
  - Use subtle bevel effects for key controls and panels.
  - Use crisp 1px borders to separate regions.
- Task containers:
  - Present tasks in bordered rows or cards with clear separators.
  - Use compact density while preserving touch accessibility.
- Icons:
  - Use simple, geometric icons with consistent stroke weight.
- Shadows and depth:
  - Keep shadows minimal; rely more on borders and contrast than soft elevation.

## Task-Specific UI Behavior

- Task creation:
  - Provide an always-visible primary input for quick add.
  - Allow optional fields (due date, priority) via progressive disclosure.
- Task editing:
  - Support inline editing for quick changes when practical.
  - Use dialogs for multi-field edits to avoid clutter.
- Task ordering and grouping:
  - Visually separate incomplete and completed tasks.
  - Clearly label overdue tasks with both color and icon/text marker.

## Motion and Feedback

- Keep motion minimal and purposeful.
- Use short transitions for list updates, dialog open/close, and filter changes.
- Provide immediate feedback for key actions:
  - Task created/updated/deleted confirmation via snackbar.
  - Clear validation messages near the affected input.

## Accessibility and Responsiveness

- Accessibility:
  - Full keyboard navigability for all controls.
  - Visible focus indicators on interactive elements.
  - Proper labels and ARIA attributes for form fields and icon-only controls.
- Responsiveness:
  - Mobile-first behavior for task entry and list browsing.
  - Ensure controls remain usable on narrow screens.
  - Preserve action discoverability across desktop and mobile layouts.

## Consistency Rules

- Reuse component patterns for repeated actions (add, edit, complete, delete).
- Keep wording consistent in buttons, labels, and status text.
- Do not introduce new visual patterns unless they solve a clear usability problem.
