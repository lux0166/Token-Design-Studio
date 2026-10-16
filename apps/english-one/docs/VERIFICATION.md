# Fluento verification

Verified locally on 2026-10-16. The app is an interactive design prototype, not a deployed or production-integrated service.

## Automated checks

- `npm test`: eight passing domain tests. Teacher overlap, learner overlap, adjacent slots, cancelled slots, invalid references/calendar dates/times/durations, end-of-day bounds, assessment updates without mutation, duplicate reviews, completed-session counts and optional bounded skill scores.
- `npm run build`: TypeScript project build plus Vite production bundle. Chart and Radix dependencies separated into reusable vendor chunks.
- Production preview on port 4174 rendered the overview and opened/dismissed the booking dialog successfully; no warning/error entries. The existing Token Studio suite also remained green: 11 passing tests.
- Token Studio MCP: exported `Fluento · Learning`, ID `59a2c492-daeb-4b2f-8d38-57a0e09e3723`. All seven standard light-mode text/background pairs passed WCAG AA; ratios 4.51–16.22, details in `token-studio.json`. This checks the configured pairs, not a full WCAG audit of every element.

## Browser journeys

Real Chromium through Codex in-app browser; desktop viewport 1536×1024 and mobile 390×844. Full-page desktop image includes below-fold content. Browser console inspection returned no warning/error entries for the final tested flows.

1. Booking: a Sarah/Minh Anh session at 08:20 collides with the 08:00–08:50 seed lesson. The form retained data and displayed the teacher conflict message. Changing to 13:00 saved the new lesson, displayed a success toast and rendered it in the schedule. Cancel required a second explicit action and changed its status to cancelled. Two test bookings remain as cancelled history in this browser.
2. Post-session assessment: reviewed the already-completed 08:00 lesson; saved comments, homework and speaking score 55. Minh Anh's profile reflected the new score, comments and chronological history, while the completed count stayed 14/24. The changes persisted after page reload. Existing reviews have read-only fields and no duplicate-submit action.
3. Students: an unmatched search displayed the empty state, and “Xóa bộ lọc” restored records. A duplicate email was rejected. A new sample learner Nguyễn Bảo An with a unique email was created and appeared in the list. Sample records added during testing remain local to this browser.
4. Teacher view: Sarah's dashboard showed her two original students and two active lessons for the selected day; the student table contained Minh Anh and Hoàng Nam. Later adding Bảo An increases Sarah's assigned sample student count to three. This is view filtering, not server authorization.
5. Teachers: Sarah's schedule action navigated to the schedule with Sarah selected in the teacher filter. Roadmap, tuition, resources and settings destinations rendered their respective content.
6. Resources: opened the actual Everyday Conversations content and downloaded its text file through the browser download event.
7. Mobile: menu drawer opened, selecting Students navigated and closed it; the table scrolled inside its region. The document had no unintended horizontal overflow (scrollWidth equalled clientWidth). Booking dialog bounds were within the 390×844 viewport; focus moved to the student selector, and Escape dismissed dialogs. The learner profile adapted to two summary columns and a single skill column with internal vertical scrolling.

## Visual evidence and intentional changes

- `concept.png`: generated design direction, not a user-provided reference to reproduce exactly.
- `dashboard-desktop.png`: final working overview at 1536px; `dashboard-mobile.png`: 390px view; `student-profile.png`: updated learner profile.
- Preserved the concept's white sidebar, four overview cards, lavender illustrated learning journey, session rows, care table and calendar/chart/task side column.
- The working app uses counts computed from its sample records instead of the concept's illustrative 48 students/12 sessions. The chart uses the average four skill scores of assessed learners instead of an invented six-week trend. New unassessed learners do not lower that skill average. Progress percentages mean completed sessions divided by total sessions.
- Browser screenshot capture initially used the host display scaling and clipped the viewport. Explicit CDP capture dimensions fixed the screenshot artifact; no application zoom or content was modified to produce the images.

## Remaining scope

Local storage only; no shared backend, real login/authorization, video room, automated reminders, payment processing, transaction ledger or AI. Roadmaps use a four-stage reference template with learner-specific goal/level context; there is no curriculum editor yet. Loading from a remote service cannot be tested because no remote service is integrated. Dark mode is exported in theme CSS but not exposed as a supported product mode. No claim of exact pixel equality or production readiness is made.
