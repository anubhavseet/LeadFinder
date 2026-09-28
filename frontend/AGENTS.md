# Frontend Development & Design Guidelines

When creating, refactoring, or reviewing UI components and pages in `frontend/`:
- **Design Skills**:
  - Follow [`.agents/skills/frontend-design/SKILL.md`](../.agents/skills/frontend-design/SKILL.md) for distinctive visual direction, restraint, copywriting intentionality, and avoidance of AI template tells.
  - Follow [`.agents/skills/design-taste-frontend/SKILL.md`](../.agents/skills/design-taste-frontend/SKILL.md) for motion specs, responsive layout guardrails, and component interaction cycles.
- **Stack Awareness**: This project uses **Vite + React 18 + Tailwind CSS v3** (`tailwindcss: ^3.4.1`). Do NOT use Tailwind v4 syntax.
- **Dependency Guard**: Before importing external animation or UI libraries, verify `frontend/package.json` and ensure dependencies are installed.
- **Anti-Template Directives**:
  - Spend boldness in one memorable place; keep surrounding elements disciplined and quiet.
  - Avoid AI template chrome: no tracking-out ALL-CAPS eyebrows above every heading, no middle-dot strings (`A · B · C`), and no automatic `→` appended to every button.
  - No emojis in markup or UI copy; use clean SVG primitives or `@lucide-react`.
  - Use `min-h-[100dvh]` instead of `h-screen`.
  - Copy as design content: active voice ("Save changes", not "Submit"), plain verbs, zero filler, sentence case.
