# Service Design Refresh Design

## Goal

Refresh the current 곧나가요 interface so it feels like a polished mobile-first cafe utility: quick to use, warm on first impression, and clearer in the visitor and reporter flows.

## Approved Direction

The selected direction combines:

- Mobile app-like simplicity
- Warm cafe brand expression

The app should avoid a heavy marketing landing page. It should open like a practical service home where the two primary actions are immediately obvious: finding a cafe and reporting a soon-to-open seat.

## Visual System

- Use a light paper background rather than a saturated coffee palette.
- Use deep coffee text for hierarchy, emerald as the primary action color, amber for warm status highlights, and soft slate/stone neutrals for supporting information.
- Keep card radii restrained and avoid nested card-heavy compositions.
- Use lucide icons for action recognition, but keep icons secondary to the task.
- Keep text compact enough for repeated use on mobile.

## Landing Home

The first screen should act like an app home:

- Brand and concise value proposition at the top.
- A compact status strip that explains the service value without long instructional copy.
- Two large action panels:
  - `카페 갈래요`: visitor flow, visually primary.
  - `곧 나가요`: reporter flow, visually secondary but still prominent.
- The next section should remain slightly visible on common mobile viewports so the screen does not feel like a static poster.

## Visitor Flow

The visitor screen should prioritize search and decision-making:

- Header with back navigation, mode label, and title.
- Search panel placed near the top, with a large mobile-friendly input and button.
- Cafe list cards should be scannable, with selected state clearly visible.
- Selected cafe panel should show:
  - Cafe name and address
  - Summary message
  - Compact status metrics for active reports, leaving-soon reports, outlet seats, and waiting
  - Recent reports as simple rows with badges

## Reporter Flow

The reporter screen should feel like a short structured submission:

- Keep the same search and cafe selection pattern.
- Once a cafe is selected, show the selected cafe context first.
- Present report inputs in grouped sections with clear labels.
- Keep form controls large enough for thumb use.
- Preserve existing report fields and behavior.

## Scope

In scope:

- `client/src/App.tsx` layout and class updates
- `client/src/index.css` color tokens and global background polish
- Task board and work log updates

Out of scope:

- New backend behavior
- Authentication
- Maps
- New image assets
- Persistence changes
